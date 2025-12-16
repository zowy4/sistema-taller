'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchStockBajo } from '@/services/repuestos.service';
import { fetchOrdenes } from '@/services/ordenes.service';
import { Orden } from '@/types';
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
type AlertFilter = 'todos' | 'stock' | 'proveedores' | 'ordenes';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
async function fetchProveedores(token: string): Promise<Proveedor[]> {
  const response = await fetch(`${API_URL}/proveedores`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    if (response.status === 401) throw new Error('UNAUTHORIZED');
    if (response.status === 403) throw new Error('FORBIDDEN');
    throw new Error('Error al obtener proveedores');
  }
  return response.json();
}
export default function AlertasPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<AlertFilter>('todos');
  const [mounted, setMounted] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    setMounted(true);
  }, []);
  const { data: stockBajo = [], isLoading: stockLoading, error: stockError } = useQuery({
    queryKey: ['alertas-stock-bajo'],
    queryFn: () => fetchStockBajo(token!),
    enabled: !!token,
    retry: 1,
  });
  const { data: proveedores = [], isLoading: proveedoresLoading } = useQuery({
    queryKey: ['alertas-proveedores'],
    queryFn: () => fetchProveedores(token!),
    enabled: !!token,
    retry: 1,
  });
  const { data: ordenes = [], isLoading: ordenesLoading } = useQuery({
    queryKey: ['alertas-ordenes'],
    queryFn: () => fetchOrdenes(token!),
    enabled: !!token,
    retry: 1,
  });
  if (stockError && stockError.message === 'UNAUTHORIZED') {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      router.push('/login');
    }
  }
  const proveedoresInactivos = proveedores.filter((p: Proveedor) => !p.activo);
  const ordenesPendientes = ordenes.filter((o: Orden) => 
    o.estado === 'pendiente' || o.estado === 'en_proceso'
  );
  const loading = stockLoading || proveedoresLoading || ordenesLoading;
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
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

  // Evitar hydration error esperando a que el componente se monte en el cliente
  if (!mounted || loading) return (
    <div className="min-h-screen bg-[#0f0f0f] p-8 flex items-center justify-center">
      <div className="text-gray-400 font-mono uppercase">CARGANDO ALERTAS...</div>
    </div>
  );

  const totalAlertas = stockBajo.length + proveedoresInactivos.length + ordenesPendientes.length;
  const filteredStock = filter === 'todos' || filter === 'stock' ? stockBajo : [];
  const filteredProveedores = filter === 'todos' || filter === 'proveedores' ? proveedoresInactivos : [];
  const filteredOrdenes = filter === 'todos' || filter === 'ordenes' ? ordenesPendientes : [];
  return (
    <div className="min-h-screen bg-[#0f0f0f] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white font-mono uppercase">SISTEMA DE ALERTAS</h1>
          <p className="text-gray-400 mt-2 font-mono uppercase">
            {totalAlertas} ALERTA{totalAlertas !== 1 ? 'S' : ''} ACTIVA{totalAlertas !== 1 ? 'S' : ''}
          </p>
        </div>
        {stockError && (
          <div className="bg-red-900/20 border border-red-800 text-red-400 p-4 mb-8 font-mono">
            {stockError instanceof Error ? stockError.message.toUpperCase() : 'ERROR AL CARGAR ALERTAS'}
          </div>
        )}
        <div className="flex gap-2 mb-8 border-b border-gray-800">
          <button
            onClick={() => setFilter('todos')}
            className={`px-4 py-3 font-mono uppercase font-bold transition-colors ${
              filter === 'todos'
                ? 'border-b-2 border-white text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            TODAS ({totalAlertas})
          </button>
          <button
            onClick={() => setFilter('stock')}
            className={`px-4 py-3 font-mono uppercase font-bold transition-colors ${
              filter === 'stock'
                ? 'border-b-2 border-red-400 text-red-400'
                : 'text-gray-400 hover:text-red-400'
            }`}
          >
            STOCK BAJO ({stockBajo.length})
          </button>
          <button
            onClick={() => setFilter('proveedores')}
            className={`px-4 py-3 font-mono uppercase font-bold transition-colors ${
              filter === 'proveedores'
                ? 'border-b-2 border-yellow-400 text-yellow-400'
                : 'text-gray-400 hover:text-yellow-400'
            }`}
          >
            PROVEEDORES INACTIVOS ({proveedoresInactivos.length})
          </button>
          <button
            onClick={() => setFilter('ordenes')}
            className={`px-4 py-3 font-mono uppercase font-bold transition-colors ${
              filter === 'ordenes'
                ? 'border-b-2 border-blue-400 text-blue-400'
                : 'text-gray-400 hover:text-blue-400'
            }`}
          >
            ORDENES PENDIENTES ({ordenesPendientes.length})
          </button>
        </div>
        {filteredStock.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-red-400 font-mono uppercase">REPUESTOS CON STOCK BAJO</h2>
              <Link href="/admin/compras/new" className="text-gray-400 hover:text-white text-sm font-mono uppercase">
                REGISTRAR COMPRA
              </Link>
            </div>
            <div className="space-y-4">
              {filteredStock.map(rep => {
                const deficit = rep.stock_minimo - rep.stock_actual;
                const costoReposicion = deficit * rep.precio_venta;
                const priority = getPriorityLabel(rep.stock_actual, rep.stock_minimo);
                const priorityClass = getPriorityClass(rep.stock_actual, rep.stock_minimo);
                return (
                  <div key={rep.id_repuesto} className="bg-red-900/20 border border-red-800 p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`px-2 py-1 text-xs font-bold font-mono ${priorityClass}`}>
                            {priority}
                          </span>
                          <Link
                            href={`/admin/repuestos/${rep.id_repuesto}`}
                            className="text-lg font-bold text-white hover:text-gray-300 font-mono uppercase"
                          >
                            {rep.nombre.toUpperCase()}
                          </Link>
                        </div>
                        <div className="flex gap-4 text-sm font-mono">
                          <span className="text-red-400 font-medium">
                            STOCK ACTUAL: {rep.stock_actual}
                          </span>
                          <span className="text-gray-400">
                            STOCK MINIMO: {rep.stock_minimo}
                          </span>
                          <span className="text-red-400 font-medium">
                            FALTAN: {deficit} UNIDADES
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400 mb-1 font-mono uppercase">COSTO DE REPOSICION</p>
                        <p className="text-xl font-bold text-red-400 font-mono">
                          {formatCurrency(costoReposicion)}
                        </p>
                        <p className="text-xs text-gray-500 font-mono">
                          {formatCurrency(rep.precio_venta)}/UNIDAD
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {}
        {filteredProveedores.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-yellow-600"> Proveedores Inactivos</h2>
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
                        <span>“§ {prov.email}</span>
                        <span>“ž {prov.telefono}</span>
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
        {filteredOrdenes.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-400 font-mono uppercase">ORDENES DE TRABAJO PENDIENTES</h2>
              <Link href="/admin/ordenes" className="text-gray-400 hover:text-white text-sm font-mono uppercase">
                VER TODAS
              </Link>
            </div>
            <div className="space-y-4">
              {filteredOrdenes.map(orden => (
                <div key={orden.id_orden} className="bg-blue-900/20 border border-blue-800 p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link
                        href={`/admin/ordenes/${orden.id_orden}`}
                        className="text-lg font-bold text-white hover:text-gray-300 font-mono uppercase"
                      >
                        ORDEN #{orden.id_orden}
                      </Link>
                      <p className="text-sm text-gray-400 mt-2 font-mono">
                        CLIENTE: {orden.cliente?.nombre?.toUpperCase() || 'N/A'} {orden.cliente?.apellido?.toUpperCase() || ''}
                      </p>
                      <p className="text-sm text-gray-400 font-mono">
                        VEHICULO: {orden.vehiculo?.marca?.toUpperCase() || 'N/A'} {orden.vehiculo?.modelo?.toUpperCase() || ''} - {orden.vehiculo?.patente?.toUpperCase() || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 mt-2 font-mono uppercase" suppressHydrationWarning>
                        INGRESO: {formatDate(orden.fecha_ingreso).toUpperCase()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-sm font-bold font-mono ${
                      orden.estado === 'pendiente' 
                        ? 'bg-blue-900/40 border border-blue-700 text-blue-400'
                        : 'bg-yellow-900/40 border border-yellow-700 text-yellow-400'
                    }`}>
                      {orden.estado.toUpperCase().replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {totalAlertas === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4"></div>
            <h3 className="text-2xl font-semibold mb-2">Todo en orden</h3>
            <p className="text-gray-600">No hay alertas activas en este momento</p>
          </div>
        )}
        {totalAlertas > 0 && (
          <div className="mt-8 bg-[#1a1a1a] border border-gray-800 p-6">
            <h3 className="font-semibold mb-3">” Resumen de Alertas</h3>
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
                <p className="text-gray-600">ó“rdenes por completar</p>
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
