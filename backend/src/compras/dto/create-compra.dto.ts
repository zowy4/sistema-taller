import { 
  IsInt, 
  IsString, 
  IsNumber, 
  IsOptional, 
  IsArray, 
  ValidateNested,
  ArrayMinSize,
  Min 
} from 'class-validator';
import { Type } from 'class-transformer';
import { RepuestoCompraDto } from './repuesto-compra.dto';

export class CreateCompraDto {
  @IsInt()
  @Min(1)
  id_proveedor: number;

  @IsNumber()
  @Min(0)
  total: number;

  @IsOptional()
  @IsString()
  estado?: string; // 'completada', 'pendiente', 'cancelada'

  @IsOptional()
  @IsString()
  notas?: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Debe incluir al menos un repuesto en la compra' })
  @ValidateNested({ each: true })
  @Type(() => RepuestoCompraDto)
  repuestos: RepuestoCompraDto[];
}
