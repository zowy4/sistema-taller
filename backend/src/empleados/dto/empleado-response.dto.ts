import { Exclude } from 'class-transformer';

export class EmpleadoResponseDto {
  id_empleado: number;
  nombre: string;
  apellido: string;
  email?: string;

  @Exclude()
  password?: string;

  rol: string;
  fecha_ingreso: Date;
  activo: boolean;
  direccion?: string;
  telefono?: string;

  permissions?: string[];
  _type?: string;
  id?: number;
}
