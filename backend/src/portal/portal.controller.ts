import { 
  Controller, 
  Get, 
  Patch, 
  Param, 
  Body, 
  Query, 
  UseGuards, 
  Request,
  ForbiddenException,
  ParseIntPipe
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PortalService } from './portal.service';

@Controller('portal')
@UseGuards(AuthGuard('jwt'))
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  // Middleware para verificar que el usuario es un cliente
  private ensureCliente(req: any): number {
    if (req.user.rol !== 'cliente') {
      throw new ForbiddenException('Acceso denegado: Solo clientes pueden acceder al portal');
    }
    return req.user.id_cliente;
  }

  @Get('dashboard/summary')
  async getDashboardSummary(@Request() req) {
    const idCliente = this.ensureCliente(req);
    return this.portalService.getDashboardSummary(idCliente);
  }

  @Get('perfil')
  async getMiPerfil(@Request() req) {
    const idCliente = this.ensureCliente(req);
    return this.portalService.getMiPerfil(idCliente);
  }

  @Patch('perfil')
  async updateMiPerfil(
    @Request() req,
    @Body() data: { telefono?: string; direccion?: string }
  ) {
    const idCliente = this.ensureCliente(req);
    return this.portalService.updateMiPerfil(idCliente, data);
  }

  @Get('vehiculos')
  async getMisVehiculos(@Request() req) {
    const idCliente = this.ensureCliente(req);
    return this.portalService.getMisVehiculos(idCliente);
  }

  @Get('vehiculos/:id/historial')
  async getHistorialVehiculo(
    @Request() req,
    @Param('id', ParseIntPipe) idVehiculo: number
  ) {
    const idCliente = this.ensureCliente(req);
    return this.portalService.getHistorialVehiculo(idCliente, idVehiculo);
  }

  @Get('ordenes')
  async getMisOrdenes(
    @Request() req,
    @Query('estado') estado?: string
  ) {
    const idCliente = this.ensureCliente(req);
    return this.portalService.getMisOrdenes(idCliente, estado);
  }

  @Get('ordenes/:id')
  async getDetalleOrden(
    @Request() req,
    @Param('id', ParseIntPipe) idOrden: number
  ) {
    const idCliente = this.ensureCliente(req);
    return this.portalService.getDetalleOrden(idCliente, idOrden);
  }

  @Get('facturas')
  async getMisFacturas(
    @Request() req,
    @Query('estado_pago') estadoPago?: string
  ) {
    const idCliente = this.ensureCliente(req);
    return this.portalService.getMisFacturas(idCliente, estadoPago);
  }

  @Get('facturas/:id/pdf')
  async getFacturaPDF(
    @Request() req,
    @Param('id', ParseIntPipe) idFactura: number
  ) {
    const idCliente = this.ensureCliente(req);
    return this.portalService.getFacturaPDF(idCliente, idFactura);
  }
}
