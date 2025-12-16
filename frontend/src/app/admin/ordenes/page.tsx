'use client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { fetchOrdenes } from '@/services/ordenes.service';
import { useOrdenesMutations } from '@/hooks/useOrdenesMutations';
import { Orden } from '@/types';
import { formatCurrency, formatShortDate } from '@/lib/formatters';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
type EstadoFiltro = 'todos' | 'pendiente' | 'en_proceso' | 'completada' | 'cancelada';
export default function OrdenesPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoFiltro>('todos');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const isRecepcion = user?.rol === 'recepcion';
  const { data: ordenes = [], isLoading, isError, error } = useQuery<Orden[]>({
    queryKey: ['ordenes'],
    queryFn: () => {
      if (!token) throw new Error('No token found');
      return fetchOrdenes(token);
    },
    enabled: !!token,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (isError && error?.message === 'UNAUTHORIZED') {
      logout();
      router.push('/login');
    }
  }, [isError, error, logout, router]);
  const { updateEstadoMutation } = useOrdenesMutations();
  const cambiarEstado = (id: number, estado: 'pendiente' | 'en_proceso' | 'completada' | 'cancelada') => {
    updateEstadoMutation.mutate({ id, estado });
  };
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
  const stats = useMemo(() => {
    const total = ordenes.length;
    const pendientes = ordenes.filter(o => o.estado === 'pendiente').length;
    const enProceso = ordenes.filter(o => o.estado === 'en_proceso').length;
    const completadas = ordenes.filter(o => o.estado === 'completada').length;
    return { total, pendientes, enProceso, completadas };
  }, [ordenes]);
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-600/20 border border-yellow-600 text-yellow-500';
      case 'en_proceso': return 'bg-blue-600/20 border border-blue-600 text-blue-500';
      case 'completada': return 'bg-green-600/20 border border-green-600 text-green-500';
      case 'cancelada': return 'bg-red-600/20 border border-red-600 text-red-500';
      default: return 'bg-gray-600/20 border border-gray-600 text-gray-500';
    }
  };
  if (!token) {
    router.push('/login');
    return null;
  }
  return (
    <div className="min-h-screen bg-[#0f0f0f] p-6">
      {isLoading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-400">Cargando órdenes...</div>
        </div>
      )}
      {!isLoading && (
        <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Órdenes de Trabajo</h2>
          <p className="text-gray-400 text-sm mt-1">
            Gestión de órdenes y flujo de trabajo
          </p>
        </div>
        <Link
          href="/admin/ordenes/new"
          className="bg-gradient-to-r from-orange-600 to-orange-500 border border-orange-400/50 text-white px-4 py-2 hover:from-orange-500 hover:to-orange-400 transition-colors font-mono"
        >
          + Nueva Orden
        </Link>
      </div>
      {}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1a1a1a] border border-gray-800 p-4">
          <p className="text-orange-500 text-sm font-medium uppercase tracking-wide">Total Órdenes</p>
          <p className="text-2xl font-black text-white font-mono">{stats.total}</p>
        </div>
        <div className="bg-[#1a1a1a] border border-gray-800 p-4">
          <p className="text-yellow-500 text-sm font-medium uppercase tracking-wide">Pendientes</p>
          <p className="text-2xl font-black text-yellow-500 font-mono">{stats.pendientes}</p>
        </div>
        <div className="bg-[#1a1a1a] border border-gray-800 p-4">
          <p className="text-blue-500 text-sm font-medium uppercase tracking-wide">En Proceso</p>
          <p className="text-2xl font-black text-blue-500 font-mono">{stats.enProceso}</p>
        </div>
        <div className="bg-[#1a1a1a] border border-gray-800 p-4">
          <p className="text-green-500 text-sm font-medium uppercase tracking-wide">Completadas</p>
          <p className="text-2xl font-black text-green-500 font-mono">{stats.completadas}</p>
        </div>
      </div>
      {}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="?? Buscar por cliente o patente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-[#1a1a1a] border border-gray-800 text-white px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value as EstadoFiltro)}
          className="bg-[#1a1a1a] border border-gray-800 text-white px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="todos">Todos</option>
          <option value="pendiente">Pendientes</option>
          <option value="en_proceso">En Proceso</option>
          <option value="completada">Completadas</option>
          <option value="cancelada">Canceladas</option>
        </select>
      </div>
      {isError && (
        <div className="bg-red-600/20 border border-red-600 text-red-500 p-3 mb-4">
          Error al cargar órdenes. Por favor, intenta nuevamente.
        </div>
      )}
      {}
      <div className="overflow-x-auto bg-[#1a1a1a] border border-gray-800">
        <table className="min-w-full">
          <thead className="bg-[#2d2d2d] border-b border-gray-800">
            <tr>
              <th className="px-4 py-2 text-left text-white font-black uppercase tracking-wide text-xs">ID</th>
              <th className="px-4 py-2 text-left text-white font-black uppercase tracking-wide text-xs">Cliente</th>
              <th className="px-4 py-2 text-left text-white font-black uppercase tracking-wide text-xs">Vehículo</th>
              <th className="px-4 py-2 text-left text-white font-black uppercase tracking-wide text-xs">Empleado</th>
              <th className="px-4 py-2 text-left text-white font-black uppercase tracking-wide text-xs">Fecha</th>
              <th className="px-4 py-2 text-left text-white font-black uppercase tracking-wide text-xs">Estado</th>
              <th className="px-4 py-2 text-left text-white font-black uppercase tracking-wide text-xs">Total</th>
              <th className="px-4 py-2 text-center text-white font-black uppercase tracking-wide text-xs">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ordenesFiltradas.map(orden => (
              <tr key={orden.id_orden} className="border-t border-gray-800 hover:bg-[#2d2d2d]">
                <td className="px-4 py-2">
                  <span className="bg-orange-600/20 border border-orange-600 text-orange-500 px-2 py-1 text-xs font-mono">
                    #{orden.id_orden}
                  </span>
                </td>
                <td className="px-4 py-2 text-white">
                  {orden.cliente?.nombre} {orden.cliente?.apellido}
                </td>
                <td className="px-4 py-2 text-white">
                  {orden.vehiculo?.marca} {orden.vehiculo?.modelo}
                  <br />
                  <span className="text-xs text-gray-500 font-mono">{orden.vehiculo?.patente}</span>
                </td>
                <td className="px-4 py-2 text-gray-400">
                  {orden.empleado?.nombre ? `${orden.empleado.nombre} ${orden.empleado.apellido}` : 'Sin asignar'}
                </td>
                <td className="px-4 py-2 text-gray-400 font-mono text-sm" suppressHydrationWarning>{formatShortDate(orden.fecha_ingreso)}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 text-xs font-medium uppercase tracking-wide ${getEstadoBadge(orden.estado)}`}>
                    {orden.estado.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-2 font-mono font-black text-white">{formatCurrency(orden.total)}</td>
                <td className="px-4 py-2">
                  <div className="flex gap-2 justify-center flex-wrap">
                    <Link
                      href={`/admin/ordenes/${orden.id_orden}`}
                      className="bg-orange-600/20 border border-orange-600 text-orange-500 px-3 py-1 hover:bg-orange-600/30 transition-colors text-sm font-mono"
                    >
                      Ver
                    </Link>
                    {}
                    {!isRecepcion && orden.estado === 'pendiente' && (
                      <button
                        onClick={() => cambiarEstado(orden.id_orden, 'en_proceso')}
                        className="bg-blue-600/20 border border-blue-600 text-blue-500 px-3 py-1 hover:bg-blue-600/30 transition-colors text-sm font-mono"
                        disabled={updateEstadoMutation.isPending}
                      >
                        ?? Iniciar
                      </button>
                    )}
                    {}
                    {!isRecepcion && orden.estado === 'en_proceso' && (
                      <button
                        onClick={() => cambiarEstado(orden.id_orden, 'completada')}
                        className="bg-green-600/20 border border-green-600 text-green-500 px-3 py-1 hover:bg-green-600/30 transition-colors text-sm font-mono"
                        disabled={updateEstadoMutation.isPending}
                      >
                        ? Completar
                      </button>
                    )}
                    {}
                    {(orden.estado === 'pendiente' || orden.estado === 'en_proceso') && (
                      <button
                        onClick={() => cambiarEstado(orden.id_orden, 'cancelada')}
                        className="bg-red-600/20 border border-red-600 text-red-500 px-3 py-1 hover:bg-red-600/30 transition-colors text-sm font-mono"
                        disabled={updateEstadoMutation.isPending}
                      >
                        ?
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {ordenesFiltradas.length === 0 && ordenes.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-500 opacity-30">
                  No hay órdenes registradas
                </td>
              </tr>
            )}
            {ordenesFiltradas.length === 0 && ordenes.length > 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-500 opacity-30">
                  No se encontraron órdenes con los filtros aplicados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </>
      )}
    </div>
  );
}
