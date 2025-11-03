import { IsInt, IsDateString, IsString, IsNumber, IsOptional, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ServicioItemDto {
  @IsInt()
  id_servicio: number;

  @IsInt()
  @Min(1)
  cantidad: number;

  @IsNumber()
  @Min(0)
  precio_unitario: number;
}

export class RepuestoItemDto {
  @IsInt()
  id_repuesto: number;

  @IsInt()
  @Min(1)
  cantidad: number;

  @IsNumber()
  @Min(0)
  precio_unitario: number;
}

export class CreateOrdenDto {
  @IsInt()
  id_cliente: number;

  @IsInt()
  id_vehiculo: number;

  @IsInt()
  id_empleado_responsable: number;

  @IsDateString()
  fecha_entrega_estimada: string;

  @IsString()
  estado: string; // pendiente, en proceso, completada, etc.

  @IsNumber()
  @Min(0)
  total_estimado: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  total_real?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServicioItemDto)
  servicios: ServicioItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RepuestoItemDto)
  repuestos: RepuestoItemDto[];
}
