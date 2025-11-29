import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Patch,
  Delete,
  Request,
} from '@nestjs/common';
import { RepuestosService } from './repuestos.service';
import { CreateRepuestoDto } from './dto/create-repuesto.dto';
import { UpdateRepuestoDto } from './dto/update-repuesto.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('repuestos')
@UseGuards(AuthGuard('jwt'))
export class RepuestosController {
  constructor(private readonly repuestosService: RepuestosService) {}

  /**
   * Crear un nuevo repuesto
   * POST /repuestos
   */
  @Post()
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('admin', 'supervisor')
  @RequirePermissions('repuestos:create')
  create(@Body() createRepuestoDto: CreateRepuestoDto) {
    return this.repuestosService.createRepuesto(createRepuestoDto);
  }

  /**
   * Obtener todos los repuestos
   * GET /repuestos
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin', 'supervisor', 'tecnico', 'recepcion')
  async findAll(@Request() req) {
    const repuestos = await this.repuestosService.getAllRepuestos();
    
    // Si el usuario es técnico o recepcionista, ocultar precio_compra
    if (req.user?.rol === 'tecnico' || req.user?.rol === 'recepcion') {
      return repuestos.map(({ precio_compra, ...rest }) => rest);
    }
    
    return repuestos;
  }

  /**
   * Obtener repuestos con stock bajo
   * GET /repuestos/stock-bajo
   */
  @Get('stock-bajo')
  @UseGuards(RolesGuard)
  @Roles('admin', 'supervisor', 'tecnico', 'recepcion')
  async findStockBajo(@Request() req) {
    const repuestos = await this.repuestosService.getRepuestosBajoStock();
    
    // Si el usuario es técnico o recepcionista, ocultar precio_compra
    if (req.user?.rol === 'tecnico' || req.user?.rol === 'recepcion') {
      return repuestos.map(({ precio_compra, ...rest }) => rest);
    }
    
    return repuestos;
  }

  /**
   * Obtener un repuesto por ID
   * GET /repuestos/:id
   */
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'supervisor', 'tecnico', 'recepcion')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const repuesto = await this.repuestosService.getRepuestoById(id);
    
    // Si el usuario es técnico o recepcionista, ocultar precio_compra
    if (req.user?.rol === 'tecnico' || req.user?.rol === 'recepcion') {
      const { precio_compra, ...rest } = repuesto;
      return rest;
    }
    
    return repuesto;
  }

  /**
   * Actualizar un repuesto
   * PATCH /repuestos/:id
   */
  @Patch(':id')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('admin', 'supervisor')
  @RequirePermissions('repuestos:update')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRepuestoDto: UpdateRepuestoDto,
  ) {
    return this.repuestosService.updateRepuesto(id, updateRepuestoDto);
  }

  /**
   * Ajustar stock de un repuesto
   * PATCH /repuestos/:id/ajustar-stock
   */
  @Patch(':id/ajustar-stock')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('admin', 'supervisor')
  @RequirePermissions('repuestos:update')
  adjustStock(
    @Param('id', ParseIntPipe) id: number,
    @Body() adjustStockDto: AdjustStockDto,
  ) {
    return this.repuestosService.adjustStock(id, adjustStockDto);
  }

  /**
   * Eliminar un repuesto
   * DELETE /repuestos/:id
   */
  @Delete(':id')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles('admin')
  @RequirePermissions('repuestos:delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.repuestosService.deleteRepuesto(id);
  }
}
