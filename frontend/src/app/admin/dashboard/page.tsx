'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardKPIs, fetchStockBajo, fetchVentasSemana } from '@/services/dashboard.service';
import { useEffect } from 'react';
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
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const {
    data: kpis,
    isLoading: kpisLoading,
    isError: kpisError,
    error: kpisErrorDetail,
  } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: () => fetchDashboardKPIs(token!),
    enabled: !!token && !authLoading && !!user && !isRecepcion, 
    retry: 1,
  });
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
  useEffect(() => {
    if (kpisErrorDetail?.message === 'UNAUTHORIZED') {
      logout();
      router.push('/login');
    }
  }, [kpisErrorDetail, logout, router]);

  useEffect(() => {
    if (isRecepcion && !authLoading) {
      router.push('/recepcion');
    }
  }, [isRecepcion, authLoading, router]);

  const loading = authLoading || (kpisLoading && stockLoading && ventasLoading);
  const hasError = kpisError || stockError || ventasError;
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
  if (hasError && !isRecepcion) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-100 border border-red-300 text-red-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2"> Error al cargar el dashboard</h2>
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
  if (isRecepcion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-10">
            <h1 className="text-5xl font-bold text-gray-900 mb-2">Panel de Recepción</h1>
            <p className="text-lg text-gray-600">Bienvenido al sistema de gestión</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <Link
              href="/admin/ordenes/new"
              className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-10 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-center group"
            >
              <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">“‹</div>
              <h3 className="text-2xl font-bold mb-2">Nueva Orden</h3>
              <p className="text-base text-blue-100">Crear orden de trabajo</p>
            </Link>
            <Link
              href="/admin/clients/new"
              className="bg-gradient-to-br from-green-600 to-green-700 text-white p-10 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-center group"
            >
              <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">‘¤</div>
              <h3 className="text-2xl font-bold mb-2">Nuevo Cliente</h3>
              <p className="text-base text-green-100">Registrar cliente</p>
            </Link>
            <Link
              href="/admin/vehiculos/new"
              className="bg-gradient-to-br from-purple-600 to-purple-700 text-white p-10 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 text-center group"
            >
              <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">—</div>
              <h3 className="text-2xl font-bold mb-2">Nuevo Vehículo</h3>
              <p className="text-base text-purple-100">Registrar vehículo</p>
            </Link>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Accesos Rápidos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/admin/ordenes" className="flex items-center gap-5 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 hover:shadow-md transition-all group">
                <span className="text-5xl group-hover:scale-110 transition-transform">“‹</span>
                <div>
                  <p className="text-xl font-semibold text-gray-900 mb-1">Órdenes de Trabajo</p>
                  <p className="text-base text-gray-600">Ver todas las órdenes</p>
                </div>
              </Link>
              <Link href="/admin/clients" className="flex items-center gap-5 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 hover:shadow-md transition-all group">
                <span className="text-5xl group-hover:scale-110 transition-transform">‘¤</span>
                <div>
                  <p className="text-xl font-semibold text-gray-900 mb-1">Clientes</p>
                  <p className="text-base text-gray-600">Gestionar clientes</p>
                </div>
              </Link>
              <Link href="/admin/vehiculos" className="flex items-center gap-5 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 hover:shadow-md transition-all group">
                <span className="text-5xl group-hover:scale-110 transition-transform">—</span>
                <div>
                  <p className="text-xl font-semibold text-gray-900 mb-1">Vehículos</p>
                  <p className="text-base text-gray-600">Ver vehículos</p>
                </div>
              </Link>
              <Link href="/admin/facturas" className="flex items-center gap-5 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 hover:shadow-md transition-all group">
                <span className="text-5xl group-hover:scale-110 transition-transform"></span>
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
  return (
    <div className="min-h-screen bg-[#0f0f0f] relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1920&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0f0f0f] to-black opacity-90" />
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 50px, #ff6600 50px, #ff6600 51px), repeating-linear-gradient(90deg, transparent, transparent 50px, #ff6600 50px, #ff6600 51px)"
      }} />
      <div className="relative z-10 max-w-[1800px] mx-auto px-8 py-8">
        <div className="mb-8 relative">
          <div className="absolute -left-10 -top-10 w-96 h-96 bg-orange-500 opacity-10 blur-3xl rounded-full" />
          <div className="relative bg-gradient-to-r from-[#1a1a1a] via-[#0a0a0a] to-black border-l-4 border-orange-500 p-6">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <div className="w-1 h-8 bg-orange-500"></div>
                <h1 className="text-3xl font-black text-white uppercase tracking-tight font-mono">
                  CONTROL PANEL
                </h1>
              </div>
              <span className="text-xs text-gray-600 font-mono">
                {new Date().toLocaleDateString('es-ES', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-gray-600 font-mono tracking-wider uppercase pl-3 mt-2">
              USUARIO: {user?.nombre?.toUpperCase() || 'OPERADOR'} / ROL: {user?.rol?.toUpperCase() || 'USER'}
            </p>
          </div>
        </div>
        {kpis && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Link href="/admin/facturas" className="group relative overflow-hidden bg-[#0a0a0a] border border-[#1a1a1a] hover:border-orange-500/50 transition-all p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-[10px] text-gray-600 font-mono tracking-widest uppercase">FACTURACIÓN.MES</span>
                <div className="w-2 h-2 bg-orange-500 group-hover:animate-pulse"></div>
              </div>
              <div className="mb-3">
                <p className="text-4xl font-black text-white font-mono tabular-nums">{formatCurrency(kpis.ingresos_mes || 0)}</p>
              </div>
              <div className="h-[1px] bg-gradient-to-r from-orange-500 to-transparent"></div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-orange-500 font-mono">VER DETALLE</span>
                <span className="text-xs text-gray-700 font-mono">USD</span>
              </div>
              </div>
            </Link>
            <Link href="/admin/ordenes" className="group relative overflow-hidden bg-[#0a0a0a] border border-[#1a1a1a] hover:border-green-500/50 transition-all p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-[10px] text-gray-600 font-mono tracking-widest uppercase">ORD.COMPLETADAS</span>
                <div className="w-2 h-2 bg-green-500"></div>
              </div>
              <div className="mb-3">
                <p className="text-4xl font-black text-white font-mono tabular-nums">{kpis.ordenes_completadas || 0}</p>
              </div>
              <div className="h-[1px] bg-gradient-to-r from-green-500 to-transparent"></div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-green-500 font-mono">VER DETALLE</span>
                <span className="text-xs text-gray-700 font-mono">TOTAL</span>
              </div>
              </div>
            </Link>
            <Link href="/admin/ordenes?status=pendiente" className="group relative overflow-hidden bg-[#0a0a0a] border border-[#1a1a1a] hover:border-yellow-500/50 transition-all p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-[10px] text-gray-600 font-mono tracking-widest uppercase">ORD.PENDIENTES</span>
                <div className="w-2 h-2 bg-yellow-500 animate-pulse"></div>
              </div>
              <div className="mb-3">
                <p className="text-4xl font-black text-white font-mono tabular-nums">{kpis.ordenes_pendientes || 0}</p>
              </div>
              <div className="h-[1px] bg-gradient-to-r from-yellow-500 to-transparent"></div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-yellow-500 font-mono">VER DETALLE</span>
                <span className="text-xs text-gray-700 font-mono">WAIT</span>
              </div>
              </div>
            </Link>
            <Link href="/admin/inventory" className="group relative overflow-hidden bg-[#0a0a0a] border border-[#1a1a1a] hover:border-red-500/50 transition-all p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-[10px] text-gray-600 font-mono tracking-widest uppercase">STOCK.CRÍTICO</span>
                <div className="w-2 h-2 bg-red-500 animate-pulse"></div>
              </div>
              <div className="mb-3">
                <p className="text-4xl font-black text-white font-mono tabular-nums">{kpis.stock_bajo || 0}</p>
              </div>
              <div className="h-[1px] bg-gradient-to-r from-red-500 to-transparent"></div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-red-500 font-mono">VER DETALLE</span>
                <span className="text-xs text-gray-700 font-mono">ALERT</span>
              </div>
              </div>
            </Link>
          </div>
        )}
        {kpis && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-[#0a0a0a] border-l-2 border-cyan-500 p-4">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-[10px] text-gray-600 font-mono tracking-widest uppercase">CLIENTES.ACTIVOS</span>
                <span className="text-xl font-black text-white font-mono tabular-nums">{kpis.clientes_activos || 0}</span>
              </div>
              <div className="text-[10px] text-gray-700 font-mono">
                DE {kpis.clientes_total || 0} TOTAL
              </div>
            </div>
            <div className="bg-[#0a0a0a] border-l-2 border-blue-500 p-4">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-[10px] text-gray-600 font-mono tracking-widest uppercase">ORD.EN_PROCESO</span>
                <span className="text-xl font-black text-white font-mono tabular-nums">{kpis.ordenes_en_proceso || 0}</span>
              </div>
              <div className="text-[10px] text-gray-700 font-mono">
                TRABAJOS ACTIVOS
              </div>
            </div>
            <div className="bg-[#0a0a0a] border-l-2 border-purple-500 p-4">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-[10px] text-gray-600 font-mono tracking-widest uppercase">INVENTARIO.ITEMS</span>
                <span className="text-xl font-black text-white font-mono tabular-nums">{kpis.repuestos_total || 0}</span>
              </div>
              <div className="text-[10px] text-gray-700 font-mono">
                REPUESTOS DISP
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a]">
            <div className="border-b border-[#1a1a1a] p-4">
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-2">
                  <div className="w-1 h-5 bg-blue-500"></div>
                  <h2 className="text-sm font-black text-white uppercase tracking-tight font-mono">
                    ÓRDENES.EN_PROCESO
                  </h2>
                </div>
                <span className="text-2xl font-black text-white font-mono tabular-nums">
                  {kpis?.ordenes_en_proceso || 0}
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[1, 2, 3, 4].map((bay) => (
                  <div key={bay} className={`border p-3 ${bay <= (kpis?.ordenes_en_proceso || 0) ? 'border-blue-500 bg-blue-500/5' : 'border-[#1a1a1a]'}`}>
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-[10px] text-gray-600 font-mono tracking-widest">BAY.{bay}</span>
                      <div className={`w-2 h-2 ${bay <= (kpis?.ordenes_en_proceso || 0) ? 'bg-blue-500' : 'bg-gray-800'}`}></div>
                    </div>
                    <div className="text-xs font-mono text-gray-500">
                      {bay <= (kpis?.ordenes_en_proceso || 0) ? 'ACTIVO' : 'LIBRE'}
                    </div>
                  </div>
                ))}
              </div>
              <Link 
                href="/admin/ordenes" 
                className="block w-full bg-[#1a1a1a] hover:bg-[#2a2a2a] text-center py-3 border border-blue-500/50 transition-colors"
              >
                <span className="text-xs font-bold font-mono text-blue-500 tracking-wider uppercase">VER ÓRDENES</span>
              </Link>
            </div>
          </div>
          <div className="bg-[#0a0a0a] border border-[#1a1a1a]">
            <div className="border-b border-[#1a1a1a] p-4">
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-2">
                  <div className="w-1 h-5 bg-red-500"></div>
                  <h2 className="text-sm font-black text-white uppercase tracking-tight font-mono">
                    STOCK.CRÍTICO
                  </h2>
                </div>
                <span className="text-2xl font-black text-white font-mono tabular-nums">
                  {stockBajo.length}
                </span>
              </div>
            </div>
            <div className="p-4">
              {stockLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-[#1a1a1a] animate-pulse"></div>
                  ))}
                </div>
              ) : stockBajo.length > 0 ? (
                <div className="space-y-2 max-h-[280px] overflow-y-auto">
                  {stockBajo.slice(0, 5).map((rep: RepuestoStockBajo) => {
                    const deficit = rep.stock_minimo - rep.stock_actual;
                    const urgencia = deficit > 5 ? 'CRÍTICO' : deficit > 2 ? 'URGENTE' : 'BAJO';
                    const colorBorder = urgencia === 'CRÍTICO' ? 'border-red-500' : urgencia === 'URGENTE' ? 'border-yellow-500' : 'border-orange-500';
                    return (
                      <Link 
                        key={rep.id_repuesto} 
                        href={`/admin/inventory/${rep.id_repuesto}`}
                        className={`block border-l-2 ${colorBorder} bg-[#1a1a1a] hover:bg-[#2a2a2a] p-3 transition-colors`}
                      >
                        <div className="flex items-baseline justify-between mb-1">
                          <span className="text-xs font-bold text-white font-mono uppercase truncate flex-1">
                            {rep.nombre}
                          </span>
                          <span className="text-[10px] text-gray-600 font-mono ml-2">{urgencia}</span>
                        </div>
                        <div className="flex items-baseline gap-4 text-[10px] font-mono text-gray-600">
                          <span>ACTUAL: {rep.stock_actual}</span>
                          <span>MIN: {rep.stock_minimo}</span>
                          <span className="ml-auto text-white">{formatCurrency(rep.precio_venta)}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="text-4xl">“</span>
                  <p className="text-xs text-gray-600 mt-2 font-mono">STOCK OK</p>
                </div>
              )}
              <Link 
                href="/admin/inventory" 
                className="block w-full bg-[#1a1a1a] hover:bg-[#2a2a2a] text-center py-3 border border-red-500/50 transition-colors mt-4"
              >
                <span className="text-xs font-bold font-mono text-red-500 tracking-wider uppercase">VER INVENTARIO</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] mb-8">
          <div className="border-b border-[#1a1a1a] p-4">
            <div className="flex items-baseline gap-2">
              <div className="w-1 h-5 bg-lime-500"></div>
              <h2 className="text-sm font-black text-white uppercase tracking-tight font-mono">
                VENTAS.ÚLTIMOS_7D
              </h2>
            </div>
          </div>
          <div className="p-4">
            {ventasLoading ? (
              <div className="space-y-2">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="h-12 bg-[#1a1a1a] animate-pulse"></div>
                ))}
              </div>
            ) : ventasSemana.length > 0 ? (
              <>
                <div className="space-y-1">
                  {ventasSemana.map((venta: VentaSemana, idx: number) => (
                    <div key={idx} className="grid grid-cols-3 gap-4 p-3 bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-colors">
                      <span className="text-xs font-mono text-gray-500 uppercase">{venta.dia}</span>
                      <span className="text-xs font-mono text-gray-400">{venta.ordenes} ORD</span>
                      <span className="text-xs font-black font-mono text-white text-right tabular-nums">
                        {formatCurrency(venta.total)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-[#1a1a1a] bg-[#1a1a1a] p-3">
                  <div className="grid grid-cols-3 gap-4">
                    <span className="text-xs font-mono text-lime-500 uppercase">TOTAL</span>
                    <span className="text-xs font-mono text-gray-400">
                      {ventasSemana.reduce((sum, v) => sum + v.ordenes, 0)} ORD
                    </span>
                    <span className="text-sm font-black font-mono text-white text-right tabular-nums">
                      {formatCurrency(ventasSemana.reduce((sum, v) => sum + v.total, 0))}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <span className="text-xs text-gray-600 font-mono">NO DATA</span>
              </div>
            )}
          </div>
        </div>
        <div className="relative mb-8">
          <div className="absolute inset-0 opacity-5">
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1920&q=80')",
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          </div>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/compras/new"
            className="bg-[#0a0a0a] border border-lime-500/50 hover:border-lime-500 hover:bg-[#1a1a1a] transition-all p-6"
          >
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-[10px] text-lime-500 font-mono tracking-widest uppercase">ACCIÓN.01</span>
              <div className="w-2 h-2 bg-lime-500"></div>
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight font-mono mb-2">
              NUEVA COMPRA
            </h3>
            <p className="text-xs text-gray-600 font-mono">REABASTECIMIENTO</p>
          </Link>
          <Link
            href="/admin/ordenes/new"
            className="bg-[#0a0a0a] border border-orange-500/50 hover:border-orange-500 hover:bg-[#1a1a1a] transition-all p-6"
          >
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-[10px] text-orange-500 font-mono tracking-widest uppercase">ACCIÓN.02</span>
              <div className="w-2 h-2 bg-orange-500"></div>
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight font-mono mb-2">
              NUEVA ORDEN
            </h3>
            <p className="text-xs text-gray-600 font-mono">CREAR TRABAJO</p>
          </Link>
          <Link
            href="/admin/reportes"
            className="bg-[#0a0a0a] border border-cyan-500/50 hover:border-cyan-500 hover:bg-[#1a1a1a] transition-all p-6"
          >
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-[10px] text-cyan-500 font-mono tracking-widest uppercase">ACCIÓN.03</span>
              <div className="w-2 h-2 bg-cyan-500"></div>
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight font-mono mb-2">
              REPORTES
            </h3>
            <p className="text-xs text-gray-600 font-mono">ANÁLISIS DATOS</p>
          </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
