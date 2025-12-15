import { IsEnum } from 'class-validator';
export class UpdateEstadoOrdenDto {
  @IsEnum(['pendiente', 'en_proceso', 'completado', 'completada', 'entregado', 'cancelado', 'cancelada'])
  estado: string;
}
