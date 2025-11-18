import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene los KPIs principales del dashboard:
   * - Total de ventas del mes actual
   * - Total de órdenes del mes actual
   * - Total de clientes registrados
   * - Total de repuestos en inventario
   */
  async getKPIs() {
    const fechaActual = new Date();
    const inicioMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);
    const finMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0, 23, 59, 59);

    // Total de ventas del mes (suma de todas las facturas del mes)
    const ventasMes = await this.prisma.facturas.aggregate({
      where: {
        fecha_factura: {
          gte: inicioMes,
          lte: finMes,
        },
      },
      _sum: {
        monto: true,
      },
    });

    // Total de órdenes del mes
    const ordenesMes = await this.prisma.ordenesDeTrabajo.count({
      where: {
        fecha_apertura: {
          gte: inicioMes,
          lte: finMes,
        },
      },
    });

    // Total de clientes registrados
    const totalClientes = await this.prisma.clientes.count();

    // Total de repuestos en inventario
    const totalRepuestos = await this.prisma.repuestos.count();

    // Valor total del inventario (suma de stock_actual * precio_venta)
    const repuestos = await this.prisma.repuestos.findMany({
      where: {
        stock_actual: {
          gt: 0,
        },
      },
      select: {
        stock_actual: true,
        precio_venta: true,
      },
    });

    const valorInventario = repuestos.reduce((total, repuesto) => {
      return total + (repuesto.stock_actual * repuesto.precio_venta);
    }, 0);

    return {
      ventasMes: ventasMes._sum.monto || 0,
      ordenesMes,
      totalClientes,
      totalRepuestos,
      valorInventario,
    };
  }

  /**
   * Obtiene los repuestos con stock bajo (stock_actual <= stock_minimo)
   * Ordenados por el nivel de urgencia (menor stock primero)
   */
  async getRepuestosBajoStock() {
    // Obtener todos los repuestos
    const todosRepuestos = await this.prisma.repuestos.findMany({
      select: {
        id_repuesto: true,
        nombre: true,
        codigo: true,
        stock_actual: true,
        stock_minimo: true,
        precio_venta: true,
        precio_compra: true,
      },
    });

    // Filtrar los que tienen stock bajo y mapear con urgencia
    const repuestosBajos = todosRepuestos
      .filter(repuesto => repuesto.stock_actual <= repuesto.stock_minimo)
      .map(repuesto => {
        const deficit = repuesto.stock_minimo - repuesto.stock_actual;
        let urgencia = 'NORMAL';
        
        if (repuesto.stock_actual === 0) {
          urgencia = 'CRÍTICO';
        } else if (deficit >= repuesto.stock_minimo * 0.5) {
          urgencia = 'URGENTE';
        } else if (deficit > 0) {
          urgencia = 'BAJO';
        }
        
        return {
          id_repuesto: repuesto.id_repuesto,
          nombre: repuesto.nombre,
          codigo: repuesto.codigo || 'N/A',
          stock_actual: repuesto.stock_actual,
          stock_minimo: repuesto.stock_minimo,
          precio_venta: repuesto.precio_venta || 0,
          precio_compra: repuesto.precio_compra || 0,
          urgencia,
          deficit,
        };
      })
      .sort((a, b) => {
        // Primero por urgencia crítica, luego por déficit mayor
        if (a.stock_actual === 0 && b.stock_actual !== 0) return -1;
        if (b.stock_actual === 0 && a.stock_actual !== 0) return 1;
        return b.deficit - a.deficit;
      });

    return repuestosBajos;
  }

  /**
   * Obtiene las ventas agrupadas por día de la última semana
   * Útil para gráficos de línea o barras
   */
  async getVentasSemana() {
    const fechaActual = new Date();
    const hace7Dias = new Date(fechaActual);
    hace7Dias.setDate(fechaActual.getDate() - 7);

    // Obtener todas las facturas de la última semana
    const facturas = await this.prisma.facturas.findMany({
      where: {
        fecha_factura: {
          gte: hace7Dias,
        },
      },
      select: {
        fecha_factura: true,
        monto: true,
      },
      orderBy: {
        fecha_factura: 'asc',
      },
    });

    // Agrupar por fecha manualmente
    const ventasPorFecha = new Map<string, { total: number; cantidad: number }>();

    facturas.forEach(factura => {
      const fechaKey = factura.fecha_factura.toISOString().split('T')[0];
      const existing = ventasPorFecha.get(fechaKey) || { total: 0, cantidad: 0 };
      existing.total += factura.monto || 0;
      existing.cantidad += 1;
      ventasPorFecha.set(fechaKey, existing);
    });

    // Convertir a array
    return Array.from(ventasPorFecha.entries()).map(([fecha, datos]) => ({
      fecha: new Date(fecha),
      total: datos.total,
      cantidad: datos.cantidad,
    }));
  }
}

