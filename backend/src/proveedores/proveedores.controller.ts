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
import { ProveedoresService } from './proveedores.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { UpdateProveedorDto } from './dto/update-proveedor.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
@Controller('proveedores')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ProveedoresController {
  constructor(private readonly proveedoresService: ProveedoresService) {}
  @Post()
  @Roles('admin', 'supervisor')
  create(@Body() createProveedorDto: CreateProveedorDto) {
    return this.proveedoresService.create(createProveedorDto);
  }
  @Get()
  @Roles('admin', 'supervisor', 'tecnico')
  findAll() {
    return this.proveedoresService.findAll();
  }
  @Get('activos')
  @Roles('admin', 'supervisor', 'tecnico')
  findAllActive() {
    return this.proveedoresService.findAllActive();
  }
  @Get(':id')
  @Roles('admin', 'supervisor', 'tecnico')
  findOne(@Param('id') id: string) {
    return this.proveedoresService.findOne(+id);
  }
  @Patch(':id')
  @Roles('admin', 'supervisor')
  update(@Param('id') id: string, @Body() updateProveedorDto: UpdateProveedorDto) {
    return this.proveedoresService.update(+id, updateProveedorDto);
  }
  @Patch(':id/toggle-active')
  @Roles('admin', 'supervisor')
  toggleActive(@Param('id') id: string) {
    return this.proveedoresService.toggleActive(+id);
  }
  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.proveedoresService.remove(+id);
  }
}
