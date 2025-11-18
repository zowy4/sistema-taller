import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { FacturasService } from './facturas.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('facturas')
@UseGuards(AuthGuard('jwt'))
export class FacturasController {
  constructor(private readonly facturasService: FacturasService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'supervisor', 'recepcion')
  create(@Body() createFacturaDto: CreateFacturaDto) {
    return this.facturasService.create(createFacturaDto);
  }

  // Endpoint específico para facturar una orden
  @Post('facturar/:id_orden')
  @UseGuards(RolesGuard)
  @Roles('admin', 'supervisor', 'recepcion')
  facturarOrden(
    @Param('id_orden', ParseIntPipe) id_orden: number,
    @Body() body: { metodo_pago?: string },
  ) {
    return this.facturasService.facturarOrden(id_orden, body.metodo_pago);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin', 'supervisor', 'recepcion')
  findAll() {
    return this.facturasService.findAll();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'supervisor', 'recepcion')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.facturasService.findOne(id);
  }

  @Get('orden/:id_orden')
  @UseGuards(RolesGuard)
  @Roles('admin', 'supervisor', 'recepcion')
  findByOrden(@Param('id_orden', ParseIntPipe) id_orden: number) {
    return this.facturasService.findByOrden(id_orden);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'supervisor')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateFacturaDto: UpdateFacturaDto) {
    return this.facturasService.update(id, updateFacturaDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.facturasService.remove(id);
  }
}

