"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import ErrorAlert from '@/components/ui/ErrorAlert';
import Loader from '@/components/ui/Loader';
import StatsCard from '@/components/ui/StatsCard';

interface Orden {
  id_orden: number;
  fecha_apertura: string;
  fecha_entrega_estimada: string;
  fecha_entrega_real?: string;
  estado: string;
  total_estimado: number;
  total_real?: number;
  cliente: {
    nombre: string;
    apellido: string;
  };
  vehiculo: {
    placa: string;
    marca: string;
    modelo: string;
  };
  empleado_responsable: {
    nombre: string;
    apellido: string;
  };
  factura?: {
    id_factura: number;
  } | null;
}

type EstadoFiltro = 'todos' | 'pendiente' | 'en_proceso' | 'completado' | 'entregado' | 'cancelado';

export default function OrdenesPage() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoFiltro>('todos');

  useEffect(() => {
    fetchOrdenes();
  }, []);

  const fetchOrdenes = async () => {
    setLoading(true);
    try {
      // El helper maneja el token y el 401 automáticamente
      const data = await api.get<Orden[]>('/ordenes');
      setOrdenes(data);
      setError(null);
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Error al cargar órdenes';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Normaliza estados devueltos por el backend (soporta variantes como "en proceso"/"en_proceso" y "completada"/"completado")
  const normalizarEstado = (estado: string) => {
    let s = (estado || '').toLowerCase().trim().replace(/\s+/g, '_');
    if (s === 'enproceso') s = 'en_proceso';
    if (s === 'completada') s = 'completado';
    return s as 'pendiente' | 'en_proceso' | 'completado' | 'entregado' | 'cancelado';
  };

  const formatearEstado = (estado: string) => {
    const s = normalizarEstado(estado);
    return s.replace('_', ' ');
  };

  const getEstadoColor = (estado: string) => {
    switch (normalizarEstado(estado)) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'en_proceso': return 'bg-blue-100 text-blue-800';
      case 'completado': return 'bg-green-100 text-green-800';
      case 'entregado': return 'bg-gray-100 text-gray-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(n || 0);

  const ordenesFiltradas = useMemo(() => {
    const term = busqueda.toLowerCase().trim();
    return ordenes
      .filter(o => {
        const estadoOk = filtroEstado === 'todos' ? true : normalizarEstado(o.estado) === filtroEstado;
        if (!estadoOk) return false;
        if (!term) return true;
        const cliente = `${o.cliente?.nombre || ''} ${o.cliente?.apellido || ''}`.toLowerCase();
        const placa = `${o.vehiculo?.placa || ''}`.toLowerCase();
        return cliente.includes(term) || placa.includes(term);
      });
  }, [ordenes, busqueda, filtroEstado]);

  const stats = useMemo(() => {
    const total = ordenes.length;
    const pendientes = ordenes.filter(o => normalizarEstado(o.estado) === 'pendiente').length;
    const enProceso = ordenes.filter(o => normalizarEstado(o.estado) === 'en_proceso').length;
    const completadas = ordenes.filter(o => normalizarEstado(o.estado) === 'completado').length;
    return { total, pendientes, enProceso, completadas };
  }, [ordenes]);

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold">Órdenes de Trabajo</h2>
          <p className="text-gray-600 text-sm mt-1">
            {ordenes.length} orden{ordenes.length !== 1 ? 'es' : ''} registradas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchOrdenes} className="px-3 py-2 rounded-md border hover:bg-gray-50">↻ Actualizar</button>
          <Link
            href="/admin/ordenes/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            + Nueva Orden
          </Link>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-gray-50 rounded-md p-4 mb-6 flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex-1">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por cliente o placa..."
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="w-full md:w-56">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as EstadoFiltro)}
            className="w-full px-3 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_proceso">En proceso</option>
            <option value="completado">Completado</option>
            <option value="entregado">Entregado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total" value={stats.total} />
        <StatsCard title="Pendientes" value={stats.pendientes} valueClassName="text-yellow-600" />
        <StatsCard title="En proceso" value={stats.enProceso} valueClassName="text-blue-600" />
        <StatsCard title="Completadas" value={stats.completadas} valueClassName="text-green-600" />
      </div>

      {loading && <Loader text="Cargando órdenes..." />}
      <ErrorAlert message={error} onClose={() => setError(null)} />

      {!loading && !error && (
        <div className="overflow-x-auto bg-gray-50 rounded shadow">
          <table className="min-w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Cliente</th>
                <th className="px-4 py-2 text-left">Vehículo</th>
                <th className="px-4 py-2 text-left">Responsable</th>
                <th className="px-4 py-2 text-left">Fecha Apertura</th>
                <th className="px-4 py-2 text-left">Estado</th>
                <th className="px-4 py-2 text-left">Total Estimado</th>
                <th className="px-4 py-2 text-left">Factura</th>
                <th className="px-4 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordenesFiltradas.map(o => (
                <tr key={o.id_orden} className="border-t hover:bg-gray-100">
                  <td className="px-4 py-2 font-medium">#{o.id_orden}</td>
                  <td className="px-4 py-2">{o.cliente.nombre} {o.cliente.apellido}</td>
                  <td className="px-4 py-2">{o.vehiculo.placa} - {o.vehiculo.marca} {o.vehiculo.modelo}</td>
                  <td className="px-4 py-2">{o.empleado_responsable.nombre} {o.empleado_responsable.apellido}</td>
                  <td className="px-4 py-2">{new Date(o.fecha_apertura).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getEstadoColor(o.estado)}`}>
                      {formatearEstado(o.estado)}
                    </span>
                  </td>
                  <td className="px-4 py-2">{formatCurrency(o.total_estimado)}</td>
                  <td className="px-4 py-2">
                    {o.factura || normalizarEstado(o.estado) === 'entregado' ? (
                      <span className="text-green-700 font-medium">Sí</span>
                    ) : (
                      <span className="text-gray-500">No</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2 justify-center">
                      <Link
                        href={`/admin/ordenes/${o.id_orden}`}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors text-sm"
                      >
                        👁️ Ver
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {ordenesFiltradas.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                    No hay órdenes que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
