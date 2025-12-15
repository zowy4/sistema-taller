import { IsString, IsEmail, IsEnum, IsOptional, MinLength } from 'class-validator';
export class CreateEmpleadoDto {
  @IsString()
  nombre: string;
  @IsString()
  apellido: string;
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(6)
  password: string;
  @IsString()
  telefono: string;
  @IsString()
  @IsOptional()
  direccion?: string;
  @IsEnum(['admin', 'supervisor', 'tecnico', 'recepcionista'])
  rol: string;
  @IsEnum(['activo', 'inactivo'])
  @IsOptional()
  estado?: string;
}
