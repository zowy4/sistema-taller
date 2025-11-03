import { IsString, IsInt, Min, Max, IsNotEmpty } from 'class-validator';

export class CreateVehiculoDto {
  @IsString()
  @IsNotEmpty()
  placa: string;

  @IsString()
  @IsNotEmpty()
  vin: string;

  @IsString()
  @IsNotEmpty()
  marca: string;

  @IsString()
  @IsNotEmpty()
  modelo: string;

  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  anio: number;

  @IsInt()
  @Min(1)
  id_cliente: number;
}
