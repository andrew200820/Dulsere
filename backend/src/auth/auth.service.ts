import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Verificar contraseña usando bcrypt
    const match = await bcrypt.compare(pass, usuario.passwordHash);
    if (!match) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // Retornar perfil sin la contraseña
    const { passwordHash, ...result } = usuario;
    return result;
  }

  async login(user: any) {
    const payload = { 
      sub: user.id, 
      email: user.email, 
      roleId: user.roleId,
      roleName: user.role.nombre 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.role.nombre,
      }
    };
  }
}
