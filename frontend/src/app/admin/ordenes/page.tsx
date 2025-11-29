'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { fetchOrdenes } from '@/services/ordenes.service';
import { useOrdenesMutations } from '@/hooks/useOrdenesMutations';
import { Orden } from '@/types';
import { formatCurrency, formatShortDate } from '@/lib/formatters';
import { useAuth } from '@/contexts/AuthContext';

type EstadoFiltro = 'todos' | 'pendiente' | 'en_proceso' | 'completada' | 'cancelada';

export default function OrdenesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoFiltro>('todos');
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const isRecepcion = user?.rol === 'recepcion';

  const { data: ordenes = [], isLoading, isError } = useQuery<Orden[]>({
    queryKey: ['ordenes'],
    queryFn: () => {
      if (!token) throw new Error('No token found');
      return fetchOrdenes(token);
    },
    enabled: !!token,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { updateEstadoMutation } = useOrdenesMutations();

  // Cambiar estado con mutación optimista
  const cambiarEstado = (id: number, estado: 'pendiente' | 'en_proceso' | 'completada' | 'cancelada') => {
    updateEstadoMutation.mutate({ id, estado });
  };

  // Filtrado y búsqueda
  const ordenesFiltradas = useMemo(() => {
    return ordenes.filter(orden => {
      const matchSearch = search === '' || 
        orden.cliente?.nombre.toLowerCase().includes(search.toLowerCase()) ||
        orden.cliente?.apellido.toLowerCase().includes(search.toLowerCase()) ||
        orden.vehiculo?.patente?.toLowerCase().includes(search.toLowerCase()) ||
        orden.id_orden.toString().includes(search);
      
      const matchEstado = filtroEstado === 'todos' || orden.estado === filtroEstado;
      
      return matchSearch && matchEstado;
    });
  }, [ordenes, search, filtroEstado]);

  // KPIs
  const stats = useMemo(() => {
    const total = ordenes.length;
    const pendientes = ordenes.filter(o => o.estado === 'pendiente').length;
    const enProceso = ordenes.filter(o => o.estado === 'en_proceso').length;
    const completadas = ordenes.filter(o => o.estado === 'completada').length;
    
    return { total, pendientes, enProceso, completadas };
  }, [ordenes]);

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'en_proceso': return 'bg-blue-100 text-blue-800';
      case 'completada': return 'bg-green-100 text-green-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!token) {
    router.push('/login');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="text-gray-600">Cargando órdenes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Órdenes de Trabajo</h2>
          <p className="text-gray-600 text-sm mt-1">
            Gestión de órdenes y flujo de trabajo
          </p>
        </div>
        <Link
          href="/admin/ordenes/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          + Nueva Orden
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded shadow">
          <p className="text-blue-600 text-sm font-medium">Total Órdenes</p>
          <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded shadow">
          <p className="text-yellow-600 text-sm font-medium">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-900">{stats.pendientes}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded shadow">
          <p className="text-purple-600 text-sm font-medium">En Proceso</p>
          <p className="text-2xl font-bold text-purple-900">{stats.enProceso}</p>
        </div>
        <div className="bg-green-50 p-4 rounded shadow">
          <p className="text-green-600 text-sm font-medium">Completadas</p>
          <p className="text-2xl font-bold text-green-900">{stats.completadas}</p>
        </div>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Buscar por cliente o patente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value as EstadoFiltro)}
          className="border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="todos">Todos</option>
          <option value="pendiente">Pendientes</option>
          <option value="en_proceso">En Proceso</option>
          <option value="completada">Completadas</option>
          <option value="cancelada">Canceladas</option>
        </select>
      </div>

      {isError && (
        <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
          Error al cargar órdenes. Por favor, intenta nuevamente.
        </div>
      )}

      {/* Tabla de Órdenes */}
      <div className="overflow-x-auto bg-gray-50 rounded shadow">
        <table className="min-w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Cliente</th>
              <th className="px-4 py-2 text-left">Vehículo</th>
              <th className="px-4 py-2 text-left">Empleado</th>
              <th className="px-4 py-2 text-left">Fecha</th>
              <th className="px-4 py-2 text-left">Estado</th>
              <th className="px-4 py-2 text-left">Total</th>
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ordenesFiltradas.map(orden => (
              <tr key={orden.id_orden} className="border-t hover:bg-gray-100">
                <td className="px-4 py-2 font-medium">#{orden.id_orden}</td>
                <td className="px-4 py-2">
                  {orden.cliente?.nombre} {orden.cliente?.apellido}
                </td>
                <td className="px-4 py-2">
                  {orden.vehiculo?.marca} {orden.vehiculo?.modelo}
                  <br />
                  <span className="text-xs text-gray-500">{orden.vehiculo?.patente}</span>
                </td>
                <td className="px-4 py-2">
                  {orden.empleado?.nombre ? `${orden.empleado.nombre} ${orden.empleado.apellido}` : 'Sin asignar'}
                </td>
                <td className="px-4 py-2">{formatShortDate(orden.fecha_ingreso)}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getEstadoBadge(orden.estado)}`}>
                    {orden.estado.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-2 font-semibold">{formatCurrency(orden.total)}</td>
                <td className="px-4 py-2">
                  <div className="flex gap-2 justify-center flex-wrap">
                    <Link
                      href={`/admin/ordenes/${orden.id_orden}`}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors text-sm"
                    >
                      Ver
                    </Link>
                    
                    {/* Botón Iniciar (optimista instantáneo) */}
                    {!isRecepcion && orden.estado === 'pendiente' && (
                      <button
                        onClick={() => cambiarEstado(orden.id_orden, 'en_proceso')}
                        className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition-colors text-sm"
                        disabled={updateEstadoMutation.isPending}
                      >
                        ▶️ Iniciar
                      </button>
                    )}
                    
                    {/* Botón Completar (optimista instantáneo) */}
                    {!isRecepcion && orden.estado === 'en_proceso' && (
                      <button
                        onClick={() => cambiarEstado(orden.id_orden, 'completada')}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors text-sm"
                        disabled={updateEstadoMutation.isPending}
                      >
                        ✓ Completar
                      </button>
                    )}
                    
                    {/* Botón Cancelar */}
                    {(orden.estado === 'pendiente' || orden.estado === 'en_proceso') && (
                      <button
                        onClick={() => cambiarEstado(orden.id_orden, 'cancelada')}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors text-sm"
                        disabled={updateEstadoMutation.isPending}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {ordenesFiltradas.length === 0 && ordenes.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                  No hay órdenes registradas
                </td>
              </tr>
            )}
            {ordenesFiltradas.length === 0 && ordenes.length > 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                  No se encontraron órdenes con los filtros aplicados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}