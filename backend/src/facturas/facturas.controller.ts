import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { FacturasService } from './facturas.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';

@Controller('facturas')
export class FacturasController {
  constructor(private readonly facturasService: FacturasService) {}

  @Post()
  create(@Body() createFacturaDto: CreateFacturaDto) {
    return this.facturasService.create(createFacturaDto);
  }

  // Endpoint específico para facturar una orden
  @Post('facturar/:id_orden')
  facturarOrden(
    @Param('id_orden', ParseIntPipe) id_orden: number,
    @Body() body: { metodo_pago?: string },
  ) {
    return this.facturasService.facturarOrden(id_orden, body.metodo_pago);
  }

  @Get()
  findAll() {
    return this.facturasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.facturasService.findOne(id);
  }

  @Get('orden/:id_orden')
  findByOrden(@Param('id_orden', ParseIntPipe) id_orden: number) {
    return this.facturasService.findByOrden(id_orden);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateFacturaDto: UpdateFacturaDto) {
    return this.facturasService.update(id, updateFacturaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.facturasService.remove(id);
  }
}

