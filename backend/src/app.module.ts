import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PublicModule } from './public/public.module';
import { InventarioModule } from './inventario/inventario.module';
import { ProformasModule } from './proformas/proformas.module';
import { UsuariosModule } from './usuarios/usuarios.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    PublicModule,
    InventarioModule,
    ProformasModule,
    UsuariosModule,
  ],
})
export class AppModule {}
