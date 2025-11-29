/**
 * Servicios API para Facturas
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export interface Factura {
  id_factura: number;
  id_orden: number;
  numero_factura: string;
  fecha_emision: string;
  subtotal: number;
  impuesto: number;
  total: number;
  estado_pago: 'pendiente' | 'pagada' | 'vencida' | 'cancelada';
  metodo_pago?: string;
  notas?: string;
  orden?: {
    id_orden: number;
    fecha_ingreso: string;
    estado: string;
    cliente: {
      nombre: string;
      apellido: string;
      email: string;
    };
    vehiculo: {
      marca: string;
      modelo: string;
      patente: string;
    };
  };
}

export async function fetchFacturas(token: string): Promise<Factura[]> {
  const response = await fetch(`${API_URL}/facturas`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    if (response.status === 403) throw new Error('FORBIDDEN');
    throw new Error('Error al obtener facturas');
  }

  return response.json();
}

export async function fetchFacturaById(token: string, id: number): Promise<Factura> {
  const response = await fetch(`${API_URL}/facturas/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    if (response.status === 403) throw new Error('FORBIDDEN');
    if (response.status === 404) throw new Error('Factura no encontrada');
    throw new Error('Error al obtener la factura');
  }

  return response.json();
}

export async function fetchFacturaByOrden(token: string, idOrden: number): Promise<Factura> {
  const response = await fetch(`${API_URL}/facturas/orden/${idOrden}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    if (response.status === 403) throw new Error('FORBIDDEN');
    if (response.status === 404) throw new Error('Factura no encontrada');
    throw new Error('Error al obtener la factura');
  }

  return response.json();
}

export async function createFactura(
  token: string,
  data: Partial<Factura>
): Promise<Factura> {
  const response = await fetch(`${API_URL}/facturas`, {
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
    throw new Error('Error al crear la factura');
  }

  return response.json();
}

export async function facturarOrden(
  token: string,
  idOrden: number,
  data?: { metodo_pago?: string; notas?: string }
): Promise<Factura> {
  const response = await fetch(`${API_URL}/facturas/facturar/${idOrden}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data || {}),
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    if (response.status === 403) throw new Error('FORBIDDEN');
    throw new Error('Error al facturar la orden');
  }

  return response.json();
}

export async function updateFactura(
  token: string,
  id: number,
  data: Partial<Factura>
): Promise<Factura> {
  const response = await fetch(`${API_URL}/facturas/${id}`, {
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
    if (response.status === 404) throw new Error('Factura no encontrada');
    throw new Error('Error al actualizar la factura');
  }

  return response.json();
}

export async function deleteFactura(token: string, id: number): Promise<void> {
  const response = await fetch(`${API_URL}/facturas/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    if (response.status === 403) throw new Error('FORBIDDEN');
    if (response.status === 404) throw new Error('Factura no encontrada');
    throw new Error('Error al eliminar la factura');
  }
}
