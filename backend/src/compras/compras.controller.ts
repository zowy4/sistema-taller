import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards 
} from '@nestjs/common';
import { ComprasService } from './compras.service';
import { CreateCompraDto } from './dto/create-compra.dto';
import { UpdateCompraDto } from './dto/update-compra.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('compras')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) {}

  @Post()
  @Roles('admin', 'supervisor')
  create(@Body() createCompraDto: CreateCompraDto) {
    return this.comprasService.create(createCompraDto);
  }

  @Get()
  @Roles('admin', 'supervisor', 'tecnico')
  findAll() {
    return this.comprasService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'supervisor', 'tecnico')
  findOne(@Param('id') id: string) {
    return this.comprasService.findOne(+id);
  }

  @Get('proveedor/:id_proveedor')
  @Roles('admin', 'supervisor', 'tecnico')
  findByProveedor(@Param('id_proveedor') id_proveedor: string) {
    return this.comprasService.findByProveedor(+id_proveedor);
  }

  @Patch(':id')
  @Roles('admin', 'supervisor')
  update(@Param('id') id: string, @Body() updateCompraDto: UpdateCompraDto) {
    return this.comprasService.update(+id, updateCompraDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.comprasService.remove(+id);
  }
}
