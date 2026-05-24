import { 
  Controller, Get, Post, Body, Param, UseGuards, ParseIntPipe, Res, Req 
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { ProformasService } from './proformas.service';
import { PdfService } from './pdf.service';
import { CreateProformaDto, RegistrarPagoDto } from './dto/proformas.dto';

@Controller('proformas')
@UseGuards(AuthGuard('jwt'))
export class ProformasController {
  constructor(
    private readonly proformasService: ProformasService,
    private readonly pdfService: PdfService
  ) {}

  @Post()
  async create(@Body() createProformaDto: CreateProformaDto) {
    return this.proformasService.create(createProformaDto);
  }

  @Get()
  async findAll() {
    return this.proformasService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.proformasService.findOne(id);
  }

  @Post(':id/pagos')
  async registrarPago(
    @Param('id', ParseIntPipe) id: number,
    @Body() registrarPagoDto: RegistrarPagoDto,
    @Req() req: any
  ) {
    const usuarioId = req.user?.userId;
    return this.proformasService.registrarPago(id, registrarPagoDto, usuarioId);
  }

  @Get(':id/pdf')
  async generarPdf(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response
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
