import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ServiciosService } from './servicios.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { PermissionsGuard } from '../auth/permissions.guard';
// import { Permissions } from '../auth/permissions.decorator';

@Controller('servicios')
// @UseGuards(JwtAuthGuard, PermissionsGuard)
export class ServiciosController {
  constructor(private readonly serviciosService: ServiciosService) {}

  // @Permissions('servicios:create')
  @Post()
  create(@Body() createServicioDto: CreateServicioDto) {
    return this.serviciosService.create(createServicioDto);
  }

  // @Permissions('servicios:read')
  @Get()
  findAll() {
    return this.serviciosService.findAll();
  }

  // @Permissions('servicios:read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviciosService.findOne(Number(id));
  }

  // @Permissions('servicios:update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateServicioDto: UpdateServicioDto) {
    return this.serviciosService.update(Number(id), updateServicioDto);
  }

  // @Permissions('servicios:delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviciosService.remove(Number(id));
  }
}
