import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { VehiculosService } from './vehiculos.service';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('vehiculos')
@UseGuards(AuthGuard('jwt'))
export class VehiculosController {
  constructor(private readonly vehiculosService: VehiculosService) {}

  @Post()
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('admin', 'supervisor', 'recepcion')
  @RequirePermissions('vehiculos:create')
  create(@Body() createVehiculoDto: CreateVehiculoDto) {
    return this.vehiculosService.create(createVehiculoDto);
  }

  @Get()
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('admin', 'supervisor', 'tecnico', 'recepcion')
  @RequirePermissions('vehiculos:read')
  findAll() {
    return this.vehiculosService.findAll();
  }

  @Get(':id')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('admin', 'supervisor', 'tecnico', 'recepcion')
  @RequirePermissions('vehiculos:read')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.vehiculosService.findOne(id);
  }

  @Get(':id/historial')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('admin', 'supervisor', 'tecnico', 'recepcion')
  @RequirePermissions('vehiculos:read')
  getHistorial(@Param('id', ParseIntPipe) id: number) {
    return this.vehiculosService.getHistorial(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('admin', 'supervisor', 'recepcion')
  @RequirePermissions('vehiculos:update')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateVehiculoDto) {
    return this.vehiculosService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('admin')
  @RequirePermissions('vehiculos:delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.vehiculosService.remove(id);
  }
}
