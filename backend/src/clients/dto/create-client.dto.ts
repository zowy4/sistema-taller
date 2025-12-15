import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;
  @IsString()
  @IsNotEmpty()
  apellido: string;
  @IsString()
  @IsOptional() 
  empresa?: string;
  @IsString()
  @IsNotEmpty()
  telefono: string;
  @IsEmail() 
  email: string;
  @IsString()
  @IsOptional()
  password?: string;
  @IsString()
  @IsNotEmpty()
  direccion: string;
}
