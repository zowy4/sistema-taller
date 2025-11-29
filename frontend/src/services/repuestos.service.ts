/**
 * Servicios API para Repuestos
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export interface Repuesto {
  id_repuesto: number;
  nombre: string;
  descripcion?: string;
  codigo: string;
  marca?: string;
  stock_actual: number;
  stock_minimo: number;
  precio_compra: number;
  precio_venta: number;
  id_proveedor?: number;
  ubicacion?: string;
  activo: boolean;
  fecha_actualizacion: string;
  proveedor?: {
    nombre: string;
    contacto: string;
  };
}

export interface StockBajo {
  id_repuesto: number;
  nombre: string;
  codigo: string;
  stock_actual: number;
  stock_minimo: number;
  precio_venta: number;
}

export async function fetchRepuestos(token: string): Promise<Repuesto[]> {
  const response = await fetch(`${API_URL}/repuestos`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    if (response.status === 403) throw new Error('FORBIDDEN');
    throw new Error('Error al obtener repuestos');
  }

  return response.json();
}

export async function fetchStockBajo(token: string): Promise<StockBajo[]> {
  const response = await fetch(`${API_URL}/repuestos/stock-bajo`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    if (response.status === 403) throw new Error('FORBIDDEN');
    throw new Error('Error al obtener stock bajo');
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

  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    if (response.status === 403) throw new Error('FORBIDDEN');
    if (response.status === 404) throw new Error('Repuesto no encontrado');
    throw new Error('Error al obtener el repuesto');
  }

  return response.json();
}

export async function createRepuesto(
  token: string,
  data: Partial<Repuesto>
): Promise<Repuesto> {
  const response = await fetch(`${API_URL}/repuestos`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    if (response.status === 403) throw new Error('FORBIDDEN');
    throw new Error('Error al crear el repuesto');
  }

  return response.json();
}

export async function updateRepuesto(
  token: string,
  id: number,
  data: Partial<Repuesto>
): Promise<Repuesto> {
  const response = await fetch(`${API_URL}/repuestos/${id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    if (response.status === 403) throw new Error('FORBIDDEN');
    if (response.status === 404) throw new Error('Repuesto no encontrado');
    throw new Error('Error al actualizar el repuesto');
  }

  return response.json();
}

export async function ajustarStock(
  token: string,
  id: number,
  cantidad: number,
  tipo: 'entrada' | 'salida'
): Promise<Repuesto> {
  const response = await fetch(`${API_URL}/repuestos/${id}/ajustar-stock`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ cantidad, tipo }),
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    if (response.status === 403) throw new Error('FORBIDDEN');
    if (response.status === 404) throw new Error('Repuesto no encontrado');
    throw new Error('Error al ajustar el stock');
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

  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    if (response.status === 403) throw new Error('FORBIDDEN');
    if (response.status === 404) throw new Error('Repuesto no encontrado');
    throw new Error('Error al eliminar el repuesto');
  }
}
