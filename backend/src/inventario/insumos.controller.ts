import { 
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe 
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InsumosService } from './insumos.service';
import { CreateInsumoDto, UpdateInsumoDto } from './dto/insumo.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('inventario/insumos')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('Admin', 'Inventario')
export class InsumosController {
  constructor(private readonly insumosService: InsumosService) {}

  @Post()
  async create(@Body() createInsumoDto: CreateInsumoDto) {
    return this.insumosService.create(createInsumoDto);
  }

  @Get()
  async findAll() {
    return this.insumosService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.insumosService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateInsumoDto: UpdateInsumoDto
  ) {
    return this.insumosService.update(id, updateInsumoDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.insumosService.remove(id);
  }
}
