import { IsString, IsOptional, IsNumber, Min, IsBoolean } from 'class-validator';

export class CreateServicioDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsNumber()
  @Min(0)
  precio_estandar: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
