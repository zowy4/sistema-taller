import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrdenesService } from './ordenes.service';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { UpdateOrdenDto } from './dto/update-orden.dto';
import { UpdateEstadoOrdenDto } from './dto/update-estado-orden.dto';

@Controller('ordenes')
export class OrdenesController {
  constructor(private readonly ordenesService: OrdenesService) {}

  @Post()
  create(@Body() createOrdenDto: CreateOrdenDto) {
    return this.ordenesService.create(createOrdenDto);
  }

  @Get()
  findAll() {
    return this.ordenesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordenesService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrdenDto: UpdateOrdenDto) {
    return this.ordenesService.update(Number(id), updateOrdenDto);
  }

  @Patch(':id/estado')
  updateEstado(@Param('id') id: string, @Body() updateEstadoDto: UpdateEstadoOrdenDto) {
    return this.ordenesService.updateEstado(Number(id), updateEstadoDto.estado);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordenesService.remove(Number(id));
  }
}
