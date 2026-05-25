import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UsuariosService } from './usuarios.service';
import {
  IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateDto {
  @IsEmail()    email: string;
  @IsString() @MinLength(6) password: string;
  @IsString() @IsNotEmpty() nombre: string;
  @IsNumber()  @Type(() => Number) roleId: number;
}

class UpdateDto {
  @IsOptional() @IsString() @IsNotEmpty() nombre?: string;
  @IsOptional() @IsEmail()                email?: string;
  @IsOptional() @IsNumber() @Type(() => Number) roleId?: number;
  @IsOptional() @IsString() @MinLength(6) password?: string;
}

@Controller('usuarios')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('Admin')
export class UsuariosController {
  constructor(private readonly service: UsuariosService) {}

  @Get()
  findAll() { return this.service.findAll(); }

  @Get('roles')
  findRoles() { return this.service.findRoles(); }

  @Post()
  create(@Body() dto: CreateDto) { return this.service.create(dto); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}