import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
export class CreateRepuestoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;
  @IsString()
  @IsNotEmpty()
  codigo: string;
  @IsString()
  @IsOptional()
  descripcion?: string;
  @IsString()
  @IsNotEmpty()
  unidad_medida: string;
  @IsNumber()
  @Min(0)
  stock_actual: number;
  @IsNumber()
  @Min(0)
  stock_minimo: number;
  @IsNumber()
  @Min(0)
  precio_compra: number;
  @IsNumber()
  @Min(0)
  precio_venta: number;
}
