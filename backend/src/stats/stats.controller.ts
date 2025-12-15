import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service';
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}
  @Get('kpis')
  getKpis() {
    return this.statsService.getKpis();
  }
  @Get('ventas-semana')
  getVentasSemana() {
    return this.statsService.getVentasSemana();
  }
  @Get('stock-bajo')
  getStockBajo() {
    return this.statsService.getStockBajo();
  }
}
