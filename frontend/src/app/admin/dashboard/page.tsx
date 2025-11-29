'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardKPIs, fetchStockBajo, fetchVentasSemana } from '@/services/dashboard.service';
import { useEffect } from 'react';

/**
 * Dashboard con Tanstack Query
 * 
 * ✅ Manejo automático de estado de carga
 * ✅ Manejo automático de errores
 * ✅ Caché inteligente (datos persisten al navegar)
 * ✅ Deduplicación de peticiones
 * ✅ Revalidación automática
 */

interface RepuestoStockBajo {
  id_repuesto: number;
  nombre: string;
  codigo?: string;
  stock_actual: number;
  stock_minimo: number;
  precio_venta: number;
  urgencia?: string;
}

interface VentaSemana {
  dia: string;
  total: number;
  ordenes: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();

  const isRecepcion = user?.rol === 'recepcion';

  // Obtener el token una vez
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // ✅ Query para KPIs del dashboard
  const {
    data: kpis,
    isLoading: kpisLoading,
    isError: kpisError,
    error: kpisErrorDetail,
  } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: () => fetchDashboardKPIs(token!),
    enabled: !!token && !authLoading && !!user && !isRecepcion, // Solo ejecutar si hay token y usuario
    retry: 1,
  });

  // ✅ Query para stock bajo
  const {
    data: stockBajo = [],
    isLoading: stockLoading,
    isError: stockError,
  } = useQuery({
    queryKey: ['dashboard-stock-bajo'],
    queryFn: () => fetchStockBajo(token!),
    enabled: !!token && !authLoading && !!user && !isRecepcion,
    retry: 1,
  });

  // ✅ Query para ventas de la semana
  const {
    data: ventasSemana = [],
    isLoading: ventasLoading,
    isError: ventasError,
  } = useQuery({
    queryKey: ['dashboard-ventas-semana'],
    queryFn: () => fetchVentasSemana(token!),
    enabled: !!token && !authLoading && !!user && !isRecepcion,
    retry: 1,
  });

  // Manejo de errores de autenticación
  useEffect(() => {
    if (kpisErrorDetail?.message === 'UNAUTHORIZED') {
      logout();
      router.push('/login');
    }
  }, [kpisErrorDetail, logout, router]);

  // Estados combinados
  const loading = authLoading || (kpisLoading && stockLoading && ventasLoading);
  const hasError = kpisError || stockError || ventasError;

  // Funciones auxiliares
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✅ Loading State (Mejorado con skeleton)
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-10 bg-gray-200 rounded w-1/3 mb-6 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-3 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ✅ Error State (Manejo específico de errores)
  if (hasError && !isRecepcion) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-100 border border-red-300 text-red-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">⚠️ Error al cargar el dashboard</h2>
            <p className="mb-4">
              {kpisErrorDetail?.message === 'UNAUTHORIZED' 
                ? 'Tu sesión ha expirado. Redirigiendo al login...'
                : kpisErrorDetail?.message === 'FORBIDDEN'
                ? 'No tienes permisos para ver esta información.'
                : 'Hubo un problema al cargar los datos. Por favor, intenta de nuevo.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista simplificada para recepcion
  if (isRecepcion) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Bienvenido al Panel de Recepción</h1>
          
          {/* Acciones Rápidas para Recepción */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link
              href="/admin/ordenes/new"
              className="bg-blue-600 text-white p-8 rounded-lg hover:bg-blue-700 transition-colors text-center shadow-lg"
            >
              <div className="text-5xl mb-3">📋</div>
              <h3 className="text-xl font-semibold mb-2">Nueva Orden</h3>
              <p className="text-sm text-blue-100">Crear orden de trabajo</p>
            </Link>

            <Link
              href="/admin/clients/new"
              className="bg-green-600 text-white p-8 rounded-lg hover:bg-green-700 transition-colors text-center shadow-lg"
            >
              <div className="text-5xl mb-3">👤</div>
              <h3 className="text-xl font-semibold mb-2">Nuevo Cliente</h3>
              <p className="text-sm text-green-100">Registrar cliente</p>
            </Link>

            <Link
              href="/admin/vehiculos/new"
              className="bg-purple-600 text-white p-8 rounded-lg hover:bg-purple-700 transition-colors text-center shadow-lg"
            >
              <div className="text-5xl mb-3">🚗</div>
              <h3 className="text-xl font-semibold mb-2">Nuevo Vehículo</h3>
              <p className="text-sm text-purple-100">Registrar vehículo</p>
            </Link>
          </div>

          {/* Accesos Directos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Accesos Rápidos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/admin/ordenes" className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-2xl">📋</span>
                <div>
                  <p className="font-medium">Órdenes de Trabajo</p>
                  <p className="text-sm text-gray-600">Ver todas las órdenes</p>
                </div>
              </Link>
              
              <Link href="/admin/clients" className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-2xl">👤</span>
                <div>
                  <p className="font-medium">Clientes</p>
                  <p className="text-sm text-gray-600">Gestionar clientes</p>
                </div>
              </Link>
              
              <Link href="/admin/vehiculos" className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-2xl">🚗</span>
                <div>
                  <p className="font-medium">Vehículos</p>
                  <p className="text-sm text-gray-600">Ver vehículos</p>
                </div>
              </Link>
              
              <Link href="/admin/facturas" className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-2xl">🧾</span>
                <div>
                  <p className="font-medium">Facturas</p>
                  <p className="text-sm text-gray-600">Consultar facturas</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Vista Principal del Dashboard (con datos del caché)
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard - Sistema de Taller</h1>

        {/* KPIs Grid - Con datos de Tanstack Query */}
        {kpis && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {/* Ventas del Mes */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-green-100 text-sm">Ingresos del Mes</p>
                  <p className="text-3xl font-bold">{formatCurrency(kpis.ingresos_mes || 0)}</p>
                </div>
                <div className="text-4xl">💰</div>
              </div>
              <Link href="/admin/facturas" className="text-green-100 hover:text-white text-sm mt-2 inline-block">
                Ver facturas →
              </Link>
            </div>

            {/* Órdenes Completadas */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-blue-100 text-sm">Órdenes Completadas</p>
                  <p className="text-3xl font-bold">{kpis.ordenes_completadas || 0}</p>
                </div>
                <div className="text-4xl">✅</div>
              </div>
              <Link href="/admin/ordenes" className="text-blue-100 hover:text-white text-sm mt-2 inline-block">
                Ver órdenes →
              </Link>
            </div>

            {/* Órdenes Pendientes */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-orange-100 text-sm">Órdenes Pendientes</p>
                  <p className="text-3xl font-bold">{kpis.ordenes_pendientes || 0}</p>
                </div>
                <div className="text-4xl">⏳</div>
              </div>
              <Link href="/admin/ordenes?status=pendiente" className="text-orange-100 hover:text-white text-sm mt-2 inline-block">
                Ver pendientes →
              </Link>
            </div>

            {/* Total Clientes */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-gray-600 text-sm">Clientes Activos</p>
                  <p className="text-3xl font-bold text-gray-800">{kpis.clientes_activos || 0}</p>
                </div>
                <div className="text-4xl">👥</div>
              </div>
              <p className="text-xs text-gray-500">
                Total: {kpis.clientes_total || 0}
              </p>
              <Link href="/admin/clientes" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                Ver clientes →
              </Link>
            </div>

            {/* Stock Bajo */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-red-100 text-sm">Alertas de Stock</p>
                  <p className="text-3xl font-bold">{kpis.stock_bajo || 0}</p>
                </div>
                <div className="text-4xl">⚠️</div>
              </div>
              <p className="text-red-100 text-xs mt-2">Repuestos bajo mínimo</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Stock Bajo Alert - Con datos de Tanstack Query */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">⚠️ Alertas de Stock Bajo</h2>
                <span className="text-sm text-gray-500">{stockBajo.length} repuestos</span>
              </div>
            </div>
            <div className="p-6">
              {stockLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : stockBajo.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {stockBajo.map((rep: RepuestoStockBajo) => {
                    const deficit = rep.stock_minimo - rep.stock_actual;
                    const urgencia = rep.urgencia || (deficit > 5 ? 'CRÍTICO' : deficit > 2 ? 'URGENTE' : 'BAJO');
                    const urgenciaColor = 
                      urgencia === 'CRÍTICO' ? 'bg-red-100 border-red-300' :
                      urgencia === 'URGENTE' ? 'bg-orange-100 border-orange-300' :
                      'bg-yellow-100 border-yellow-300';
                    
                    return (
                      <div key={rep.id_repuesto} className={`flex justify-between items-center p-3 rounded border-l-4 ${urgenciaColor}`}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/repuestos/${rep.id_repuesto}`}
                              className="font-medium text-blue-600 hover:underline"
                            >
                              {rep.nombre}
                            </Link>
                            <span className={`text-xs px-2 py-1 rounded font-semibold ${
                              urgencia === 'CRÍTICO' ? 'bg-red-200 text-red-800' :
                              urgencia === 'URGENTE' ? 'bg-orange-200 text-orange-800' :
                              'bg-yellow-200 text-yellow-800'
                            }`}>
                              {urgencia}
                            </span>
                          </div>
                          {rep.codigo && <p className="text-sm text-gray-600">Código: {rep.codigo}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-red-600">
                            Stock: {rep.stock_actual}
                          </p>
                          <p className="text-xs text-gray-500">
                            Mínimo: {rep.stock_minimo} (faltan {deficit})
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">✅</div>
                  <p className="text-gray-600">Todo el stock está en niveles normales</p>
                </div>
              )}
            </div>
          </div>

          {/* Ventas de la Semana - Con datos de Tanstack Query */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">📊 Ventas de la Semana</h2>
              <p className="text-sm text-gray-500 mt-1">Últimos 7 días</p>
            </div>
            <div className="p-6">
              {ventasLoading ? (
                <div className="space-y-3">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="h-14 bg-gray-100 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : ventasSemana.length > 0 ? (
                <div className="space-y-3">
                  {ventasSemana.map((venta: VentaSemana, idx: number) => {
                    // El backend envía "dia" en lugar de "fecha"
                    const diaNombre = venta.dia;
                    
                    return (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                        <div>
                          <p className="font-medium text-gray-800 capitalize">{diaNombre}</p>
                          <p className="text-xs text-gray-500">
                            {venta.ordenes} {venta.ordenes === 1 ? 'orden' : 'órdenes'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            {formatCurrency(venta.total)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-3 border-t mt-3">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-gray-700">Total Semana</p>
                      <p className="font-bold text-green-600 text-lg">
                        {formatCurrency(ventasSemana.reduce((sum, v) => sum + v.total, 0))}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-5xl mb-3">📈</div>
                  <p className="text-gray-600">No hay ventas registradas esta semana</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/compras/new"
            className="bg-green-600 text-white p-6 rounded-lg hover:bg-green-700 transition-colors text-center"
          >
            <div className="text-4xl mb-2">➕</div>
            <h3 className="font-semibold">Nueva Compra</h3>
            <p className="text-sm text-green-100 mt-1">Registrar entrada de inventario</p>
          </Link>

          <Link
            href="/admin/ordenes/new"
            className="bg-blue-600 text-white p-6 rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            <div className="text-4xl mb-2">🔧</div>
            <h3 className="font-semibold">Nueva Orden</h3>
            <p className="text-sm text-blue-100 mt-1">Crear orden de trabajo</p>
          </Link>

          <Link
            href="/admin/reportes"
            className="bg-purple-600 text-white p-6 rounded-lg hover:bg-purple-700 transition-colors text-center"
          >
            <div className="text-4xl mb-2">📊</div>
            <h3 className="font-semibold">Reportes</h3>
            <p className="text-sm text-purple-100 mt-1">Ver análisis y estadísticas</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
