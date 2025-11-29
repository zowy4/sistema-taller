/**
 * Servicios API para Órdenes de Trabajo
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export interface Orden {
  id_orden: number;
  id_cliente: number;
  id_vehiculo: number;
  id_empleado_asignado?: number;
  fecha_ingreso: string;
  fecha_estimada?: string;
  fecha_entrega?: string;
  estado: 'pendiente' | 'en_proceso' | 'completada' | 'cancelada';
  descripcion_problema: string;
  observaciones?: string;
  costo_mano_obra: number;
  costo_repuestos: number;
  total: number;
  cliente?: {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
  };
  vehiculo?: {
    marca: string;
    modelo: string;
    anio: number;
    patente: string;
  };
  empleado?: {
    nombre: string;
    apellido: string;
  };
}

export async function fetchOrdenes(token: string): Promise<Orden[]> {
  const response = await fetch(`${API_URL}/ordenes`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    if (response.status === 403) throw new Error('FORBIDDEN');
    throw new Error('Error al obtener órdenes');
  }

  return response.json();
}

export async function fetchOrdenById(token: string, id: number): Promise<Orden> {
  const response = await fetch(`${API_URL}/ordenes/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    if (response.status === 403) throw new Error('FORBIDDEN');
    if (response.status === 404) throw new Error('Orden no encontrada');
    throw new Error('Error al obtener la orden');
  }

  return response.json();
}

export async function createOrden(
  token: string,
  data: Partial<Orden>
): Promise<Orden> {
  const response = await fetch(`${API_URL}/ordenes`, {
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
    throw new Error('Error al crear la orden');
  }

  return response.json();
}

export async function updateOrden(
  token: string,
  id: number,
  data: Partial<Orden>
): Promise<Orden> {
  const response = await fetch(`${API_URL}/ordenes/${id}`, {
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
    if (response.status === 404) throw new Error('Orden no encontrada');
    throw new Error('Error al actualizar la orden');
  }

  return response.json();
}

export async function updateEstadoOrden(
  token: string,
  id: number,
  estado: string
): Promise<Orden> {
  const response = await fetch(`${API_URL}/ordenes/${id}/estado`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ estado }),
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    if (response.status === 403) throw new Error('FORBIDDEN');
    if (response.status === 404) throw new Error('Orden no encontrada');
    throw new Error('Error al actualizar el estado');
  }

  return response.json();
}

export async function deleteOrden(token: string, id: number): Promise<void> {
  const response = await fetch(`${API_URL}/ordenes/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    if (response.status === 403) throw new Error('FORBIDDEN');
    if (response.status === 404) throw new Error('Orden no encontrada');
    throw new Error('Error al eliminar la orden');
  }
}
