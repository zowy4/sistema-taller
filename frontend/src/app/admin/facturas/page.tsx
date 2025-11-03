"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import ErrorAlert from '@/components/ui/ErrorAlert';
import Loader from '@/components/ui/Loader';
import StatsCard from '@/components/ui/StatsCard';

interface FacturaListItem {
  id_factura: number;
  fecha_factura: string;
  monto: number;
  estado_pago: string; // 'pagado' | 'pendiente' | etc.
  metodo_pago?: string | null;
  orden: {
    id_orden: number;
    estado: string;
    cliente: { nombre: string; apellido: string };
    vehiculo: { placa: string };
  };
}

export default function FacturasListPage() {
  const [facturas, setFacturas] = useState<FacturaListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [estadoPago, setEstadoPago] = useState<'todos' | 'pagado' | 'pendiente'>('todos');

  useEffect(() => {
    fetchFacturas();
  }, []);

  const fetchFacturas = async () => {
    setLoading(true);
    try {
      const data = await api.get<FacturaListItem[]>('/facturas');
      setFacturas(data);
      setError(null);
    } catch (e: unknown) {
      const message = (e as { message?: string })?.message || 'Error al cargar facturas';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const money = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(n || 0);

  const items = useMemo(() => {
    const term = busqueda.toLowerCase().trim();
    return facturas.filter(f => {
      const okEstado = estadoPago === 'todos' ? true : f.estado_pago === estadoPago;
      if (!okEstado) return false;
      if (!term) return true;
      const cliente = `${f.orden.cliente?.nombre || ''} ${f.orden.cliente?.apellido || ''}`.toLowerCase();
      const placa = `${f.orden.vehiculo?.placa || ''}`.toLowerCase();
      return cliente.includes(term) || placa.includes(term) || `${f.id_factura}`.includes(term) || `${f.orden.id_orden}`.includes(term);
    });
  }, [facturas, busqueda, estadoPago]);

  const stats = useMemo(() => {
    const total = facturas.length;
    const pagadas = facturas.filter(f => f.estado_pago === 'pagado').length;
    const pendientes = facturas.filter(f => f.estado_pago !== 'pagado').length;
    const montoTotal = facturas.reduce((s, f) => s + (f.monto || 0), 0);
    return { total, pagadas, pendientes, montoTotal };
  }, [facturas]);

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Facturas</h1>
          <p className="text-gray-600 text-sm mt-1">{facturas.length} factura(s) registradas</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchFacturas} className="px-3 py-2 rounded-md border hover:bg-gray-50">↻ Actualizar</button>
          <Link href="/admin/ordenes" className="px-3 py-2 rounded-md border hover:bg-gray-50">Órdenes</Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-gray-50 rounded p-4 mb-6 flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex-1">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por cliente, placa, #factura o #orden"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="w-full md:w-56">
          <select
            value={estadoPago}
            onChange={(e) => setEstadoPago(e.target.value as any)}
            className="w-full px-3 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todos los estados de pago</option>
            <option value="pagado">Pagado</option>
            <option value="pendiente">Pendiente</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total" value={stats.total} />
        <StatsCard title="Pagadas" value={stats.pagadas} valueClassName="text-green-600" />
        <StatsCard title="Pendientes" value={stats.pendientes} valueClassName="text-yellow-600" />
        <StatsCard title="Monto total" value={new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(stats.montoTotal)} />
      </div>

      {loading && <Loader text="Cargando facturas..." />}
      <ErrorAlert message={error} onClose={() => setError(null)} />

      {!loading && !error && (
        <div className="overflow-x-auto bg-gray-50 rounded shadow">
          <table className="min-w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-left"># Factura</th>
                <th className="px-4 py-2 text-left"># Orden</th>
                <th className="px-4 py-2 text-left">Cliente</th>
                <th className="px-4 py-2 text-left">Placa</th>
                <th className="px-4 py-2 text-left">Fecha</th>
                <th className="px-4 py-2 text-left">Monto</th>
                <th className="px-4 py-2 text-left">Método</th>
                <th className="px-4 py-2 text-left">Pago</th>
                <th className="px-4 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map(f => (
                <tr key={f.id_factura} className="border-t hover:bg-gray-100">
                  <td className="px-4 py-2 font-medium">#{f.id_factura}</td>
                  <td className="px-4 py-2">#{f.orden.id_orden}</td>
                  <td className="px-4 py-2">{f.orden.cliente.nombre} {f.orden.cliente.apellido}</td>
                  <td className="px-4 py-2">{f.orden.vehiculo.placa}</td>
                  <td className="px-4 py-2">{new Date(f.fecha_factura).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{money(f.monto)}</td>
                  <td className="px-4 py-2">{f.metodo_pago || '-'}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${f.estado_pago === 'pagado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {f.estado_pago}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2 justify-center">
                      <Link href={`/admin/facturas/${f.id_factura}`} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors text-sm">
                        👁️ Ver
                      </Link>
                      <Link href={`/admin/ordenes/${f.orden.id_orden}`} className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors text-sm">
                        🔧 Orden
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-gray-500">No hay facturas que coincidan con los filtros.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
