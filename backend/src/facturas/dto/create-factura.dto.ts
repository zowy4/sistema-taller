import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';

export class CreateFacturaDto {
  @IsNumber()
  id_orden: number;

  @IsNumber()
  monto: number;

  @IsEnum(['pagada', 'pendiente'])
  @IsOptional()
  estado_pago?: string;

  @IsString()
  @IsOptional()
  metodo_pago?: string;
}
