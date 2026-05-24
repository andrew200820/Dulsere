import {
  IsString, IsNotEmpty, IsNumber, IsPositive, IsOptional, IsArray, ValidateNested, Min
} from 'class-validator';
import { Type } from 'class-transformer';

export class RecetaItemDto {
  @IsNumber({}, { message: 'El ID del insumo debe ser un número' })
  @IsNotEmpty({ message: 'El ID del insumo es requerido' })
  insumoId: number;

  @IsNumber({}, { message: 'La cantidad requerida debe ser un número' })
  @IsPositive({ message: 'La cantidad requerida debe ser mayor a 0' })
  @Type(() => Number)
  cantidadRequerida: number;
}

export class CreateProductoDto {
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre del producto es requerido' })
  nombre: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  descripcion?: string;

  @IsNumber({}, { message: 'El precio de venta debe ser un número' })
  @Min(0, { message: 'El precio de venta no puede ser negativo' })
  @Type(() => Number)
  precioVenta: number;

  @IsArray({ message: 'La receta debe ser un arreglo de insumos (BOM)' })
  @ValidateNested({ each: true })
  @Type(() => RecetaItemDto)
  receta: RecetaItemDto[];
}

export class UpdateProductoDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  precioVenta?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecetaItemDto)
  receta?: RecetaItemDto[];
}
