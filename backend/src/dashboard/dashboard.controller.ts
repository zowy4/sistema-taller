import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
@Controller('dashboard')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}
  @Get('kpis')
  @Roles('admin', 'supervisor')
  async getKPIs() {
    return this.dashboardService.getKPIs();
  }
  @Get('stock-bajo')
  @Roles('admin', 'supervisor')
  async getStockBajo() {
    return this.dashboardService.getRepuestosBajoStock();
  }
  @Get('ventas-semana')
  @Roles('admin', 'supervisor')
  async getVentasSemana() {
    return this.dashboardService.getVentasSemana();
  }
}
