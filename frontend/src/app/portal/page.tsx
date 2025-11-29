'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchMiPerfil,
  fetchMisVehiculos,
  fetchMisOrdenes,
  type PerfilCliente,
  type VehiculoPortal,
  type OrdenPortal,
} from '@/services/portal.service';

export default function PortalPage() {
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Redirect si no hay token
  useEffect(() => {
    if (!token) {
      toast.error('Sesión expirada', {
        description: 'Por favor, inicia sesión nuevamente',
      });
      router.push('/login');
    }
  }, [token, router]);

  // ==========================================
  // QUERIES EN PARALELO
  // ==========================================

  const { data: perfil, isLoading: perfilLoading, error: perfilError } = useQuery({
    queryKey: ['portal-perfil'],
    queryFn: async () => {
      return await fetchMiPerfil(token!);
    },
    enabled: !!token,
    retry: 1,
  });

  const { data: vehiculos = [], isLoading: vehiculosLoading, error: vehiculosError } = useQuery({
    queryKey: ['portal-vehiculos'],
    queryFn: async () => {
      return await fetchMisVehiculos(token!);
    },
    enabled: !!token,
    retry: 1,
  });

  const { data: ordenes = [], isLoading: ordenesLoading, error: ordenesError } = useQuery({
    queryKey: ['portal-ordenes'],
    queryFn: async () => {
      return await fetchMisOrdenes(token!);
    },
    enabled: !!token,
    retry: 1,
  });

  // Manejar errores de autenticación
  useEffect(() => {
    if (perfilError && perfilError.message === 'UNAUTHORIZED') {
      localStorage.removeItem('token');
      toast.error('Sesión expirada');
      router.push('/login');
    }
  }, [perfilError, vehiculosError, ordenesError, router]);

  // ==========================================
  // FILTROS
  // ==========================================

  const ordenesActivas = ordenes.filter((o) => 
    o.estado === 'pendiente' || o.estado === 'en_proceso' || o.estado === 'esperando_repuestos'
  );

  const ordenesCompletadas = ordenes.filter((o) => 
    o.estado === 'completada' || o.estado === 'entregada'
  );

  const vehiculosEnTaller = vehiculos.filter((v) => v.orden_activa);

  // ==========================================
  // HELPERS
  // ==========================================

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, { color: string; label: string; icon: string }> = {
      pendiente: { color: 'bg-gray-100 text-gray-800', label: 'Pendiente', icon: '⏳' },
      en_proceso: { color: 'bg-blue-100 text-blue-800', label: 'En Proceso', icon: '🔧' },
      esperando_repuestos: { color: 'bg-yellow-100 text-yellow-800', label: 'Esperando Repuestos', icon: '📦' },
      completada: { color: 'bg-green-100 text-green-800', label: 'Completada', icon: '✅' },
      entregada: { color: 'bg-green-100 text-green-800', label: 'Entregada', icon: '🚗' },
      cancelada: { color: 'bg-red-100 text-red-800', label: 'Cancelada', icon: '❌' },
    };

    const badge = badges[estado] || badges.pendiente;
    return (
      <span className={`px-5 py-2 rounded-xl text-base font-semibold shadow-md ${badge.color}`}>
        {badge.icon} {badge.label}
      </span>
    );
  };

  // ==========================================
  // LOADING STATE
  // ==========================================

  if (perfilLoading || vehiculosLoading || ordenesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tu portal...</p>
        </div>
      </div>
    );
  }

  if (!perfil) {
    return null;
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Fijo Superior */}
      <div className="bg-white border-b shadow-md sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-2xl font-bold text-blue-600">🚗 Portal del Cliente</div>
              <div className="border-l border-gray-300 pl-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Hola, {perfil.nombre} {perfil.apellido}
                </h2>
                <p className="text-sm text-gray-500">{perfil.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Invertido</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(vehiculos.reduce((sum, v) => sum + v.total_gastado, 0))}
                </p>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  toast.info('Sesión cerrada');
                  router.push('/login');
                }}
                className="px-5 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Grid Layout */}
      <div className="max-w-[1920px] mx-auto px-8 py-8">
        
        {/* Stats Bar Compacto */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Vehículos</p>
                <p className="text-3xl font-bold text-blue-600">{vehiculos.length}</p>
              </div>
              <span className="text-4xl">🚗</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">En Taller</p>
                <p className="text-3xl font-bold text-orange-600">{ordenesActivas.length}</p>
              </div>
              <span className="text-4xl">🔧</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completadas</p>
                <p className="text-3xl font-bold text-green-600">{ordenesCompletadas.length}</p>
              </div>
              <span className="text-4xl">✅</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Servicios</p>
                <p className="text-3xl font-bold text-purple-600">{ordenes.length}</p>
              </div>
              <span className="text-4xl">📊</span>
            </div>
          </div>
        </div>

        {/* Layout Principal: Sidebar (33%) + Content (67%) */}
        <div className="grid grid-cols-3 gap-8">
          
          {/* COLUMNA IZQUIERDA: Mis Vehículos (33%) */}
          <div className="col-span-1 space-y-6">{vehiculos.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-blue-600 text-white px-6 py-4">
                  <h3 className="text-xl font-bold">🚗 Mis Vehículos</h3>
                </div>
                <div className="divide-y">
                  {vehiculos.map((vehiculo) => (
                    <div key={vehiculo.id_vehiculo} className="p-6 hover:bg-gray-50 transition">
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          {vehiculo.foto_url ? (
                            <img src={vehiculo.foto_url} alt="Vehículo" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <span className="text-3xl">🚗</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-lg">
                            {vehiculo.marca} {vehiculo.modelo}
                          </h4>
                          <p className="text-sm text-gray-600">{vehiculo.patente} • {vehiculo.anio}</p>
                          {vehiculo.color && (
                            <p className="text-xs text-gray-500">{vehiculo.color}</p>
                          )}
                          
                          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-blue-50 px-2 py-1 rounded">
                              <span className="text-gray-600">Servicios:</span>
                              <span className="font-bold text-blue-600 ml-1">{vehiculo.ordenes_completadas}</span>
                            </div>
                            <div className="bg-green-50 px-2 py-1 rounded">
                              <span className="text-gray-600">Gastado:</span>
                              <span className="font-bold text-green-600 ml-1 text-xs">
                                {formatCurrency(vehiculo.total_gastado)}
                              </span>
                            </div>
                          </div>

                          {vehiculo.orden_activa && (
                            <div className="mt-3 bg-orange-50 border border-orange-200 rounded px-3 py-2">
                              <p className="text-xs font-bold text-orange-800">
                                ⚠️ En Taller (Orden #{vehiculo.orden_activa.id_orden})
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="text-6xl mb-4">🚗</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No hay vehículos</h3>
                <p className="text-gray-600">Contacta al taller para registrar tu primer vehículo</p>
              </div>
            )}
          </div>

          {/* COLUMNA DERECHA: Órdenes Activas y Historial (67%) */}
          <div className="col-span-2 space-y-6">
            
            {/* Órdenes Activas */}
            {ordenesActivas.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-orange-600 text-white px-6 py-4">
                  <h3 className="text-xl font-bold">🔧 Reparaciones en Curso</h3>
                </div>
                <div className="divide-y">
                  {ordenesActivas.map((orden) => (
                    <div key={orden.id_orden} className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-bold text-gray-900">Orden #{orden.id_orden}</h4>
                            {getEstadoBadge(orden.estado)}
                          </div>
                          <p className="text-gray-700 font-medium mb-1">
                            {orden.vehiculo.marca} {orden.vehiculo.modelo} - {orden.vehiculo.patente}
                          </p>
                          <p className="text-gray-600">{orden.descripcion_problema}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-green-600">{formatCurrency(orden.total)}</p>
                        </div>
                      </div>

                      {/* Barra de Progreso */}
                      <div className="bg-gray-200 rounded-full h-3 mb-3">
                        <div 
                          className={`h-3 rounded-full ${
                            orden.estado === 'pendiente' ? 'bg-gray-400 w-1/4' :
                            orden.estado === 'en_proceso' ? 'bg-blue-500 w-1/2' :
                            orden.estado === 'esperando_repuestos' ? 'bg-yellow-500 w-3/4' :
                            'bg-green-500 w-full'
                          }`}
                        ></div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Ingreso</p>
                          <p className="font-semibold">{formatDate(orden.fecha_ingreso)}</p>
                        </div>
                        {orden.fecha_estimada && (
                          <div>
                            <p className="text-gray-500">Estimado</p>
                            <p className="font-semibold text-blue-600">{formatDate(orden.fecha_estimada)}</p>
                          </div>
                        )}
                        {orden.empleado && (
                          <div>
                            <p className="text-gray-500">Mecánico</p>
                            <p className="font-semibold">{orden.empleado.nombre} {orden.empleado.apellido}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Sin reparaciones activas</h3>
                <p className="text-gray-600">Todos tus vehículos están listos</p>
              </div>
            )}

            {/* Historial de Servicios - Tabla */}
            {ordenesCompletadas.length > 0 && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-green-600 text-white px-6 py-4">
                  <h3 className="text-xl font-bold">✅ Historial de Servicios</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orden</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehículo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado Pago</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {ordenesCompletadas.slice(0, 10).map((orden) => (
                        <tr key={orden.id_orden} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-semibold text-blue-600">#{orden.id_orden}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {orden.vehiculo.marca} {orden.vehiculo.modelo}
                            </div>
                            <div className="text-xs text-gray-500">{orden.vehiculo.patente}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700 max-w-xs truncate">
                              {orden.descripcion_problema}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatDate(orden.fecha_entrega || orden.fecha_ingreso)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className="text-lg font-bold text-gray-900">
                              {formatCurrency(orden.total)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {orden.factura ? (
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                orden.factura.estado_pago === 'pagada'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {orden.factura.estado_pago === 'pagada' ? '✓ Pagada' : '⚠ Pendiente'}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">Sin factura</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Empty State Global */}
        {vehiculos.length === 0 && ordenes.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-16 text-center col-span-3">
            <div className="text-9xl mb-6">🚗</div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Bienvenido a tu Portal</h3>
            <p className="text-xl text-gray-600 mb-8">
              Aquí podrás ver el estado de tus vehículos y servicios en tiempo real.
            </p>
            <a
              href="tel:+123456789"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              📞 Contactar al Taller
            </a>
          </div>
        )}


      </div>
    </div>
  );
}
