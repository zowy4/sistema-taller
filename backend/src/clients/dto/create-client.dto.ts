import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  apellido: string;

  @IsString()
  @IsOptional() // Este campo es opcional
  empresa?: string;

  @IsString()
  @IsNotEmpty()
  telefono: string;

  @IsEmail() // Valida que sea un email correcto
  email: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsNotEmpty()
  direccion: string;
}