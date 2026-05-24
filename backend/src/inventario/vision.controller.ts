import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VisionService } from './vision.service';
import { IsNotEmpty, IsString } from 'class-validator';

class AuditarImagenDto {
  @IsString({ message: 'La imagen debe ser una cadena Base64' })
  @IsNotEmpty({ message: 'La imagen en formato Base64 es requerida' })
  imagen: string;
}

@Controller('inventario/vision')
@UseGuards(AuthGuard('jwt'))
export class VisionController {
  constructor(private readonly visionService: VisionService) {}

  @Post()
  async auditarImagen(@Body() auditarImagenDto: AuditarImagenDto) {
    return this.visionService.auditarInsumosImagen(auditarImagenDto.imagen);
  }
}
