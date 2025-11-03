import { IsEnum } from 'class-validator';

export class UpdateEstadoOrdenDto {
  @IsEnum(['pendiente', 'en_proceso', 'completado', 'entregado', 'cancelado'])
  estado: string;
}
