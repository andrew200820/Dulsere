import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductoDto, UpdateProductoDto } from './dto/producto.dto';

@Injectable()
export class ProductosService {
  constructor(private prisma: PrismaService) {}

  async create(createProductoDto: CreateProductoDto) {
    const { receta, ...productoData } = createProductoDto;

    if (!receta || receta.length === 0) {
      throw new BadRequestException('La receta (BOM) debe incluir al menos un insumo.');
    }

    // Ejecutar en una transacción atómica
    return this.prisma.$transaction(async (tx) => {
      // 1. Crear el producto
      const producto = await tx.producto.create({
        data: productoData,
      });

      // 2. Registrar los insumos asociados en recetas_bom
      for (const item of receta) {
        // Verificar que el insumo exista y esté activo
        const insumo = await tx.insumo.findUnique({
          where: { id: item.insumoId },
        });

        if (!insumo || !insumo.activo) {
          throw new BadRequestException(`El insumo con ID ${item.insumoId} no existe o no está activo.`);
        }

        await tx.recetaBom.create({
          data: {
            productoId: producto.id,
            insumoId: item.insumoId,
            cantidadRequerida: item.cantidadRequerida,
          },
        });
      }

      // Devolver producto creado con su receta
      return tx.producto.findUnique({
        where: { id: producto.id },
        include: {
          recetas: {
            include: {
              insumo: {
                select: {
                  nombre: true,
                  unidadMedida: true,
                  costoUnitario: true
                }
              }
            }
          }
        }
      });
    });
  }

  async findAll() {
    return this.prisma.producto.findMany({
      where: { activo: true },
      include: {
        recetas: {
          include: {
            insumo: {
              select: {
                id: true,
                nombre: true,
                unidadMedida: true,
                costoUnitario: true
              }
            }
          }
        }
      }
    });
  }

  async findOne(id: number) {
    const producto = await this.prisma.producto.findUnique({
      where: { id },
      include: {
        recetas: {
          include: {
            insumo: {
              select: {
                id: true,
                nombre: true,
                unidadMedida: true,
                costoUnitario: true
              }
            }
          }
        }
      }
    });

    if (!producto || !producto.activo) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado.`);
    }

    return producto;
  }

  async update(id: number, updateProductoDto: UpdateProductoDto) {
    await this.findOne(id); // Validar existencia

    const { receta, ...productoData } = updateProductoDto;

    return this.prisma.$transaction(async (tx) => {
      // 1. Actualizar datos básicos
      const producto = await tx.producto.update({
        where: { id },
        data: productoData,
      });

      // 2. Si se proporciona una nueva receta, reemplazarla por completo
      if (receta) {
        if (receta.length === 0) {
          throw new BadRequestException('La receta (BOM) debe incluir al menos un insumo.');
        }

        // Eliminar receta anterior
        await tx.recetaBom.deleteMany({
          where: { productoId: id },
        });

        // Insertar nueva receta
        for (const item of receta) {
          const insumo = await tx.insumo.findUnique({
            where: { id: item.insumoId },
          });

          if (!insumo || !insumo.activo) {
            throw new BadRequestException(`El insumo con ID ${item.insumoId} no existe o no está activo.`);
          }

          await tx.recetaBom.create({
            data: {
              productoId: id,
              insumoId: item.insumoId,
              cantidadRequerida: item.cantidadRequerida,
            },
          });
        }
      }

      // Devolver producto actualizado
      return tx.producto.findUnique({
        where: { id },
        include: {
          recetas: {
            include: {
              insumo: {
                select: {
                  id: true,
                  nombre: true,
                  unidadMedida: true,
                  costoUnitario: true
                }
              }
            }
          }
        }
      });
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Validar existencia

    // Borrado lógico
    return this.prisma.producto.update({
      where: { id },
      data: { activo: false },
    });
  }
}
