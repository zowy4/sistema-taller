import {
  Controller,
  Get,
  Post,
  Body,
  Param, // 1. Importa Param para leer la URL
  ParseIntPipe, // 2. Importa ParseIntPipe para convertir el ID a número
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';

@Controller('clientes')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  /**
   * Ruta para CREAR un cliente
   * POST /clientes
   */
  @Post()
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.createClient(createClientDto);
  }

  /**
   * Ruta para LEER todos los clientes
   * GET /clientes
   */
  @Get()
  findAll() {
    return this.clientsService.getAllClients();
  }

  // --- ¡AQUÍ ESTÁ EL ENDPOINT CORREGIDO! ---
  /**
   * Ruta para LEER UN cliente por ID
   * GET /clientes/:id
   */
  @Get(':id') // 3. :id es un parámetro dinámico en la URL
  findOne(
    @Param('id', ParseIntPipe) id: number, // 4. @Param extrae el ID y ParseIntPipe lo convierte en número
  ) {
    // 5. Ahora esto sí funciona, porque 'getClientById' ya existe
  return this.clientsService.getClientById(id);
  }
}