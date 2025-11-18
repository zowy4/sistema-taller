import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * GET /dashboard/kpis
   * Obtiene los KPIs principales del negocio
   * Solo accesible por administradores
   */
  @Get('kpis')
  @Roles('admin', 'supervisor')
  async getKPIs() {
    return this.dashboardService.getKPIs();
  }

  /**
   * GET /dashboard/stock-bajo
   * Obtiene los repuestos con stock bajo o crítico
   * Solo accesible por administradores
   */
  @Get('stock-bajo')
  @Roles('admin', 'supervisor')
  async getStockBajo() {
    return this.dashboardService.getRepuestosBajoStock();
  }

  /**
   * GET /dashboard/ventas-semana
   * Obtiene las ventas agrupadas por día de la última semana
   * Solo accesible por administradores
   */
  @Get('ventas-semana')
  @Roles('admin', 'supervisor')
  async getVentasSemana() {
    return this.dashboardService.getVentasSemana();
  }
}
