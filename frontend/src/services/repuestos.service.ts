const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
import { Repuesto, CreateRepuestoDto } from '@/types';
export interface AjusteStockDto {
  cantidad: number; 
  motivo?: string;  
}
export async function fetchRepuestos(token: string): Promise<Repuesto[]> {
  const response = await fetch(`${API_URL}/repuestos`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (response.status === 403) throw new Error('FORBIDDEN');
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al cargar repuestos');
  }
  return response.json();
}
export async function fetchRepuestoById(token: string, id: number): Promise<Repuesto> {
  const response = await fetch(`${API_URL}/repuestos/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (response.status === 403) throw new Error('FORBIDDEN');
  if (response.status === 404) throw new Error('Repuesto no encontrado');
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al cargar repuesto');
  }
  return response.json();
}
export async function fetchStockBajo(token: string): Promise<Repuesto[]> {
  const response = await fetch(`${API_URL}/repuestos/stock-bajo`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (response.status === 403) throw new Error('FORBIDDEN');
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al cargar stock bajo');
  }
  return response.json();
}
export async function createRepuesto(token: string, data: CreateRepuestoDto): Promise<Repuesto> {
  const response = await fetch(`${API_URL}/repuestos`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (response.status === 403) throw new Error('FORBIDDEN');
  if (response.status === 409) throw new Error('El có³digo de repuesto ya existe');
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al crear repuesto');
  }
  return response.json();
}
export async function updateRepuesto(
  token: string, 
  id: number, 
  data: Partial<CreateRepuestoDto>
): Promise<Repuesto> {
  const response = await fetch(`${API_URL}/repuestos/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (response.status === 403) throw new Error('FORBIDDEN');
  if (response.status === 404) throw new Error('Repuesto no encontrado');
  if (response.status === 409) throw new Error('El có³digo de repuesto ya existe');
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al actualizar repuesto');
  }
  return response.json();
}
export async function ajustarStock(
  token: string,
  id: number,
  ajuste: AjusteStockDto
): Promise<Repuesto> {
  const response = await fetch(`${API_URL}/repuestos/${id}/ajustar-stock`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ajuste),
  });
  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (response.status === 403) throw new Error('FORBIDDEN');
  if (response.status === 404) throw new Error('Repuesto no encontrado');
  if (response.status === 400) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Stock insuficiente');
  }
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al ajustar stock');
  }
  return response.json();
}
export async function deleteRepuesto(token: string, id: number): Promise<void> {
  const response = await fetch(`${API_URL}/repuestos/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (response.status === 403) throw new Error('FORBIDDEN');
  if (response.status === 404) throw new Error('Repuesto no encontrado');
  if (response.status === 409) throw new Error('No se puede eliminar: repuesto en uso en ó³rdenes activas');
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al eliminar repuesto');
  }
}
export function calcularMargenGanancia(precio_compra: number, precio_venta: number): number {
  if (precio_compra === 0) return 0;
  return ((precio_venta - precio_compra) / precio_compra) * 100;
}
export function getStockStatus(stock_actual: number, stock_minimo: number): 'ok' | 'bajo' | 'agotado' {
  if (stock_actual === 0) return 'agotado';
  if (stock_actual <= stock_minimo) return 'bajo';
  return 'ok';
}
