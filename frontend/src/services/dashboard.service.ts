const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
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
export interface StockBajo {
  id_repuesto: number;
  nombre: string;
  stock_actual: number;
  stock_minimo: number;
  precio_venta: number;
}
export interface VentasSemana {
  dia: string;
  total: number;
  ordenes: number;
}
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
