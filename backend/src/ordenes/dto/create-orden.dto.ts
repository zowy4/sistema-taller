import { IsInt, IsDateString, IsString, IsNumber, IsOptional, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
export class ServicioItemDto {
  @IsInt()
  id_servicio: number;
  @IsInt()
  @Min(1)
  cantidad: number;
}
export class RepuestoItemDto {
  @IsInt()
  id_repuesto: number;
  @IsInt()
  @Min(1)
  cantidad: number;
}
export class CreateOrdenDto {
  @IsInt()
  id_cliente: number;
  @IsInt()
  id_vehiculo: number;
  @IsOptional()
  @IsString()
  notas?: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServicioItemDto)
  servicios: ServicioItemDto[];
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RepuestoItemDto)
  repuestos: RepuestoItemDto[];
}
