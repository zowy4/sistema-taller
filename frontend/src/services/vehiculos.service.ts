/**
 * Servicios API para Vehículos
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export interface Vehiculo {
  id_vehiculo: number;
  id_cliente: number;
  marca: string;
  modelo: string;
  anio: number;
  patente: string;
  vin?: string;
  color?: string;
  kilometraje?: number;
  tipo_combustible?: string;
  activo: boolean;
  fecha_registro: string;
  cliente?: {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
  };
}

export async function fetchVehiculos(token: string): Promise<Vehiculo[]> {
  const response = await fetch(`${API_URL}/vehiculos`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    if (response.status === 403) throw new Error('FORBIDDEN');
    throw new Error('Error al obtener vehículos');
  }

  return response.json();
}

export async function fetchVehiculoById(token: string, id: number): Promise<Vehiculo> {
  const response = await fetch(`${API_URL}/vehiculos/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    if (response.status === 403) throw new Error('FORBIDDEN');
    if (response.status === 404) throw new Error('Vehículo no encontrado');
    throw new Error('Error al obtener el vehículo');
  }

  return response.json();
}

export async function fetchHistorialVehiculo(token: string, id: number): Promise<any[]> {
  const response = await fetch(`${API_URL}/vehiculos/${id}/historial`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    if (response.status === 403) throw new Error('FORBIDDEN');
    if (response.status === 404) throw new Error('Vehículo no encontrado');
    throw new Error('Error al obtener el historial');
  }

  return response.json();
}

export async function createVehiculo(
  token: string,
  data: Partial<Vehiculo>
): Promise<Vehiculo> {
  const response = await fetch(`${API_URL}/vehiculos`, {
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
    throw new Error('Error al crear el vehículo');
  }

  return response.json();
}

export async function updateVehiculo(
  token: string,
  id: number,
  data: Partial<Vehiculo>
): Promise<Vehiculo> {
  const response = await fetch(`${API_URL}/vehiculos/${id}`, {
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
    if (response.status === 404) throw new Error('Vehículo no encontrado');
    throw new Error('Error al actualizar el vehículo');
  }

  return response.json();
}

export async function deleteVehiculo(token: string, id: number): Promise<void> {
  const response = await fetch(`${API_URL}/vehiculos/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    if (response.status === 403) throw new Error('FORBIDDEN');
    if (response.status === 404) throw new Error('Vehículo no encontrado');
    throw new Error('Error al eliminar el vehículo');
  }
}
