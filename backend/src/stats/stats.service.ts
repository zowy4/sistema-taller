import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getKpis() {
    const todayStart = startOfDay();
    const todayEnd = endOfDay();

    const facturasHoy = await this.prisma.facturas.findMany({
      where: {
        fecha_factura: { gte: todayStart, lte: todayEnd },
        estado_pago: 'pagada',
      },
      select: { monto: true },
    });
    const ventasHoy = facturasHoy.reduce((s, f) => s + (f.monto || 0), 0);

    const facturasPendientes = await this.prisma.facturas.count({
      where: { estado_pago: { not: 'pagada' } },
    });

    const ordenesEnProceso = await this.prisma.ordenesDeTrabajo.count({
      where: { estado: 'en_proceso' },
    });

    return {
      ventasHoy,
      facturasPendientes,
      ordenesEnProceso,
    };
  }

  async getVentasSemana() {
    // Últimos 7 días incluyendo hoy
    const days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });

    const from = days[0];
    const to = endOfDay(days[6]);

    const facturas = await this.prisma.facturas.findMany({
      where: {
        fecha_factura: { gte: from, lte: to },
        estado_pago: 'pagada',
      },
      select: { monto: true, fecha_factura: true },
      orderBy: { fecha_factura: 'asc' },
    });

    const map: Record<string, number> = {};
    for (const d of days) {
      const key = d.toISOString().slice(0, 10);
      map[key] = 0;
    }
    for (const f of facturas) {
      const key = new Date(f.fecha_factura).toISOString().slice(0, 10);
      if (map[key] === undefined) map[key] = 0;
      map[key] += f.monto || 0;
    }

    const labels = days.map((d) => d.toISOString().slice(0, 10));
    const data = labels.map((k) => map[k] || 0);

    return { labels, data };
  }

  async getStockBajo() {
    // Prisma no soporta comparación campo-vs-campo en where; usar SQL crudo
    const rows = await this.prisma.$queryRaw<Array<{
      id_repuesto: number;
      nombre: string;
      descripcion: string | null;
      unidad_medida: string;
      cantidad_existente: number;
      precio_unitario: number;
      nivel_minimo_alerta: number;
    }>>`SELECT id_repuesto, nombre, descripcion, unidad_medida, cantidad_existente, precio_unitario, nivel_minimo_alerta
         FROM "Repuestos"
         WHERE cantidad_existente <= nivel_minimo_alerta
         ORDER BY cantidad_existente ASC`;
    return rows;
  }
}

