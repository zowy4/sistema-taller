import { IsInt, IsNumber, Min } from 'class-validator';
export class RepuestoItemDto {
  @IsInt()
  @Min(1)
  id_repuesto: number;
  @IsInt()
  @Min(1)
  cantidad: number;
  @IsNumber()
  @Min(0)
  precio_unitario: number;
}
