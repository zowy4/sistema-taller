const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
export interface PerfilCliente {
  id_cliente: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion?: string;
  fecha_registro: string;
}
export interface VehiculoPortal {
  id_vehiculo: number;
  marca: string;
  modelo: string;
  anio: number;
  patente: string;
  vin?: string;
  color?: string;
  kilometraje?: number;
  foto_url?: string;
  ordenes_completadas: number;
  total_gastado: number;
  orden_activa?: {
    id_orden: number;
    estado: string;
    fecha_estimada?: string;
    descripcion_problema: string;
  };
}
export interface OrdenPortal {
  id_orden: number;
  fecha_ingreso: string;
  fecha_estimada?: string;
  fecha_entrega?: string;
  estado: 'pendiente' | 'en_proceso' | 'esperando_repuestos' | 'completada' | 'entregada' | 'cancelada';
  descripcion_problema: string;
  observaciones?: string;
  costo_mano_obra: number;
  costo_repuestos: number;
  total: number;
  vehiculo: {
    id_vehiculo: number;
    marca: string;
    modelo: string;
    patente: string;
  };
  empleado?: {
    nombre: string;
    apellido: string;
  };
  repuestos_usados?: {
    repuesto: {
      nombre: string;
      codigo: string;
    };
    cantidad: number;
    precio_unitario: number;
  }[];
  factura?: {
    id_factura: number;
    numero_factura: string;
    estado_pago: string;
  };
}
export interface FacturaPortal {
  id_factura: number;
  numero_factura: string;
  fecha_emision: string;
  subtotal: number;
  impuesto: number;
  total: number;
  estado_pago: 'pendiente' | 'pagada' | 'vencida' | 'cancelada';
  metodo_pago?: string;
  orden: {
    id_orden: number;
    descripcion_problema: string;
    vehiculo: {
      marca: string;
      modelo: string;
      patente: string;
    };
  };
}
export interface DashboardSummary {
  vehiculos_count: number;
  ordenes_activas: number;
  facturas_pendientes: number;
  ultimo_servicio?: string;
  total_gastado: number;
}
export async function fetchDashboardSummary(token: string): Promise<DashboardSummary> {
  const response = await fetch(`${API_URL}/portal/dashboard/summary`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    if (response.status === 403) throw new Error('FORBIDDEN');
    throw new Error('Error al obtener resumen del dashboard');
  }
  return response.json();
}
export async function fetchMiPerfil(token: string): Promise<PerfilCliente> {
  const response = await fetch(`${API_URL}/portal/perfil`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    throw new Error('Error al obtener perfil');
  }
  return response.json();
}
export async function updateMiPerfil(
  token: string,
  data: Partial<PerfilCliente>
): Promise<PerfilCliente> {
  const response = await fetch(`${API_URL}/portal/perfil`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    throw new Error('Error al actualizar perfil');
  }
  return response.json();
}
export async function fetchMisVehiculos(token: string): Promise<VehiculoPortal[]> {
  const response = await fetch(`${API_URL}/portal/vehiculos`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    throw new Error('Error al obtener vehó­culos');
  }
  return response.json();
}
export async function fetchHistorialVehiculo(
  token: string,
  idVehiculo: number
): Promise<OrdenPortal[]> {
  const response = await fetch(`${API_URL}/portal/vehiculos/${idVehiculo}/historial`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    if (response.status === 404) throw new Error('Vehó­culo no encontrado');
    throw new Error('Error al obtener historial del vehó­culo');
  }
  return response.json();
}
export async function fetchMisOrdenes(
  token: string,
  estado?: string
): Promise<OrdenPortal[]> {
  const url = estado 
    ? `${API_URL}/portal/ordenes?estado=${estado}`
    : `${API_URL}/portal/ordenes`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    throw new Error('Error al obtener ó³rdenes');
  }
  return response.json();
}
export async function fetchDetalleOrden(
  token: string,
  idOrden: number
): Promise<OrdenPortal> {
  const response = await fetch(`${API_URL}/portal/ordenes/${idOrden}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    if (response.status === 404) throw new Error('Orden no encontrada');
    throw new Error('Error al obtener detalle de la orden');
  }
  return response.json();
}
export async function fetchMisFacturas(
  token: string,
  estadoPago?: string
): Promise<FacturaPortal[]> {
  const url = estadoPago
    ? `${API_URL}/portal/facturas?estado_pago=${estadoPago}`
    : `${API_URL}/portal/facturas`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    throw new Error('Error al obtener facturas');
  }
  return response.json();
}
export async function descargarFacturaPDF(
  token: string,
  idFactura: number
): Promise<Blob> {
  const response = await fetch(`${API_URL}/portal/facturas/${idFactura}/pdf`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    if (response.status === 404) throw new Error('Factura no encontrada');
    throw new Error('Error al descargar factura');
  }
  return response.blob();
}
