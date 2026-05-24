import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { PublicService } from './public.service';

@Controller('public/proformas')
export class PublicController {
  constructor(private publicService: PublicService) {}

  @Get(':token')
  async obtenerProformaPublica(
    @Param('token', new ParseUUIDPipe({ version: '4', message: 'El token de acceso debe ser un UUID v4 válido' })) 
    token: string
  ) {
    return this.publicService.obtenerProformaPublica(token);
  }
}
