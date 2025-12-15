import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { OrdenesService } from './ordenes.service';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { UpdateOrdenDto } from './dto/update-orden.dto';
import { UpdateEstadoOrdenDto } from './dto/update-estado-orden.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
@Controller('ordenes')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class OrdenesController {
  constructor(private readonly ordenesService: OrdenesService) {}
  @Post()
  @Roles('admin', 'supervisor', 'recepcion')
  create(@Body() createOrdenDto: CreateOrdenDto) {
    return this.ordenesService.create(createOrdenDto);
  }
  @Get()
  @Roles('admin', 'supervisor', 'tecnico', 'recepcion')
  findAll() {
    return this.ordenesService.findAll();
  }
  @Get('tecnico/mis-ordenes')
  @Roles('tecnico')
  findMyOrders(@Request() req) {
    return this.ordenesService.findByTecnico(req.user.id_usuario);
  }
  @Get('tecnico/estadisticas')
  @Roles('tecnico')
  getMyStats(@Request() req) {
    return this.ordenesService.getTecnicoStats(req.user.id_usuario);
  }
  @Get(':id')
  @Roles('admin', 'supervisor', 'tecnico', 'recepcion')
  findOne(@Param('id') id: string) {
    return this.ordenesService.findOne(Number(id));
  }
  @Patch(':id')
  @Roles('admin', 'supervisor', 'tecnico', 'recepcion')
  update(@Param('id') id: string, @Body() updateOrdenDto: UpdateOrdenDto) {
    return this.ordenesService.update(Number(id), updateOrdenDto);
  }
  @Patch(':id/estado')
  @Roles('admin', 'supervisor', 'tecnico', 'recepcion')
  updateEstado(@Param('id') id: string, @Body() updateEstadoDto: UpdateEstadoOrdenDto) {
    return this.ordenesService.updateEstado(Number(id), updateEstadoDto.estado);
  }
  @Delete(':id')
  @Roles('admin', 'supervisor')
  remove(@Param('id') id: string) {
    return this.ordenesService.remove(Number(id));
  }
}
