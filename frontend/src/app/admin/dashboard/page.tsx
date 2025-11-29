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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-10">
            <h1 className="text-5xl font-bold text-gray-900 mb-2">Panel de Recepción</h1>
            <p className="text-lg text-gray-600">Bienvenido al sistema de gestión</p>
          </div>
          
          {/* Acciones Rápidas para Recepción */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <Link
              href="/admin/ordenes/new"
              className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-10 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-center group"
            >
              <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">📋</div>
              <h3 className="text-2xl font-bold mb-2">Nueva Orden</h3>
              <p className="text-base text-blue-100">Crear orden de trabajo</p>
            </Link>

            <Link
              href="/admin/clients/new"
              className="bg-gradient-to-br from-green-600 to-green-700 text-white p-10 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-center group"
            >
              <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">👤</div>
              <h3 className="text-2xl font-bold mb-2">Nuevo Cliente</h3>
              <p className="text-base text-green-100">Registrar cliente</p>
            </Link>

            <Link
              href="/admin/vehiculos/new"
              className="bg-gradient-to-br from-purple-600 to-purple-700 text-white p-10 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-center group"
            >
              <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">🚗</div>
              <h3 className="text-2xl font-bold mb-2">Nuevo Vehículo</h3>
              <p className="text-base text-purple-100">Registrar vehículo</p>
            </Link>
          </div>

          {/* Accesos Directos */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Accesos Rápidos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/admin/ordenes" className="flex items-center gap-5 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 hover:shadow-md transition-all group">
                <span className="text-5xl group-hover:scale-110 transition-transform">📋</span>
                <div>
                  <p className="text-xl font-semibold text-gray-900 mb-1">Órdenes de Trabajo</p>
                  <p className="text-base text-gray-600">Ver todas las órdenes</p>
                </div>
              </Link>
              
              <Link href="/admin/clients" className="flex items-center gap-5 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 hover:shadow-md transition-all group">
                <span className="text-5xl group-hover:scale-110 transition-transform">👤</span>
                <div>
                  <p className="text-xl font-semibold text-gray-900 mb-1">Clientes</p>
                  <p className="text-base text-gray-600">Gestionar clientes</p>
                </div>
              </Link>
              
              <Link href="/admin/vehiculos" className="flex items-center gap-5 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 hover:shadow-md transition-all group">
                <span className="text-5xl group-hover:scale-110 transition-transform">🚗</span>
                <div>
                  <p className="text-xl font-semibold text-gray-900 mb-1">Vehículos</p>
                  <p className="text-base text-gray-600">Ver vehículos</p>
                </div>
              </Link>
              
              <Link href="/admin/facturas" className="flex items-center gap-5 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 hover:shadow-md transition-all group">
                <span className="text-5xl group-hover:scale-110 transition-transform">🧾</span>
                <div>
                  <p className="text-xl font-semibold text-gray-900 mb-1">Facturas</p>
                  <p className="text-base text-gray-600">Consultar facturas</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-lg text-gray-600">Sistema de Gestión de Taller</p>
        </div>

        {/* KPIs Grid - Con datos de Tanstack Query */}
        {kpis && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Ventas del Mes */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-8 text-white hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-green-100 text-base mb-2">Ingresos del Mes</p>
                  <p className="text-5xl font-bold mb-1">{formatCurrency(kpis.ingresos_mes || 0)}</p>
                  <p className="text-green-100 text-sm">Facturación mensual</p>
                </div>
                <div className="text-6xl opacity-80">💰</div>
              </div>
              <Link href="/admin/facturas" className="text-green-100 hover:text-white text-base font-medium inline-block border-b-2 border-green-300 hover:border-white transition-colors">
                Ver facturas →
              </Link>
            </div>

            {/* Órdenes Completadas */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-8 text-white hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-blue-100 text-base mb-2">Órdenes Completadas</p>
                  <p className="text-5xl font-bold mb-1">{kpis.ordenes_completadas || 0}</p>
                  <p className="text-blue-100 text-sm">Trabajos finalizados</p>
                </div>
                <div className="text-6xl opacity-80">✅</div>
              </div>
              <Link href="/admin/ordenes" className="text-blue-100 hover:text-white text-base font-medium inline-block border-b-2 border-blue-300 hover:border-white transition-colors">
                Ver órdenes →
              </Link>
            </div>

            {/* Órdenes Pendientes */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl p-8 text-white hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-orange-100 text-base mb-2">Órdenes Pendientes</p>
                  <p className="text-5xl font-bold mb-1">{kpis.ordenes_pendientes || 0}</p>
                  <p className="text-orange-100 text-sm">En espera de atención</p>
                </div>
                <div className="text-6xl opacity-80">⏳</div>
              </div>
              <Link href="/admin/ordenes?status=pendiente" className="text-orange-100 hover:text-white text-base font-medium inline-block border-b-2 border-orange-300 hover:border-white transition-colors">
                Ver pendientes →
              </Link>
            </div>

            {/* Stock Bajo */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-xl p-8 text-white hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-red-100 text-base mb-2">Alertas de Stock</p>
                  <p className="text-5xl font-bold mb-1">{kpis.stock_bajo || 0}</p>
                  <p className="text-red-100 text-sm">Repuestos bajo mínimo</p>
                </div>
                <div className="text-6xl opacity-80">⚠️</div>
              </div>
              <Link href="/admin/inventario" className="text-red-100 hover:text-white text-base font-medium inline-block border-b-2 border-red-300 hover:border-white transition-colors">
                Ver inventario →
              </Link>
            </div>
          </div>
        )}

        {/* Stats Adicionales */}
        {kpis && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-6">
                <div className="text-6xl">👥</div>
                <div>
                  <p className="text-gray-600 text-base mb-1">Clientes Activos</p>
                  <p className="text-4xl font-bold text-gray-900">{kpis.clientes_activos || 0}</p>
                  <p className="text-sm text-gray-500 mt-1">Total: {kpis.clientes_total || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-6">
                <div className="text-6xl">🔧</div>
                <div>
                  <p className="text-gray-600 text-base mb-1">Órdenes en Proceso</p>
                  <p className="text-4xl font-bold text-gray-900">{kpis.ordenes_en_proceso || 0}</p>
                  <p className="text-sm text-gray-500 mt-1">Trabajos activos</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-6">
                <div className="text-6xl">📦</div>
                <div>
                  <p className="text-gray-600 text-base mb-1">Repuestos Totales</p>
                  <p className="text-4xl font-bold text-gray-900">{kpis.repuestos_total || 0}</p>
                  <p className="text-sm text-gray-500 mt-1">En inventario</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Stock Bajo Alert - Con datos de Tanstack Query */}
          <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow">
            <div className="p-8 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-1">⚠️ Alertas de Stock</h2>
                  <p className="text-gray-600">Repuestos que requieren atención</p>
                </div>
                <span className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-lg font-semibold">{stockBajo.length}</span>
              </div>
            </div>
            <div className="p-8">
              {stockLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse"></div>
                  ))}
                </div>
              ) : stockBajo.length > 0 ? (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {stockBajo.map((rep: RepuestoStockBajo) => {
                    const deficit = rep.stock_minimo - rep.stock_actual;
                    const urgencia = rep.urgencia || (deficit > 5 ? 'CRÍTICO' : deficit > 2 ? 'URGENTE' : 'BAJO');
                    const urgenciaColor = 
                      urgencia === 'CRÍTICO' ? 'bg-red-50 border-red-400' :
                      urgencia === 'URGENTE' ? 'bg-orange-50 border-orange-400' :
                      'bg-yellow-50 border-yellow-400';
                    
                    return (
                      <div key={rep.id_repuesto} className={`flex justify-between items-center p-5 rounded-xl border-l-4 ${urgenciaColor} hover:shadow-md transition-shadow`}>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Link
                              href={`/admin/repuestos/${rep.id_repuesto}`}
                              className="text-lg font-semibold text-blue-600 hover:underline"
                            >
                              {rep.nombre}
                            </Link>
                            <span className={`text-sm px-3 py-1 rounded-full font-bold ${
                              urgencia === 'CRÍTICO' ? 'bg-red-200 text-red-900' :
                              urgencia === 'URGENTE' ? 'bg-orange-200 text-orange-900' :
                              'bg-yellow-200 text-yellow-900'
                            }`}>
                              {urgencia}
                            </span>
                          </div>
                          {rep.codigo && <p className="text-base text-gray-600">Código: {rep.codigo}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-600 mb-1">
                            Stock: {rep.stock_actual}
                          </p>
                          <p className="text-sm text-gray-600">
                            Mínimo: {rep.stock_minimo}
                          </p>
                          <p className="text-xs text-red-500 font-medium">
                            Faltan {deficit} unidades
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-7xl mb-4">✅</div>
                  <p className="text-xl text-gray-600">Todo el stock está en niveles normales</p>
                </div>
              )}
            </div>
          </div>

          {/* Ventas de la Semana - Con datos de Tanstack Query */}
          <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow">
            <div className="p-8 border-b border-gray-200">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-1">📊 Ventas de la Semana</h2>
                <p className="text-gray-600">Últimos 7 días de actividad</p>
              </div>
            </div>
            <div className="p-8">
              {ventasLoading ? (
                <div className="space-y-4">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse"></div>
                  ))}
                </div>
              ) : ventasSemana.length > 0 ? (
                <div className="space-y-4">
                  {ventasSemana.map((venta: VentaSemana, idx: number) => {
                    // El backend envía "dia" en lugar de "fecha"
                    const diaNombre = venta.dia;
                    
                    return (
                      <div key={idx} className="flex justify-between items-center p-5 bg-gray-50 rounded-xl hover:bg-gray-100 hover:shadow-md transition-all">
                        <div>
                          <p className="text-xl font-semibold text-gray-800 capitalize mb-1">{diaNombre}</p>
                          <p className="text-sm text-gray-600">
                            {venta.ordenes} {venta.ordenes === 1 ? 'orden completada' : 'órdenes completadas'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(venta.total)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div className="pt-6 border-t-2 border-gray-200 mt-6">
                    <div className="flex justify-between items-center bg-green-50 p-5 rounded-xl">
                      <p className="text-xl font-bold text-gray-800">Total Semana</p>
                      <p className="text-3xl font-bold text-green-600">
                        {formatCurrency(ventasSemana.reduce((sum, v) => sum + v.total, 0))}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-7xl mb-4">📈</div>
                  <p className="text-xl text-gray-600">No hay ventas registradas esta semana</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link
            href="/admin/compras/new"
            className="bg-gradient-to-br from-green-600 to-green-700 text-white p-10 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-center group"
          >
            <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">➕</div>
            <h3 className="text-2xl font-bold mb-2">Nueva Compra</h3>
            <p className="text-base text-green-100">Registrar entrada de inventario</p>
          </Link>

          <Link
            href="/admin/ordenes/new"
            className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-10 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-center group"
          >
            <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">🔧</div>
            <h3 className="text-2xl font-bold mb-2">Nueva Orden</h3>
            <p className="text-base text-blue-100">Crear orden de trabajo</p>
          </Link>

          <Link
            href="/admin/reportes"
            className="bg-gradient-to-br from-purple-600 to-purple-700 text-white p-10 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-center group"
          >
            <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">📊</div>
            <h3 className="text-2xl font-bold mb-2">Reportes</h3>
            <p className="text-base text-purple-100">Ver análisis y estadísticas</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
