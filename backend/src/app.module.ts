import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PublicModule } from './public/public.module';
import { InventarioModule } from './inventario/inventario.module';
import { ProformasModule } from './proformas/proformas.module';

@Module({
  imports: [
    // Configuración global de entorno
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    PublicModule,
    InventarioModule,
    ProformasModule,
  ],
})
export class AppModule {}
