import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { EmpleadosService } from './empleados.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
@Controller('admin/empleados')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class EmpleadosController {
  constructor(private readonly empleadosService: EmpleadosService) {}
  @Post()
  create(@Body() createEmpleadoDto: CreateEmpleadoDto) {
    return this.empleadosService.create(createEmpleadoDto);
  }
  @Get()
  findAll() {
    return this.empleadosService.findAll();
  }
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.empleadosService.findOne(id);
  }
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateEmpleadoDto: UpdateEmpleadoDto) {
    return this.empleadosService.update(id, updateEmpleadoDto);
  }
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.empleadosService.remove(id);
  }
}
