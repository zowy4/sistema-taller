'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

interface Orden {
  id_orden: number;
  fecha_apertura: string;
  fecha_compromiso?: string;
  estado: string;
  total_estimado: number;
  notas?: string;
  diagnostico?: string;
  cliente: {
    id_cliente: number;
    nombre: string;
    apellido: string;
    telefono?: string;
    email?: string;
  };
  vehiculo: {
    id_vehiculo: number;
    marca: string;
    modelo: string;
    anio: number;
    placa: string;
    color?: string;
    numero_serie?: string;
  };
  tecnico: {
    nombre: string;
    apellido: string;
  };
  servicios_asignados: Array<{
    id_servicio: number;
    servicio: {
      nombre: string;
      descripcion?: string;
    };
    cantidad: number;
    precio_unitario: number;
  }>;
  repuestos_usados: Array<{
    id_repuesto: number;
    repuesto: {
      nombre: string;
      codigo: string;
      stock_actual: number;
    };
    cantidad: number;
    precio_unitario: number;
  }>;
}

export default function TecnicoOrdenDetallePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [orden, setOrden] = useState<Orden | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actualizando, setActualizando] = useState(false);

  useEffect(() => {
    fetchOrdenDetalle();
  }, [params.id]);

  const fetchOrdenDetalle = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${API_URL}/ordenes/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Error al cargar orden');
      }

      const data = await response.json();
      setOrden(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar orden');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEstado = async (nuevoEstado: string) => {
    if (!orden) return;
    
    const confirmMessage = nuevoEstado === 'en_proceso' 
      ? '¿Iniciar trabajo en esta orden?' 
      : '¿Marcar esta orden como completada? Esto notificará a recepción para facturar.';
    
    if (!confirm(confirmMessage)) return;

    setActualizando(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/ordenes/${orden.id_orden}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!response.ok) throw new Error('Error al actualizar estado');

      // Recargar datos
      await fetchOrdenDetalle();
      alert('Estado actualizado correctamente');
    } catch (err: any) {
      alert(err.message || 'Error al actualizar estado');
    } finally {
      setActualizando(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'en_proceso':
        return 'bg-blue-100 text-blue-800';
      case 'completada':
        return 'bg-green-100 text-green-800';
      case 'facturada':
        return 'bg-purple-100 text-purple-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'en_proceso':
        return 'En Proceso';
      case 'completada':
        return 'Completada';
      case 'facturada':
        return 'Facturada';
      case 'cancelada':
        return 'Cancelada';
      default:
        return estado;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRoles={['tecnico']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-600">Cargando orden...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !orden) {
    return (
      <ProtectedRoute requiredRoles={['tecnico']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">{error || 'Orden no encontrada'}</div>
            <Link
              href="/tecnico"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Volver a mis órdenes
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const totalServicios = orden.servicios_asignados.reduce(
    (sum, s) => sum + (s.cantidad * s.precio_unitario),
    0
  );

  const totalRepuestos = orden.repuestos_usados.reduce(
    (sum, r) => sum + (r.cantidad * r.precio_unitario),
    0
  );

  return (
    <ProtectedRoute requiredRoles={['tecnico']}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/tecnico"
              className="text-blue-600 hover:text-blue-800 font-medium mb-4 inline-block"
            >
              ← Volver a mis órdenes
            </Link>
            
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Orden #{orden.id_orden.toString().padStart(3, '0')}
                </h1>
                <p className="text-gray-600 mt-1">
                  Abierta el {new Date(orden.fecha_apertura).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getEstadoColor(orden.estado)}`}>
                {getEstadoLabel(orden.estado)}
              </span>
            </div>
          </div>

          {/* Botones de Acción */}
          {(orden.estado === 'pendiente' || orden.estado === 'en_proceso') && (
            <div className="mb-6 bg-white shadow rounded-lg p-4">
              <div className="flex gap-3">
                {orden.estado === 'pendiente' && (
                  <button
                    onClick={() => handleUpdateEstado('en_proceso')}
                    disabled={actualizando}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {actualizando ? '⏳ Actualizando...' : '🔧 Iniciar Trabajo'}
                  </button>
                )}
                {orden.estado === 'en_proceso' && (
                  <button
                    onClick={() => handleUpdateEstado('completada')}
                    disabled={actualizando}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {actualizando ? '⏳ Actualizando...' : '✅ Marcar como Completada'}
                  </button>
                )}
              </div>
              {orden.estado === 'en_proceso' && (
                <p className="text-sm text-gray-600 mt-3 text-center">
                  Al completar, notificarás a recepción que la orden está lista para facturar
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna Principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Información del Vehículo */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>🚗</span> Vehículo
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Marca y Modelo</p>
                    <p className="font-semibold text-gray-900">
                      {orden.vehiculo.marca} {orden.vehiculo.modelo}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Año</p>
                    <p className="font-semibold text-gray-900">{orden.vehiculo.anio}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Placa</p>
                    <p className="font-semibold text-gray-900">{orden.vehiculo.placa}</p>
                  </div>
                  {orden.vehiculo.color && (
                    <div>
                      <p className="text-sm text-gray-600">Color</p>
                      <p className="font-semibold text-gray-900">{orden.vehiculo.color}</p>
                    </div>
                  )}
                  {orden.vehiculo.numero_serie && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">Número de Serie</p>
                      <p className="font-semibold text-gray-900 font-mono text-xs">
                        {orden.vehiculo.numero_serie}
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Link
                    href={`/tecnico/vehiculos/${orden.vehiculo.id_vehiculo}/historial`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    📋 Ver historial del vehículo →
                  </Link>
                </div>
              </div>

              {/* Servicios a Realizar */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>🔧</span> Servicios a Realizar
                </h2>
                {orden.servicios_asignados.length === 0 ? (
                  <p className="text-gray-500 text-sm">No hay servicios asignados</p>
                ) : (
                  <div className="space-y-3">
                    {orden.servicios_asignados.map((servicio, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {servicio.cantidad}x {servicio.servicio.nombre}
                            </p>
                            {servicio.servicio.descripcion && (
                              <p className="text-sm text-gray-600 mt-1">
                                {servicio.servicio.descripcion}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Repuestos Necesarios */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>🔩</span> Repuestos Necesarios
                </h2>
                {orden.repuestos_usados.length === 0 ? (
                  <p className="text-gray-500 text-sm">No hay repuestos asignados</p>
                ) : (
                  <div className="space-y-3">
                    {orden.repuestos_usados.map((repuesto, index) => (
                      <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {repuesto.cantidad}x {repuesto.repuesto.nombre}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Código: {repuesto.repuesto.codigo}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-medium ${
                              repuesto.repuesto.stock_actual >= repuesto.cantidad
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}>
                              Stock: {repuesto.repuesto.stock_actual}
                            </p>
                            {repuesto.repuesto.stock_actual < repuesto.cantidad && (
                              <p className="text-xs text-red-600 font-semibold">
                                ⚠️ Stock insuficiente
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 pt-4 border-t">
                  <Link
                    href="/tecnico/inventario"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    📦 Ver inventario completo →
                  </Link>
                </div>
              </div>

              {/* Notas y Diagnóstico */}
              {(orden.notas || orden.diagnostico) && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span>📝</span> Notas e Información
                  </h2>
                  
                  {orden.diagnostico && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Diagnóstico:</p>
                      <p className="text-gray-900 bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                        {orden.diagnostico}
                      </p>
                    </div>
                  )}
                  
                  {orden.notas && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Notas del Cliente/Recepción:</p>
                      <p className="text-gray-900 bg-yellow-50 p-3 rounded border-l-4 border-yellow-500">
                        {orden.notas}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Columna Lateral */}
            <div className="space-y-6">
              {/* Información del Cliente */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>👤</span> Cliente
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Nombre</p>
                    <p className="font-semibold text-gray-900">
                      {orden.cliente.nombre} {orden.cliente.apellido}
                    </p>
                  </div>
                  {orden.cliente.telefono && (
                    <div>
                      <p className="text-sm text-gray-600">Teléfono</p>
                      <a
                        href={`tel:${orden.cliente.telefono}`}
                        className="font-semibold text-blue-600 hover:text-blue-800"
                      >
                        {orden.cliente.telefono}
                      </a>
                    </div>
                  )}
                  {orden.cliente.email && (
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <a
                        href={`mailto:${orden.cliente.email}`}
                        className="font-semibold text-blue-600 hover:text-blue-800 text-sm break-all"
                      >
                        {orden.cliente.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Fechas Importantes */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>📅</span> Fechas
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Fecha de Apertura</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(orden.fecha_apertura).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {orden.fecha_compromiso && (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-gray-600">Fecha de Entrega Estimada</p>
                      <p className="font-semibold text-green-700">
                        {new Date(orden.fecha_compromiso).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Técnico Asignado */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <span>🔧</span> Técnico Asignado
                </h2>
                <p className="text-xl font-bold text-blue-900">
                  {orden.tecnico.nombre} {orden.tecnico.apellido}
                </p>
                <p className="text-sm text-blue-700 mt-1">Responsable del trabajo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
