const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
import { Compra, CreateCompraDto } from '@/types';
export async function fetchCompras(token: string): Promise<Compra[]> {
  const response = await fetch(`${API_URL}/compras`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (response.status === 403) throw new Error('FORBIDDEN');
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al cargar compras');
  }
  return response.json();
}
export async function fetchCompraById(token: string, id: number): Promise<Compra> {
  const response = await fetch(`${API_URL}/compras/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (response.status === 403) throw new Error('FORBIDDEN');
  if (response.status === 404) throw new Error('Compra no encontrada');
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al cargar compra');
  }
  return response.json();
}
export async function createCompra(token: string, data: CreateCompraDto): Promise<Compra> {
  const response = await fetch(`${API_URL}/compras`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (response.status === 403) throw new Error('FORBIDDEN');
  if (response.status === 404) throw new Error('Proveedor o repuesto no encontrado');
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al crear compra');
  }
  return response.json();
}
export async function updateCompraEstado(
  token: string,
  id: number,
  estado: 'pendiente' | 'completada' | 'cancelada'
): Promise<Compra> {
  const response = await fetch(`${API_URL}/compras/${id}/estado`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ estado }),
  });
  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (response.status === 403) throw new Error('FORBIDDEN');
  if (response.status === 404) throw new Error('Compra no encontrada');
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al actualizar estado');
  }
  return response.json();
}
export async function deleteCompra(token: string, id: number): Promise<void> {
  const response = await fetch(`${API_URL}/compras/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (response.status === 403) throw new Error('FORBIDDEN');
  if (response.status === 404) throw new Error('Compra no encontrada');
  if (response.status === 409) throw new Error('No se puede eliminar: la compra ya fue procesada');
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al eliminar compra');
  }
}
