import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

export interface CreateUsuarioDto {
  email: string;
  password: string;
  nombre: string;
  roleId: number;
}

export interface UpdateUsuarioDto {
  nombre?: string;
  email?: string;
  roleId?: number;
  password?: string;
}

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.usuario.findMany({
      select: {
        id: true,
        email: true,
        nombre: true,
        roleId: true,
        createdAt: true,
        role: { select: { id: true, nombre: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  findRoles() {
    return this.prisma.role.findMany({ orderBy: { id: 'asc' } });
  }

  async create(dto: CreateUsuarioDto) {
    const exists = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Ya existe un usuario con ese correo.');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.usuario.create({
      data: { email: dto.email, passwordHash, nombre: dto.nombre, roleId: dto.roleId },
      select: {
        id: true, email: true, nombre: true, roleId: true, createdAt: true,
        role: { select: { id: true, nombre: true } },
      },
    });
  }

  async update(id: string, dto: UpdateUsuarioDto) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado.');

    if (dto.email && dto.email !== usuario.email) {
      const exists = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
      if (exists) throw new ConflictException('Ya existe un usuario con ese correo.');
    }

    const data: Record<string, unknown> = {};
    if (dto.nombre)   data.nombre = dto.nombre;
    if (dto.email)    data.email  = dto.email;
    if (dto.roleId)   data.roleId = dto.roleId;
    if (dto.password) data.passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.usuario.update({
      where: { id },
      data,
      select: {
        id: true, email: true, nombre: true, roleId: true, createdAt: true,
        role: { select: { id: true, nombre: true } },
      },
    });
  }

  async remove(id: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado.');
    await this.prisma.usuario.delete({ where: { id } });
    return { message: 'Usuario eliminado.' };
  }
}