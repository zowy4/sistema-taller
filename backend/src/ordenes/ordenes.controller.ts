import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrdenesService } from './ordenes.service';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { UpdateOrdenDto } from './dto/update-orden.dto';
import { UpdateEstadoOrdenDto } from './dto/update-estado-orden.dto';
// import { UseGuards } from '@nestjs/common';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { PermissionsGuard } from '../auth/permissions.guard';
// import { Permissions } from '../auth/permissions.decorator';

@Controller('ordenes')
// @UseGuards(JwtAuthGuard, PermissionsGuard)
export class OrdenesController {
  constructor(private readonly ordenesService: OrdenesService) {}

  // @Permissions('ordenes:create')
  @Post()
  create(@Body() createOrdenDto: CreateOrdenDto) {
    return this.ordenesService.create(createOrdenDto);
  }

  // @Permissions('ordenes:read')
  @Get()
  findAll() {
    return this.ordenesService.findAll();
  }

  // @Permissions('ordenes:read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordenesService.findOne(Number(id));
  }

  // @Permissions('ordenes:update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrdenDto: UpdateOrdenDto) {
    return this.ordenesService.update(Number(id), updateOrdenDto);
  }

  // Nuevo endpoint para cambiar solo el estado
  @Patch(':id/estado')
  updateEstado(@Param('id') id: string, @Body() updateEstadoDto: UpdateEstadoOrdenDto) {
    return this.ordenesService.updateEstado(Number(id), updateEstadoDto.estado);
  }

  // @Permissions('ordenes:delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordenesService.remove(Number(id));
  }
}
