import { PartialType } from '@nestjs/mapped-types';
import { CreateEmpleadoDto } from './create-empleado.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';
export class UpdateEmpleadoDto extends PartialType(CreateEmpleadoDto) {
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;
}
