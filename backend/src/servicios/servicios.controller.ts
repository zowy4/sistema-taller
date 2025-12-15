import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ServiciosService } from './servicios.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
@Controller('servicios')
@UseGuards(AuthGuard('jwt'))
export class ServiciosController {
  constructor(private readonly serviciosService: ServiciosService) {}
  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'supervisor')
  create(@Body() createServicioDto: CreateServicioDto) {
    return this.serviciosService.create(createServicioDto);
  }
  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin', 'supervisor', 'tecnico', 'recepcion')
  findAll() {
    return this.serviciosService.findAll();
  }
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'supervisor', 'tecnico', 'recepcion')
  findOne(@Param('id') id: string) {
    return this.serviciosService.findOne(Number(id));
  }
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'supervisor')
  update(@Param('id') id: string, @Body() updateServicioDto: UpdateServicioDto) {
    return this.serviciosService.update(Number(id), updateServicioDto);
  }
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.serviciosService.remove(Number(id));
  }
}
