import { IsString, IsEmail, IsOptional, IsBoolean } from 'class-validator';

export class CreateProveedorDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  empresa?: string;

  @IsString()
  telefono: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
