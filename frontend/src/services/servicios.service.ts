const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
export interface Servicio {
  id_servicio: number;
  nombre: string;
  descripcion?: string;
  precio_base: number;
  duracion_estimada?: number;
  categoria?: string;
  activo: boolean;
}
export interface CreateServicioDto {
  nombre: string;
  descripcion?: string;
  precio_base: number;
  duracion_estimada?: number;
  categoria?: string;
  activo?: boolean;
}
export async function fetchServicios(token: string): Promise<Servicio[]> {
  const response = await fetch(`${API_URL}/servicios`, {
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
    throw new Error('Error al obtener servicios');
  }
  return response.json();
}
export async function fetchServicioById(token: string, id: number): Promise<Servicio> {
  const response = await fetch(`${API_URL}/servicios/${id}`, {
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
    if (response.status === 404) {
      throw new Error('Servicio no encontrado');
    }
    throw new Error('Error al obtener el servicio');
  }
  return response.json();
}
export async function createServicio(
  token: string,
  data: CreateServicioDto
): Promise<Servicio> {
  const response = await fetch(`${API_URL}/servicios`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('UNAUTHORIZED');
    }
    if (response.status === 403) {
      throw new Error('FORBIDDEN');
    }
    throw new Error('Error al crear el servicio');
  }
  return response.json();
}
export async function updateServicio(
  token: string,
  id: number,
  data: Partial<CreateServicioDto>
): Promise<Servicio> {
  const response = await fetch(`${API_URL}/servicios/${id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('UNAUTHORIZED');
    }
    if (response.status === 403) {
      throw new Error('FORBIDDEN');
    }
    if (response.status === 404) {
      throw new Error('Servicio no encontrado');
    }
    throw new Error('Error al actualizar el servicio');
  }
  return response.json();
}
export async function toggleServicioEstado(
  token: string,
  id: number,
  activo: boolean
): Promise<Servicio> {
  return updateServicio(token, id, { activo });
}
export async function deleteServicio(token: string, id: number): Promise<void> {
  const response = await fetch(`${API_URL}/servicios/${id}`, {
    method: 'DELETE',
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
    if (response.status === 404) {
      throw new Error('Servicio no encontrado');
    }
    if (response.status === 409) {
      throw new Error('No se puede eliminar: el servicio estó¡ en uso en ó³rdenes activas');
    }
    throw new Error('Error al eliminar el servicio');
  }
}
