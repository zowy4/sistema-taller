'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

interface DashboardKPIs {
  ventasMes: number;
  ordenesMes: number;
  totalClientes: number;
  totalRepuestos: number;
  valorInventario: number;
}

interface RepuestoStockBajo {
  id_repuesto: number;
  nombre: string;
  codigo: string;
  stock_actual: number;
  stock_minimo: number;
  precio_venta: number;
  precio_compra: number;
  urgencia: string;
}

interface VentaSemana {
  fecha: string;
  total: number;
  cantidad: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [stockBajo, setStockBajo] = useState<RepuestoStockBajo[]>([]);
  const [ventasSemana, setVentasSemana] = useState<VentaSemana[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isRecepcion = user?.rol === 'recepcion';

  useEffect(() => {
    // Esperar a que el usuario esté cargado
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    if (isRecepcion) {
      setLoading(false);
    } else {
      fetchDashboardData();
    }
  }, [authLoading, user, router]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const headers = { 'Authorization': `Bearer ${token}` };

      const [kpisRes, stockBajoRes, ventasRes] = await Promise.all([
        fetch(`${API_URL}/dashboard/kpis`, { headers }),
        fetch(`${API_URL}/dashboard/stock-bajo`, { headers }),
        fetch(`${API_URL}/dashboard/ventas-semana`, { headers })
      ]);

      if (kpisRes.status === 401 || stockBajoRes.status === 401 || ventasRes.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      if (!kpisRes.ok || !stockBajoRes.ok || !ventasRes.ok) {
        const errorDetails = [];
        if (!kpisRes.ok) errorDetails.push(`KPIs: ${kpisRes.status}`);
        if (!stockBajoRes.ok) errorDetails.push(`Stock: ${stockBajoRes.status}`);
        if (!ventasRes.ok) errorDetails.push(`Ventas: ${ventasRes.status}`);
        
        console.error('Error en dashboard:', errorDetails.join(', '));
        throw new Error(`Error al cargar datos del dashboard (${errorDetails.join(', ')})`);
      }

      const [kpisData, stockBajoData, ventasData] = await Promise.all([
        kpisRes.json(),
        stockBajoRes.json(),
        ventasRes.json()
      ]);

      setKpis(kpisData);
      setStockBajo(stockBajoData);
      setVentasSemana(ventasData);
      setError(null);
    } catch (err: any) {
      console.error('Error completo:', err);
      setError(err.message || 'Error al cargar dashboard');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="text-gray-600">Cargando dashboard...</div>
    </div>
  );

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

  if (error || !kpis) return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="bg-red-100 text-red-800 p-4 rounded">
        {error || 'Error al cargar dashboard'}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard - Sistema de Taller</h1>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Ventas del Mes */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-green-100 text-sm">Ventas del Mes</p>
                <p className="text-3xl font-bold">{formatCurrency(kpis.ventasMes)}</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
            <Link href="/admin/ventas" className="text-green-100 hover:text-white text-sm mt-2 inline-block">
              Ver ventas →
            </Link>
          </div>

          {/* Órdenes del Mes */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-blue-100 text-sm">Órdenes del Mes</p>
                <p className="text-3xl font-bold">{kpis.ordenesMes}</p>
              </div>
              <div className="text-4xl">🔧</div>
            </div>
            <Link href="/admin/ordenes" className="text-blue-100 hover:text-white text-sm mt-2 inline-block">
              Ver órdenes →
            </Link>
          </div>

          {/* Total Clientes */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-gray-600 text-sm">Total Clientes</p>
                <p className="text-3xl font-bold text-gray-800">{kpis.totalClientes}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
            <Link href="/admin/clientes" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
              Ver clientes →
            </Link>
          </div>

          {/* Total Repuestos */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-gray-600 text-sm">Total Repuestos</p>
                <p className="text-3xl font-bold text-gray-800">{kpis.totalRepuestos}</p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
            <Link href="/admin/repuestos" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
              Ver inventario →
            </Link>
          </div>

          {/* Valor Inventario */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-purple-100 text-sm">Valor Inventario</p>
                <p className="text-3xl font-bold">{formatCurrency(kpis.valorInventario)}</p>
              </div>
              <div className="text-4xl">💎</div>
            </div>
            <p className="text-purple-100 text-xs mt-2">Capital en stock</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Stock Bajo Alert */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">⚠️ Alertas de Stock Bajo</h2>
                <span className="text-sm text-gray-500">{stockBajo.length} repuestos</span>
              </div>
            </div>
            <div className="p-6">
              {stockBajo.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {stockBajo.map(rep => {
                    const deficit = rep.stock_minimo - rep.stock_actual;
                    const urgenciaColor = 
                      rep.urgencia === 'CRÍTICO' ? 'bg-red-100 border-red-300' :
                      rep.urgencia === 'URGENTE' ? 'bg-orange-100 border-orange-300' :
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
                              rep.urgencia === 'CRÍTICO' ? 'bg-red-200 text-red-800' :
                              rep.urgencia === 'URGENTE' ? 'bg-orange-200 text-orange-800' :
                              'bg-yellow-200 text-yellow-800'
                            }`}>
                              {rep.urgencia}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">Código: {rep.codigo}</p>
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

          {/* Ventas de la Semana */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">📊 Ventas de la Semana</h2>
              <p className="text-sm text-gray-500 mt-1">Últimos 7 días</p>
            </div>
            <div className="p-6">
              {ventasSemana.length > 0 ? (
                <div className="space-y-3">
                  {ventasSemana.map((venta, idx) => {
                    const fecha = new Date(venta.fecha);
                    const diaSemana = fecha.toLocaleDateString('es-ES', { weekday: 'short' });
                    const diaMes = fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
                    
                    return (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                        <div>
                          <p className="font-medium text-gray-800 capitalize">{diaSemana}</p>
                          <p className="text-sm text-gray-600">{diaMes}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            {formatCurrency(venta.total)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {venta.cantidad} {venta.cantidad === 1 ? 'venta' : 'ventas'}
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
