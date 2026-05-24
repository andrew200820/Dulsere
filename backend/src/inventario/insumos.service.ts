import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInsumoDto, UpdateInsumoDto } from './dto/insumo.dto';

@Injectable()
export class InsumosService {
  constructor(private prisma: PrismaService) {}

  async create(createInsumoDto: CreateInsumoDto) {
    return this.prisma.insumo.create({
      data: createInsumoDto,
    });
  }

  async findAll() {
    // Solo listamos los insumos activos por defecto
    return this.prisma.insumo.findMany({
      where: { activo: true },
    });
  }

  async findOne(id: number) {
    const insumo = await this.prisma.insumo.findUnique({
      where: { id },
    });

    if (!insumo || !insumo.activo) {
      throw new NotFoundException(`Insumo con ID ${id} no encontrado.`);
    }

    return insumo;
  }

  async update(id: number, updateInsumoDto: UpdateInsumoDto) {
    await this.findOne(id); // Validar existencia e insumo activo

    return this.prisma.insumo.update({
      where: { id },
      data: updateInsumoDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Validar existencia

    // Borrado lógico
    return this.prisma.insumo.update({
      where: { id },
      data: { activo: false },
    });
  }
}
