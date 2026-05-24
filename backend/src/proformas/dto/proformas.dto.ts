import {
  IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min, IsArray, ValidateNested, IsDateString, IsIn
} from 'class-validator';
import { Type } from 'class-transformer';

export class DetalleProformaDto {
  @IsNumber({}, { message: 'El ID del producto debe ser un número' })
  @IsNotEmpty({ message: 'El ID del producto es requerido' })
  productoId: number;

  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @IsPositive({ message: 'La cantidad debe ser mayor a 0' })
  cantidad: number;
}

export class CreateProformaDto {
  @IsNumber({}, { message: 'El ID del cliente debe ser un número' })
  @IsNotEmpty({ message: 'El ID del cliente es requerido' })
  clienteId: number;

  @IsDateString({}, { message: 'La fecha de entrega debe ser un formato de fecha válido' })
  @IsNotEmpty({ message: 'La fecha de entrega es requerida' })
  fechaEntrega: string;

  @IsOptional()
  @IsNumber({}, { message: 'El descuento debe ser un número' })
  @Min(0, { message: 'El descuento no puede ser negativo' })
  @Type(() => Number)
  descuento?: number = 0;

  @IsOptional()
  @IsString({ message: 'El motivo del descuento debe ser texto' })
  motivoDescuento?: string;

  @IsOptional()
  @IsNumber({}, { message: 'El porcentaje de IVA debe ser un número' })
  @Min(0, { message: 'El porcentaje de IVA no puede ser negativo' })
  @Type(() => Number)
  porcentajeIva?: number = 12.00; // Impuesto base de 12% por defecto

  @IsArray({ message: 'Los detalles de la proforma deben ser un arreglo' })
  @ValidateNested({ each: true })
  @Type(() => DetalleProformaDto)
  detalles: DetalleProformaDto[];
}

export class RegistrarPagoDto {
  @IsNumber({}, { message: 'El monto del pago debe ser un número' })
  @IsPositive({ message: 'El monto del pago debe ser mayor a 0' })
  @Type(() => Number)
  monto: number;

  @IsString({ message: 'El método de pago debe ser texto' })
  @IsNotEmpty({ message: 'El método de pago es requerido (ej: Transferencia, Efectivo)' })
  metodoPago: string;

  @IsOptional()
  @IsString({ message: 'La referencia debe ser texto' })
  referencia?: string;

  @IsString({ message: 'El tipo de pago debe ser texto' })
  @IsNotEmpty({ message: 'El tipo de pago es requerido' })
  @IsIn(['Anticipo', 'Saldo_Cierre', 'Completo'], {
    message: 'El tipo de pago debe ser: Anticipo, Saldo_Cierre o Completo'
  })
  tipoPago: string;
}
