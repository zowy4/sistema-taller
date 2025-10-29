import { PartialType } from '@nestjs/mapped-types';
import { CreateClientDto } from './create-client.dto';

// UpdateClientDto hereda todas las propiedades de CreateClientDto,
// pero las marca todas como opcionales (con class-validator).
// Esto permite que el usuario envíe solo los campos que desea actualizar
// (ej. solo el "telefono" o solo el "email").
export class UpdateClientDto extends PartialType(CreateClientDto) {}