import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Patch,
  Delete,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
@Controller('clientes')
@UseGuards(AuthGuard('jwt'))
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}
  @Post()
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('admin', 'supervisor', 'recepcion')
  @RequirePermissions('clientes:create')
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.createClient(createClientDto);
  }
  @Get()
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('admin', 'supervisor', 'recepcion')
  @RequirePermissions('clientes:read')
  findAll() {
    return this.clientsService.getAllClients();
  }
  @Get(':id')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('admin', 'supervisor', 'tecnico', 'recepcion')
  @RequirePermissions('clientes:read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientsService.getClientById(id);
  }
  @Patch(':id')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('admin', 'supervisor', 'recepcion')
  @RequirePermissions('clientes:update')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateClientDto: UpdateClientDto) {
    return this.clientsService.updateClient(id, updateClientDto);
  }
  @Delete(':id')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('admin')
  @RequirePermissions('clientes:delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.clientsService.deleteClient(id);
  }
}
