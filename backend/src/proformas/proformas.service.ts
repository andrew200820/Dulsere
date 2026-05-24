import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CalendarService } from './calendar.service';
import { CreateProformaDto, RegistrarPagoDto } from './dto/proformas.dto';

@Injectable()
export class ProformasService {
  constructor(
    private prisma: PrismaService,
    private calendarService: CalendarService,
  ) {}

  async create(createProformaDto: CreateProformaDto) {
    const { clienteId, fechaEntrega, descuento, motivoDescuento, porcentajeIva, detalles } = createProformaDto;

    if (!detalles || detalles.length === 0) {
      throw new BadRequestException('La proforma debe incluir al menos un producto.');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Validar que el cliente exista
      const cliente = await tx.cliente.findUnique({
        where: { id: clienteId },
      });
      if (!cliente) {
        throw new NotFoundException(`Cliente con ID ${clienteId} no encontrado.`);
      }

      // 2. Calcular montos detallados
      let subtotalAcumulado = 0;
      const detallesInsertData = [];

      for (const item of detalles) {
        const producto = await tx.producto.findUnique({
          where: { id: item.productoId },
        });

        if (!producto || !producto.activo) {
          throw new NotFoundException(`Producto con ID ${item.productoId} no encontrado o inactivo.`);
        }

        const precioUnitario = Number(producto.precioVenta);
        const itemSubtotal = item.cantidad * precioUnitario;
        subtotalAcumulado += itemSubtotal;

        detallesInsertData.push({
          productoId: item.productoId,
          cantidad: item.cantidad,
          precioUnitario: precioUnitario,
          subtotal: itemSubtotal,
        });
      }

      // 3. Aplicar descuentos y calcular impuestos
      const descuentoFinal = Number(descuento || 0);
      if (descuentoFinal > subtotalAcumulado) {
        throw new BadRequestException('El descuento no puede ser mayor al subtotal de los productos.');
      }

      const baseImponible = subtotalAcumulado - descuentoFinal;
      const ivaPorcentaje = Number(porcentajeIva || 0);
      const montoIva = baseImponible * (ivaPorcentaje / 100);
      const totalFinal = baseImponible + montoIva;

      // 4. Crear la proforma en la base de datos (el token_acceso UUID se genera por defecto en la DB)
      return tx.proforma.create({
        data: {
          clienteId,
          fechaEntrega: new Date(fechaEntrega),
          subtotal: subtotalAcumulado,
          descuento: descuentoFinal,
          motivoDescuento,
          porcentajeIva: ivaPorcentaje,
          montoIva,
          total: totalFinal,
          estado: 'Pendiente', // Estado inicial obligatorio
          detalles: {
            create: detallesInsertData,
          },
        },
        include: {
          cliente: true,
          detalles: {
            include: {
              producto: true,
            },
          },
        },
      });
    });
  }

  async findAll() {
    return this.prisma.proforma.findMany({
      include: {
        cliente: true,
        detalles: {
          include: {
            producto: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const proforma = await this.prisma.proforma.findUnique({
      where: { id },
      include: {
        cliente: true,
        detalles: {
          include: {
            producto: true,
          },
        },
        pagos: true,
        eventoCalendario: true,
      },
    });

    if (!proforma) {
      throw new NotFoundException(`Proforma con ID ${id} no encontrada.`);
    }

    return proforma;
  }

  async registrarPago(proformaId: number, registrarPagoDto: RegistrarPagoDto, usuarioId?: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Validar existencia de proforma
      const proforma = await tx.proforma.findUnique({
        where: { id: proformaId },
        include: {
          cliente: true,
          pagos: true,
          detalles: {
            include: {
              producto: true,
            },
          },
        },
      });

      if (!proforma) {
        throw new NotFoundException(`Proforma con ID ${proformaId} no encontrada.`);
      }

      if (proforma.estado === 'Cerrada') {
        throw new BadRequestException('No se pueden registrar pagos en una proforma ya cerrada.');
      }

      // 2. Insertar el pago
      await tx.pagoAnticipo.create({
        data: {
          proformaId,
          monto: registrarPagoDto.monto,
          tipoPago: registrarPagoDto.tipoPago,
          metodoPago: registrarPagoDto.metodoPago,
          referencia: registrarPagoDto.referencia,
          usuarioId: usuarioId || null,
        },
      });

      // 3. Sumar pagos acumulados
      const pagosHistoricos = await tx.pagoAnticipo.findMany({
        where: { proformaId },
      });

      const totalAbonado = pagosHistoricos.reduce((sum, p) => sum + Number(p.monto), 0);
      const totalRequeridoDefinitiva = Number(proforma.total) * 0.50;

      // 4. Si es 'Pendiente' y la suma supera el 50%, transicionar a 'Definitiva'
      if (proforma.estado === 'Pendiente' && totalAbonado >= totalRequeridoDefinitiva) {
        await this.ejecutarTransicionADefinitiva(proforma, tx, usuarioId);
      }

      // Retornar la proforma actualizada
      return tx.proforma.findUnique({
        where: { id: proformaId },
        include: {
          cliente: true,
          detalles: {
            include: {
              producto: true,
            },
          },
          pagos: true,
          eventoCalendario: true,
        },
      });
    });
  }

  private async ejecutarTransicionADefinitiva(proforma: any, tx: any, usuarioId?: string) {
    // 1. Cambiar estado de la proforma
    await tx.proforma.update({
      where: { id: proforma.id },
      data: { estado: 'Definitiva' },
    });

    // 2. Descontar Inventario según Receta (BOM)
    for (const det of proforma.detalles) {
      // Buscar la receta de este producto
      const recetas = await tx.recetaBom.findMany({
        where: { productoId: det.productoId },
        include: { insumo: true },
      });

      for (const receta of recetas) {
        const totalRequerido = det.cantidad * Number(receta.cantidadRequerida);
        const insumo = await tx.insumo.findUnique({
          where: { id: receta.insumoId },
        });

        if (!insumo || !insumo.activo) {
          throw new BadRequestException(
            `El insumo '${receta.insumo.nombre}' requerido por la receta no está disponible.`
          );
        }

        const stockActual = Number(insumo.stockActual);
        if (stockActual < totalRequerido) {
          throw new BadRequestException(
            `Stock insuficiente del insumo '${insumo.nombre}'. Stock disponible: ${stockActual} ${insumo.unidadMedida}, requerido: ${totalRequerido} ${insumo.unidadMedida}.`
          );
        }

        // Restar el stock
        await tx.insumo.update({
          where: { id: receta.insumoId },
          data: {
            stockActual: {
              decrement: totalRequerido,
            },
          },
        });

        // Registrar el movimiento de salida
        await tx.movimientoInventario.create({
          data: {
            insumoId: receta.insumoId,
            tipoMovimiento: 'SALIDA',
            cantidad: totalRequerido,
            motivo: `Descuento automático BOM - Proforma Definitiva #${proforma.id}`,
            usuarioId: usuarioId || null,
          },
        });
      }
    }

    // 3. Logística: Crear evento en Google Calendar
    try {
      const googleCalendarId = await this.calendarService.crearEventoMock(
        proforma.id,
        proforma.fechaEntrega,
        proforma.cliente.nombre,
        proforma.cliente.direccionEntrega
      );

      // Guardar evento de calendario en BD
      await tx.eventoCalendario.create({
        data: {
          proformaId: proforma.id,
          googleCalendarEventId: googleCalendarId,
          titulo: `Entrega Dulsere: Proforma #${proforma.id} - ${proforma.cliente.nombre}`,
          descripcion: `Entrega de pedido para el cliente ${proforma.cliente.nombre}. Telf: ${proforma.cliente.telefono}`,
          fechaInicio: proforma.fechaEntrega,
          fechaFin: new Date(new Date(proforma.fechaEntrega).getTime() + 60 * 60 * 1000), // 1 hora estimado
          sincronizado: true,
        },
      });
    } catch (calendarError) {
      // Manejo seguro del API externo: logueamos el error pero no bloqueamos la transacción principal
      console.error(
        `Error al crear evento de Google Calendar para la proforma #${proforma.id}:`,
        calendarError
      );
    }
  }
}
