import { Module } from '@nestjs/common';
import { InsumosService } from './insumos.service';
import { InsumosController } from './insumos.controller';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { VisionService } from './vision.service';
import { VisionController } from './vision.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [
    InsumosController,
    ProductosController,
    VisionController
  ],
  providers: [
    InsumosService,
    ProductosService,
    VisionService
  ],
  exports: [
    InsumosService,
    ProductosService,
    VisionService
  ]
})
export class InventarioModule {}
