import {
  IsString, IsNotEmpty, IsNumber, IsPositive, IsOptional, IsBoolean, Min
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInsumoDto {
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre del insumo es requerido' })
  nombre: string;

  @IsString({ message: 'La unidad de medida debe ser texto' })
  @IsNotEmpty({ message: 'La unidad de medida es requerida (ej: g, ml, unidades)' })
  unidadMedida: string;

  @IsOptional()
  @IsNumber({}, { message: 'El stock actual debe ser un número' })
  @Min(0, { message: 'El stock actual no puede ser negativo' })
  @Type(() => Number)
  stockActual?: number = 0;

  @IsOptional()
  @IsNumber({}, { message: 'El stock mínimo debe ser un número' })
  @Min(0, { message: 'El stock mínimo no puede ser negativo' })
  @Type(() => Number)
  stockMinimo?: number = 0;

  @IsNumber({}, { message: 'El costo unitario debe ser un número' })
  @IsPositive({ message: 'El costo unitario debe ser mayor a 0' })
  @Type(() => Number)
  costoUnitario: number;
}

export class UpdateInsumoDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  unidadMedida?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  stockActual?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  stockMinimo?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  costoUnitario?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
