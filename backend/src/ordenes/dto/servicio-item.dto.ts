import { IsInt, IsNumber, Min } from 'class-validator';
export class ServicioItemDto {
  @IsInt()
  @Min(1)
  id_servicio: number;
  @IsInt()
  @Min(1)
  cantidad: number;
  @IsNumber()
  @Min(0)
  precio: number;
}
