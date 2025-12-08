/**
 * Servicios API para el Dashboard
 * Funciones limpias y reutilizables para fetching de datos
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

/**
 * Interfaz para los KPIs del dashboard
 */
export interface DashboardKPIs {
  clientes_total: number;
  clientes_activos: number;
  ordenes_pendientes: number;
  ordenes_en_proceso: number;
  ordenes_completadas: number;
  servicios_activos: number;
  ingresos_mes: number;
  stock_bajo: number;
  repuestos_total: number;
}

/**
 * Interfaz para productos con stock bajo
 */
export interface StockBajo {
  id_repuesto: number;
  nombre: string;
  stock_actual: number;
  stock_minimo: number;
  precio_venta: number;
}

/**
 * Interfaz para ventas de la semana
 */
export interface VentasSemana {
  dia: string;
  total: number;
  ordenes: number;
}

/**
 * Obtener KPIs del dashboard
 */
export async function fetchDashboardKPIs(token: string): Promise<DashboardKPIs> {
  const response = await fetch(`${API_URL}/dashboard/kpis`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('UNAUTHORIZED');
    }
    if (response.status === 403) {
      throw new Error('FORBIDDEN');
    }
    throw new Error('Error al obtener KPIs del dashboard');
  }

  return response.json();
}

/**
 * Obtener productos con stock bajo
 */
export async function fetchStockBajo(token: string): Promise<StockBajo[]> {
  const response = await fetch(`${API_URL}/dashboard/stock-bajo`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('UNAUTHORIZED');
    }
    if (response.status === 403) {
      throw new Error('FORBIDDEN');
    }
    throw new Error('Error al obtener productos con stock bajo');
  }

  return response.json();
}

/**
 * Obtener ventas de la semana
 */
export async function fetchVentasSemana(token: string): Promise<VentasSemana[]> {
  const response = await fetch(`${API_URL}/dashboard/ventas-semana`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('UNAUTHORIZED');
    }
    if (response.status === 403) {
      throw new Error('FORBIDDEN');
    }
    throw new Error('Error al obtener ventas de la semana');
  }

  return response.json();
}
