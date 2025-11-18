'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

interface RepuestoStockBajo {
  id_repuesto: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  stock_actual: number;
  stock_minimo: number;
  precio_venta: number;
}

interface Proveedor {
  id_proveedor: number;
  nombre: string;
  empresa?: string;
  email: string;
  telefono: string;
  activo: boolean;
  _count?: { compras: number };
}

interface Orden {
  id_orden: number;
  fecha_apertura: string;
  estado: string;
  cliente: { nombre: string };
  vehiculo: { marca: string; modelo: string; placa: string };
}

type AlertFilter = 'todos' | 'stock' | 'proveedores' | 'ordenes';

export default function AlertasPage() {
  const router = useRouter();
  const [stockBajo, setStockBajo] = useState<RepuestoStockBajo[]>([]);
  const [proveedoresInactivos, setProveedoresInactivos] = useState<Proveedor[]>([]);
  const [ordenesPendientes, setOrdenesPendientes] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<AlertFilter>('todos');

  useEffect(() => {
    fetchAlertas();
  }, []);

  const fetchAlertas = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const headers = { 'Authorization': `Bearer ${token}` };

      const [stockRes, provRes, ordenesRes] = await Promise.all([
        fetch(`${API_URL}/repuestos/stock-bajo`, { headers }),
        fetch(`${API_URL}/proveedores`, { headers }),
        fetch(`${API_URL}/ordenes`, { headers })
      ]);

      if (stockRes.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      if (!stockRes.ok || !provRes.ok || !ordenesRes.ok) {
        throw new Error('Error al cargar alertas');
      }

      const [stockData, provData, ordenesData] = await Promise.all([
        stockRes.json(),
        provRes.json(),
        ordenesRes.json()
      ]);

      setStockBajo(stockData);

      // Filter inactive suppliers with no recent purchases
      const inactivos = provData.filter((p: Proveedor) => !p.activo);
      setProveedoresInactivos(inactivos);

      // Filter pending/processing orders
      const pendientes = ordenesData.filter((o: Orden) => 
        o.estado === 'abierta' || o.estado === 'en progreso'
      );
      setOrdenesPendientes(pendientes);

      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar alertas');
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
      year: 'numeric'
    });
  };

  const getPriorityClass = (cantidad: number, minimo: number) => {
    const ratio = cantidad / minimo;
    if (ratio === 0) return 'bg-red-600 text-white';
    if (ratio < 0.5) return 'bg-red-500 text-white';
    if (ratio < 1) return 'bg-yellow-500 text-white';
    return 'bg-gray-400 text-white';
  };

  const getPriorityLabel = (cantidad: number, minimo: number) => {
    if (cantidad === 0) return 'CRÍTICO';
    if (cantidad < minimo * 0.5) return 'URGENTE';
    if (cantidad < minimo) return 'BAJO';
    return 'NORMAL';
  };

  if (loading) return (
    <div className="min-h-screen bg-white p-6 flex items-center justify-center">
      <div className="text-gray-600">Cargando alertas...</div>
    </div>
  );

  const totalAlertas = stockBajo.length + proveedoresInactivos.length + ordenesPendientes.length;

  const filteredStock = filter === 'todos' || filter === 'stock' ? stockBajo : [];
  const filteredProveedores = filter === 'todos' || filter === 'proveedores' ? proveedoresInactivos : [];
  const filteredOrdenes = filter === 'todos' || filter === 'ordenes' ? ordenesPendientes : [];

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">🔔 Sistema de Alertas</h1>
          <p className="text-gray-600">
            {totalAlertas} alerta{totalAlertas !== 1 ? 's' : ''} activa{totalAlertas !== 1 ? 's' : ''}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setFilter('todos')}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === 'todos'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Todas ({totalAlertas})
          </button>
          <button
            onClick={() => setFilter('stock')}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === 'stock'
                ? 'border-b-2 border-red-600 text-red-600'
                : 'text-gray-600 hover:text-red-600'
            }`}
          >
            Stock Bajo ({stockBajo.length})
          </button>
          <button
            onClick={() => setFilter('proveedores')}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === 'proveedores'
                ? 'border-b-2 border-yellow-600 text-yellow-600'
                : 'text-gray-600 hover:text-yellow-600'
            }`}
          >
            Proveedores Inactivos ({proveedoresInactivos.length})
          </button>
          <button
            onClick={() => setFilter('ordenes')}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === 'ordenes'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Órdenes Pendientes ({ordenesPendientes.length})
          </button>
        </div>

        {/* Stock Bajo Alerts */}
        {filteredStock.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-red-600">⚠️ Repuestos con Stock Bajo</h2>
              <Link href="/admin/compras/new" className="text-blue-600 hover:underline text-sm">
                Registrar compra →
              </Link>
            </div>
            <div className="space-y-3">
              {filteredStock.map(rep => {
                const deficit = rep.stock_minimo - rep.stock_actual;
                const costoReposicion = deficit * rep.precio_venta;
                const priority = getPriorityLabel(rep.stock_actual, rep.stock_minimo);
                const priorityClass = getPriorityClass(rep.stock_actual, rep.stock_minimo);

                return (
                  <div key={rep.id_repuesto} className="bg-red-50 border border-red-200 rounded p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${priorityClass}`}>
                            {priority}
                          </span>
                          <Link
                            href={`/admin/repuestos/${rep.id_repuesto}`}
                            className="text-lg font-semibold text-blue-600 hover:underline"
                          >
                            {rep.nombre}
                          </Link>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <span className="text-red-700 font-medium">
                            Stock actual: {rep.stock_actual}
                          </span>
                          <span className="text-gray-600">
                            Stock mínimo: {rep.stock_minimo}
                          </span>
                          <span className="text-red-600 font-medium">
                            Faltan: {deficit} unidades
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Costo de reposición</p>
                        <p className="text-xl font-bold text-red-600">
                          {formatCurrency(costoReposicion)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(rep.precio_venta)}/unidad
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Proveedores Inactivos */}
        {filteredProveedores.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-yellow-600">🏢 Proveedores Inactivos</h2>
              <Link href="/admin/proveedores" className="text-blue-600 hover:underline text-sm">
                Ver todos →
              </Link>
            </div>
            <div className="space-y-3">
              {filteredProveedores.map(prov => (
                <div key={prov.id_proveedor} className="bg-yellow-50 border border-yellow-200 rounded p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link
                        href={`/admin/proveedores/${prov.id_proveedor}`}
                        className="text-lg font-semibold text-blue-600 hover:underline"
                      >
                        {prov.nombre}
                      </Link>
                      {prov.empresa && (
                        <p className="text-sm text-gray-600">{prov.empresa}</p>
                      )}
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        <span>📧 {prov.email}</span>
                        <span>📞 {prov.telefono}</span>
                      </div>
                      {prov._count && (
                        <p className="text-xs text-gray-500 mt-1">
                          {prov._count.compras} compras realizadas
                        </p>
                      )}
                    </div>
                    <span className="bg-yellow-500 text-white px-3 py-1 rounded text-sm font-medium">
                      INACTIVO
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Órdenes Pendientes */}
        {filteredOrdenes.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-blue-600">🔧 Órdenes de Trabajo Pendientes</h2>
              <Link href="/admin/ordenes" className="text-blue-600 hover:underline text-sm">
                Ver todas →
              </Link>
            </div>
            <div className="space-y-3">
              {filteredOrdenes.map(orden => (
                <div key={orden.id_orden} className="bg-blue-50 border border-blue-200 rounded p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link
                        href={`/admin/ordenes/${orden.id_orden}`}
                        className="text-lg font-semibold text-blue-600 hover:underline"
                      >
                        Orden #{orden.id_orden}
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">
                        Cliente: {orden.cliente.nombre}
                      </p>
                      <p className="text-sm text-gray-600">
                        Vehículo: {orden.vehiculo.marca} {orden.vehiculo.modelo} - {orden.vehiculo.placa}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Apertura: {formatDate(orden.fecha_apertura)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      orden.estado === 'abierta' 
                        ? 'bg-blue-500 text-white'
                        : 'bg-yellow-500 text-white'
                    }`}>
                      {orden.estado.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {totalAlertas === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-semibold mb-2">Todo en orden</h3>
            <p className="text-gray-600">No hay alertas activas en este momento</p>
          </div>
        )}

        {totalAlertas > 0 && (
          <div className="mt-8 bg-gray-50 rounded p-6">
            <h3 className="font-semibold mb-3">🔍 Resumen de Alertas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Repuestos críticos</p>
                <p className="text-2xl font-bold text-red-600">
                  {stockBajo.filter(r => r.stock_actual === 0).length}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Proveedores a reactivar</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {proveedoresInactivos.length}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Órdenes por completar</p>
                <p className="text-2xl font-bold text-blue-600">
                  {ordenesPendientes.length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
