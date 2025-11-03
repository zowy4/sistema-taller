import { IsNumber, IsNotEmpty } from 'class-validator';

export class AdjustStockDto {
  @IsNumber()
  @IsNotEmpty()
  cantidad: number; // Puede ser positivo (entrada) o negativo (salida)
}
