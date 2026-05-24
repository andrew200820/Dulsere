import { Injectable, NotFoundException, GoneException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublicService {
  constructor(private prisma: PrismaService) {}

  async obtenerProformaPublica(token: string) {
    // Buscar la proforma por su token UUID único
    const proforma = await this.prisma.proforma.findUnique({
      where: { tokenAcceso: token },
      include: {
        cliente: {
          select: {
            nombre: true,
            telefono: true,
            email: true,
            direccionEntrega: true,
          }
        },
        detalles: {
          include: {
            producto: {
              select: {
                nombre: true,
                descripcion: true,
              }
            }
          }
        }
      }
    });

    // 1. Si no existe, devolver 404
    if (!proforma) {
      throw new NotFoundException('La proforma solicitada no existe.');
    }

    // 2. Si no está en estado 'Pendiente' o 'Definitiva', no permitir visualizarla públicamente
    if (proforma.estado !== 'Pendiente' && proforma.estado !== 'Definitiva') {
      throw new NotFoundException('Esta proforma ya no está disponible para visualización pública.');
    }

    // 3. Validar antigüedad de 15 días
    const fechaEmision = new Date(proforma.fechaEmision);
    const ahora = new Date();
    
    // Cálculo de la diferencia en días
    const diferenciaMilisegundos = ahora.getTime() - fechaEmision.getTime();
    const diferenciaDias = diferenciaMilisegundos / (1000 * 60 * 60 * 24);

    if (diferenciaDias > 15) {
      throw new GoneException('La proforma ha caducado. Los enlaces públicos expiran después de 15 días.');
    }

    // Devolver la proforma estructurada
    return {
      id: proforma.id,
      estado: proforma.estado,
      fechaEmision: proforma.fechaEmision,
      fechaEntrega: proforma.fechaEntrega,
      cliente: proforma.cliente,
      productos: proforma.detalles.map(d => ({
        nombre: d.producto.nombre,
        descripcion: d.producto.descripcion,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario,
        subtotal: d.subtotal
      })),
      valores: {
        subtotal: proforma.subtotal,
        descuento: proforma.descuento,
        motivoDescuento: proforma.motivoDescuento,
        porcentajeIva: proforma.porcentajeIva,
        montoIva: proforma.montoIva,
        total: proforma.total
      },
      urlPrevisualizacionIa: proforma.urlPrevisualizacionIa
    };
  }
}
