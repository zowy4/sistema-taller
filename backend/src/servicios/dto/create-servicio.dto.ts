import { IsString, IsOptional, IsNumber, Min, IsBoolean, IsInt } from 'class-validator';
export class CreateServicioDto {
  @IsString()
  nombre: string;
  @IsOptional()
  @IsString()
  descripcion?: string;
  @IsNumber()
  @Min(0)
  precio: number;
  @IsOptional()
  @IsInt()
  @Min(1)
  tiempo_estimado?: number; 
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
