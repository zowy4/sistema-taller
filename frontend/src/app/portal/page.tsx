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
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                ¡Hola, {perfil.nombre}! 👋
              </h1>
              <p className="text-sm text-gray-600">Bienvenido a tu portal</p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                toast.info('Sesión cerrada');
                router.push('/login');
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <p className="text-2xl font-bold text-blue-600">{vehiculos.length}</p>
            <p className="text-xs text-gray-600">Vehículos</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <p className="text-2xl font-bold text-orange-600">{ordenesActivas.length}</p>
            <p className="text-xs text-gray-600">En Taller</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <p className="text-2xl font-bold text-green-600">{ordenesCompletadas.length}</p>
            <p className="text-xs text-gray-600">Completadas</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(vehiculos.reduce((sum, v) => sum + v.total_gastado, 0))}
            </p>
            <p className="text-xs text-gray-600">Total Gastado</p>
          </div>
        </div>

        {/* Órdenes Activas */}
        {ordenesActivas.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="bg-blue-50 px-4 py-3 border-b">
              <h2 className="font-semibold text-blue-900 flex items-center gap-2">
                🔧 Órdenes Activas ({ordenesActivas.length})
              </h2>
            </div>
            <div className="divide-y">
              {ordenesActivas.map((orden) => (
                <div key={orden.id_orden} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">
                          Orden #{orden.id_orden}
                        </span>
                        {getEstadoBadge(orden.estado)}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {orden.vehiculo.marca} {orden.vehiculo.modelo} - {orden.vehiculo.patente}
                      </p>
                      <p className="text-sm text-gray-700">{orden.descripcion_problema}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <div>
                      <p className="text-xs text-gray-500">Ingreso</p>
                      <p className="text-sm font-medium">{formatDate(orden.fecha_ingreso)}</p>
                    </div>
                    {orden.fecha_estimada && (
                      <div>
                        <p className="text-xs text-gray-500">Estimado</p>
                        <p className="text-sm font-medium text-blue-600">
                          {formatDate(orden.fecha_estimada)}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(orden.total)}
                      </p>
                    </div>
                  </div>

                  {orden.empleado && (
                    <div className="mt-2 text-xs text-gray-500">
                      Mecánico: {orden.empleado.nombre} {orden.empleado.apellido}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mis Vehículos */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              🚗 Mis Vehículos ({vehiculos.length})
            </h2>
          </div>
          <div className="divide-y">
            {vehiculos.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No tienes vehículos registrados</p>
              </div>
            ) : (
              vehiculos.map((vehiculo) => (
                <div key={vehiculo.id_vehiculo} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start gap-4">
                    {/* Foto del vehículo */}
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {vehiculo.foto_url ? (
                        <img 
                          src={vehiculo.foto_url} 
                          alt={`${vehiculo.marca} ${vehiculo.modelo}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl">🚗</span>
                      )}
                    </div>

                    {/* Detalles */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {vehiculo.marca} {vehiculo.modelo} {vehiculo.anio}
                          </h3>
                          <p className="text-sm text-gray-600">Patente: {vehiculo.patente}</p>
                          {vehiculo.color && (
                            <p className="text-xs text-gray-500">Color: {vehiculo.color}</p>
                          )}
                        </div>
                        {vehiculo.orden_activa && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                            ⚠️ En Taller
                          </span>
                        )}
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-gray-500">Servicios</p>
                          <p className="font-medium">{vehiculo.ordenes_completadas}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total Gastado</p>
                          <p className="font-medium">{formatCurrency(vehiculo.total_gastado)}</p>
                        </div>
                      </div>

                      {vehiculo.orden_activa && (
                        <div className="mt-3 p-2 bg-orange-50 rounded border border-orange-200">
                          <p className="text-xs font-medium text-orange-900">
                            Orden #{vehiculo.orden_activa.id_orden} - {vehiculo.orden_activa.estado}
                          </p>
                          <p className="text-xs text-orange-700 mt-1">
                            {vehiculo.orden_activa.descripcion_problema}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Historial Reciente */}
        {ordenesCompletadas.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="bg-green-50 px-4 py-3 border-b">
              <h2 className="font-semibold text-green-900 flex items-center gap-2">
                ✅ Servicios Completados ({ordenesCompletadas.length})
              </h2>
            </div>
            <div className="divide-y">
              {ordenesCompletadas.slice(0, 5).map((orden) => (
                <div key={orden.id_orden} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">Orden #{orden.id_orden}</span>
                        <span className="text-xs text-gray-500">
                          {formatDate(orden.fecha_entrega || orden.fecha_ingreso)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {orden.vehiculo.marca} {orden.vehiculo.modelo}
                      </p>
                      <p className="text-sm text-gray-700">{orden.descripcion_problema}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(orden.total)}
                      </p>
                      {orden.factura && (
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          orden.factura.estado_pago === 'pagada'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {orden.factura.estado_pago === 'pagada' ? '✓ Pagada' : '⚠ Pendiente'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {vehiculos.length === 0 && ordenes.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <div className="text-6xl mb-4">🚗</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Bienvenido a tu Portal
            </h3>
            <p className="text-gray-600 mb-6">
              Aquí podrás ver el estado de tus vehículos y servicios.<br />
              Contacta al taller para registrar tu primer vehículo.
            </p>
            <a
              href="tel:+123456789"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              📞 Contactar al Taller
            </a>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 py-6">
          <p>¿Necesitas ayuda? Llámanos al (123) 456-7890</p>
        </div>
      </div>
    </div>
  );
}
