export interface Cliente {
  id_cliente: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion?: string;
  activo: boolean;
  fecha_registro: string;
}
export interface CreateClienteDto {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion?: string;
  activo?: boolean;
}
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
export interface CreateVehiculoDto {
  id_cliente: number;
  marca: string;
  modelo: string;
  anio: number;
  patente: string;
  vin?: string;
  color?: string;
  kilometraje?: number;
  tipo_combustible?: string;
}
export type EstadoOrden = 'pendiente' | 'en_proceso' | 'completada' | 'cancelada';
export interface Orden {
  id_orden: number;
  id_cliente: number;
  id_vehiculo: number;
  id_empleado_asignado?: number;
  fecha_ingreso: string;
  fecha_estimada?: string;
  fecha_entrega?: string;
  estado: EstadoOrden;
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
  servicios_asignados?: ServicioAsignado[];
  repuestos_usados?: RepuestoUsado[];
  factura?: Factura;
}
export interface ServicioAsignado {
  id_servicio_asignado: number;
  id_orden: number;
  id_servicio: number;
  precio: number;
  servicio: Servicio;
}
export interface CreateOrdenDto {
  id_cliente: number;
  id_vehiculo: number;
  id_empleado_asignado?: number;
  fecha_estimada?: string;
  descripcion_problema: string;
  observaciones?: string;
}
export type EstadoEmpleado = 'activo' | 'inactivo';
export interface Empleado {
  id_empleado: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  cargo: string;
  fecha_contratacion: string;
  salario: number;
  estado: EstadoEmpleado;
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
  estado?: EstadoEmpleado;
}
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
export interface CreateRepuestoDto {
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
}
export interface StockBajo {
  id_repuesto: number;
  nombre: string;
  codigo: string;
  stock_actual: number;
  stock_minimo: number;
  precio_venta: number;
}
export interface RepuestoUsado {
  id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  id_orden: number;
  id_repuesto: number;
  repuesto: Repuesto;
}
export interface CreateRepuestoUsadoDto {
  id_repuesto: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}
export type EstadoPago = 'pendiente' | 'pagada' | 'vencida' | 'cancelada';
export interface Factura {
  id_factura: number;
  id_orden: number;
  numero_factura: string;
  fecha_emision: string;
  subtotal: number;
  impuesto: number;
  total: number;
  estado_pago: EstadoPago;
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
export interface Proveedor {
  id_proveedor: number;
  nombre: string;
  empresa?: string;
  telefono: string;
  email: string;
  direccion?: string;
  activo: boolean;
  fecha_alta?: string;
  notas?: string;
  compras?: Compra[];
  _count?: {
    compras: number;
    repuestos: number;
  };
}
export interface CreateProveedorDto {
  nombre: string;
  empresa?: string;
  telefono: string;
  email: string;
  direccion?: string;
  notas?: string;
}
export type EstadoCompra = 'pendiente' | 'completada' | 'cancelada';
export interface CompraRepuesto {
  id_compra_repuesto?: number;
  id_repuesto: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  repuesto?: {
    nombre: string;
    codigo: string;
  };
}
export interface Compra {
  id_compra: number;
  id_proveedor: number;
  fecha_compra: string;
  total: number;
  estado: EstadoCompra;
  notas?: string;
  proveedor: {
    nombre: string;
    empresa?: string;
  };
  compras_repuestos: CompraRepuesto[];
}
export interface CreateCompraDto {
  id_proveedor: number;
  fecha_compra: string;
  notas?: string;
  repuestos: Array<{
    id_repuesto: number;
    cantidad: number;
    precio_unitario: number;
  }>;
}
export interface Servicio {
  id_servicio: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  tiempo_estimado?: number;
  activo: boolean;
}
export interface DashboardKPIs {
  clientes_total: number;
  clientes_activos: number;
  ordenes_pendientes: number;
  ordenes_en_proceso: number;
  ordenes_completadas: number;
  servicios_activos: number;
  ingresos_mes: number;
  stock_bajo: number;
  repuestos_total: number;
}
export interface VentasSemana {
  dia: string;
  total: number;
  ordenes: number;
}
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
  estado_pago: EstadoPago;
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
export interface User {
  id_usuario: number;
  email: string;
  rol: 'admin' | 'cliente' | 'empleado';
  permisos?: string[];
  empleado?: {
    id_empleado: number;
    nombre: string;
    apellido: string;
  };
  cliente?: {
    id_cliente: number;
    nombre: string;
    apellido: string;
  };
}
export interface LoginCredentials {
  email: string;
  password: string;
}
export interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono: string;
  direccion?: string;
}
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
