const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
import { Proveedor, CreateProveedorDto } from '@/types';
export async function fetchProveedores(token: string): Promise<Proveedor[]> {
  const response = await fetch(`${API_URL}/proveedores`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (response.status === 403) throw new Error('FORBIDDEN');
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al cargar proveedores');
  }
  return response.json();
}
export async function fetchProveedorById(token: string, id: number): Promise<Proveedor> {
  const response = await fetch(`${API_URL}/proveedores/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (response.status === 403) throw new Error('FORBIDDEN');
  if (response.status === 404) throw new Error('Proveedor no encontrado');
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al cargar proveedor');
  }
  return response.json();
}
export async function fetchProveedoresActivos(token: string): Promise<Proveedor[]> {
  const proveedores = await fetchProveedores(token);
  return proveedores.filter(p => p.activo);
}
export async function createProveedor(token: string, data: CreateProveedorDto): Promise<Proveedor> {
  const response = await fetch(`${API_URL}/proveedores`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (response.status === 403) throw new Error('FORBIDDEN');
  if (response.status === 409) throw new Error('El email ya estó¡ registrado');
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al crear proveedor');
  }
  return response.json();
}
export async function updateProveedor(
  token: string, 
  id: number, 
  data: Partial<CreateProveedorDto>
): Promise<Proveedor> {
  const response = await fetch(`${API_URL}/proveedores/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (response.status === 403) throw new Error('FORBIDDEN');
  if (response.status === 404) throw new Error('Proveedor no encontrado');
  if (response.status === 409) throw new Error('El email ya estó¡ registrado');
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al actualizar proveedor');
  }
  return response.json();
}
export async function toggleProveedorEstado(
  token: string,
  id: number,
  activo: boolean
): Promise<Proveedor> {
  return updateProveedor(token, id, { activo } as Partial<CreateProveedorDto>);
}
export async function deleteProveedor(token: string, id: number): Promise<void> {
  const response = await fetch(`${API_URL}/proveedores/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (response.status === 403) throw new Error('FORBIDDEN');
  if (response.status === 404) throw new Error('Proveedor no encontrado');
  if (response.status === 409) throw new Error('No se puede eliminar: proveedor tiene compras asociadas');
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al eliminar proveedor');
  }
}
