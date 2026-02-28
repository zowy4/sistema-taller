import { Exclude } from 'class-transformer';

export class ClienteResponseDto {
  id_cliente: number;
  nombre: string;
  apellido: string;
  empresa?: string;
  telefono: string;
  email: string;

  @Exclude()
  password?: string;

  direccion: string;
  fecha_alta: Date;

  rol?: string;
  permissions?: string[];
  _type?: string;
}
