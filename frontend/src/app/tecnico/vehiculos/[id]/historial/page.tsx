'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

interface Vehiculo {
  id_vehiculo: number;
  marca: string;
  modelo: string;
  anio: number;
  placa: string;
  color?: string;
  numero_serie?: string;
  cliente: {
    nombre: string;
    apellido: string;
    telefono?: string;
  };
}

interface OrdenHistorial {
  id_orden: number;
  fecha_apertura: string;
  fecha_cierre?: string;
  estado: string;
  total_estimado: number;
  notas?: string;
  diagnostico?: string;
  servicios_asignados: Array<{
    servicio: {
      nombre: string;
      descripcion?: string;
    };
    cantidad: number;
  }>;
  repuestos_usados: Array<{
    repuesto: {
      nombre: string;
      codigo: string;
    };
    cantidad: number;
  }>;
  tecnico: {
    nombre: string;
    apellido: string;
  };
}

export default function VehiculoHistorialPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [ordenes, setOrdenes] = useState<OrdenHistorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDatos();
  }, [params.id]);

  const fetchDatos = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Obtener datos del vehículo
      const vehiculoResponse = await fetch(`${API_URL}/vehiculos/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (vehiculoResponse.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      if (!vehiculoResponse.ok) {
        throw new Error('Error al cargar vehículo');
      }

      const vehiculoData = await vehiculoResponse.json();
      setVehiculo(vehiculoData);

      // Obtener historial de órdenes
      const ordenesResponse = await fetch(`${API_URL}/vehiculos/${params.id}/historial`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (ordenesResponse.ok) {
        const ordenesData = await ordenesResponse.json();
        setOrdenes(ordenesData);
      }

      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
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
          <div className="text-gray-600">Cargando historial...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !vehiculo) {
    return (
      <ProtectedRoute requiredRoles={['tecnico']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">{error || 'Vehículo no encontrado'}</div>
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

  const ordenesCompletadas = ordenes.filter(o => o.estado === 'completada' || o.estado === 'facturada');
  const totalServicios = ordenesCompletadas.reduce((sum, o) => sum + o.servicios_asignados.length, 0);

  return (
    <ProtectedRoute requiredRoles={['tecnico']}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/tecnico"
              className="text-blue-600 hover:text-blue-800 font-medium mb-4 inline-block"
            >
              ← Volver a mis órdenes
            </Link>
            
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="bg-blue-100 rounded-full p-4">
                    <span className="text-4xl">🚗</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {vehiculo.marca} {vehiculo.modelo} ({vehiculo.anio})
                    </h1>
                    <p className="text-gray-600 mt-1">Placa: {vehiculo.placa}</p>
                    {vehiculo.color && (
                      <p className="text-gray-600">Color: {vehiculo.color}</p>
                    )}
                    {vehiculo.numero_serie && (
                      <p className="text-xs text-gray-500 font-mono mt-2">
                        S/N: {vehiculo.numero_serie}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Propietario</p>
                  <p className="font-semibold text-gray-900">
                    {vehiculo.cliente.nombre} {vehiculo.cliente.apellido}
                  </p>
                  {vehiculo.cliente.telefono && (
                    <p className="text-sm text-gray-600 mt-1">
                      {vehiculo.cliente.telefono}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas del Vehículo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Órdenes</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{ordenes.length}</p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <span className="text-2xl">📋</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Servicios Realizados</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{totalServicios}</p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completadas</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">{ordenesCompletadas.length}</p>
                </div>
                <div className="bg-purple-100 rounded-full p-3">
                  <span className="text-2xl">🏁</span>
                </div>
              </div>
            </div>
          </div>

          {/* Historial de Órdenes */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Historial de Órdenes</h2>
            
            {ordenes.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📝</div>
                <p className="text-gray-600">Este vehículo no tiene órdenes previas</p>
              </div>
            ) : (
              <div className="space-y-6">
                {ordenes.map((orden) => (
                  <div key={orden.id_orden} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Orden #{orden.id_orden.toString().padStart(3, '0')}
                          </h3>
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(orden.estado)}`}>
                            {getEstadoLabel(orden.estado)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Apertura: {new Date(orden.fecha_apertura).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                        {orden.fecha_cierre && (
                          <p className="text-sm text-gray-600">
                            Cierre: {new Date(orden.fecha_cierre).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        )}
                      </div>
                      <Link
                        href={`/tecnico/ordenes/${orden.id_orden}`}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Ver Detalle →
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Servicios */}
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Servicios realizados:</p>
                        {orden.servicios_asignados.length === 0 ? (
                          <p className="text-sm text-gray-500">Sin servicios</p>
                        ) : (
                          <ul className="space-y-1">
                            {orden.servicios_asignados.map((servicio, idx) => (
                              <li key={idx} className="text-sm text-gray-900">
                                • {servicio.cantidad}x {servicio.servicio.nombre}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Repuestos */}
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Repuestos utilizados:</p>
                        {orden.repuestos_usados.length === 0 ? (
                          <p className="text-sm text-gray-500">Sin repuestos</p>
                        ) : (
                          <ul className="space-y-1">
                            {orden.repuestos_usados.map((repuesto, idx) => (
                              <li key={idx} className="text-sm text-gray-900">
                                • {repuesto.cantidad}x {repuesto.repuesto.nombre} ({repuesto.repuesto.codigo})
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    {/* Diagnóstico y Notas */}
                    {(orden.diagnostico || orden.notas) && (
                      <div className="mt-4 pt-4 border-t">
                        {orden.diagnostico && (
                          <div className="mb-2">
                            <p className="text-sm font-semibold text-gray-700">Diagnóstico:</p>
                            <p className="text-sm text-gray-900">{orden.diagnostico}</p>
                          </div>
                        )}
                        {orden.notas && (
                          <div>
                            <p className="text-sm font-semibold text-gray-700">Notas:</p>
                            <p className="text-sm text-gray-900">{orden.notas}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Técnico */}
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-600">
                        Técnico: <span className="font-medium text-gray-900">
                          {orden.tecnico.nombre} {orden.tecnico.apellido}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
