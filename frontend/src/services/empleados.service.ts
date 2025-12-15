const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
export interface Empleado {
  id_empleado: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  cargo: string;
  fecha_contratacion: string;
  salario: number;
  estado: 'activo' | 'inactivo';
  usuario?: {
    id_usuario: number;
    email: string;
    rol: string;
  };
}
export interface CreateEmpleadoDto {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  cargo: string;
  salario: number;
  fecha_contratacion?: string;
}
export interface UpdateEmpleadoDto {
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  cargo?: string;
  salario?: number;
  estado?: 'activo' | 'inactivo';
}
export async function fetchEmpleados(): Promise<Empleado[]> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/admin/empleados`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    throw new Error('Error al obtener empleados');
  }
  return response.json();
}
export async function fetchEmpleadoById(id: number): Promise<Empleado> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/admin/empleados/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    if (response.status === 404) throw new Error('Empleado no encontrado');
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    throw new Error('Error al obtener empleado');
  }
  return response.json();
}
export async function createEmpleado(data: CreateEmpleadoDto): Promise<Empleado> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/admin/empleados`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    if (response.status === 400) throw new Error(errorData.message || 'Datos invó¡lidos');
    if (response.status === 409) throw new Error('El email ya estó¡ registrado');
    throw new Error('Error al crear empleado');
  }
  return response.json();
}
export async function updateEmpleado(id: number, data: UpdateEmpleadoDto): Promise<Empleado> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/admin/empleados/${id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    if (response.status === 404) throw new Error('Empleado no encontrado');
    if (response.status === 400) throw new Error(errorData.message || 'Datos invó¡lidos');
    throw new Error('Error al actualizar empleado');
  }
  return response.json();
}
export async function deleteEmpleado(id: number): Promise<void> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/admin/empleados/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    if (response.status === 404) throw new Error('Empleado no encontrado');
    if (response.status === 409) throw new Error('No se puede eliminar: el empleado tiene ó³rdenes asignadas');
    throw new Error('Error al eliminar empleado');
  }
}
export async function toggleEmpleadoEstado(id: number, estado: 'activo' | 'inactivo'): Promise<Empleado> {
  return updateEmpleado(id, { estado });
}
