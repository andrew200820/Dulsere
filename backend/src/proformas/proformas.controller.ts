import {
  Controller, Get, Post, Patch, Body, Param, UseGuards, ParseIntPipe, Res, Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { IsString, IsNotEmpty, IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ProformasService } from './proformas.service';
import { PdfService } from './pdf.service';
import { CreateProformaDto, RegistrarPagoDto } from './dto/proformas.dto';

class CambiarEstadoDto {
  @IsString() @IsNotEmpty()
  estado: string;
}

class AiPreviewItemDto {
  @IsString() @IsNotEmpty()
  nombre: string;

  @IsNumber() @Type(() => Number)
  cantidad: number;
}

class AiPreviewDto {
  @IsArray()
  @Type(() => AiPreviewItemDto)
  items: AiPreviewItemDto[];
}

@Controller('proformas')
@UseGuards(AuthGuard('jwt'))
export class ProformasController {
  constructor(
    private readonly proformasService: ProformasService,
    private readonly pdfService: PdfService,
  ) {}

  @Post()
  async create(@Body() createProformaDto: CreateProformaDto) {
    return this.proformasService.create(createProformaDto);
  }

  @Get()
  async findAll() {
    return this.proformasService.findAll();
  }

  // ai-preview debe ir ANTES de :id para evitar conflicto de rutas
  @Post('ai-preview')
  async aiPreview(@Body() dto: AiPreviewDto) {
    return this.proformasService.generarPreview(dto.items);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.proformasService.findOne(id);
  }

  @Patch(':id/estado')
  async cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CambiarEstadoDto,
  ) {
    return this.proformasService.cambiarEstado(id, dto.estado);
  }

  @Post(':id/pagos')
  async registrarPago(
    @Param('id', ParseIntPipe) id: number,
    @Body() registrarPagoDto: RegistrarPagoDto,
    @Req() req: any,
  ) {
    const usuarioId = req.user?.userId;
    return this.proformasService.registrarPago(id, registrarPagoDto, usuarioId);
  }

  @Get(':id/pdf')
  async generarPdf(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const proforma = await this.proformasService.findOne(id);
    const pdfBuffer = await this.pdfService.generarPdfProforma(proforma);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=proforma_000${id}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    return res.end(pdfBuffer);
  }
}