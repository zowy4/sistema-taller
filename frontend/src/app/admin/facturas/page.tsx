'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { fetchFacturas } from '@/services/facturas.service';
import { Factura } from '@/types';
import { formatCurrency, formatShortDate } from '@/lib/formatters';

export default function FacturasPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const { data: facturas = [], isLoading, isError } = useQuery<Factura[]>({
    queryKey: ['facturas'],
    queryFn: () => {
      if (!token) throw new Error('No token found');
      return fetchFacturas(token);
    },
    enabled: !!token,
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Filtrado y búsqueda
  const facturasFiltradas = useMemo(() => {
    return facturas.filter(factura => {
      const matchSearch = search === '' || 
        factura.numero_factura.toLowerCase().includes(search.toLowerCase()) ||
        factura.orden?.cliente.nombre.toLowerCase().includes(search.toLowerCase()) ||
        factura.orden?.cliente.apellido.toLowerCase().includes(search.toLowerCase()) ||
        factura.orden?.vehiculo.patente?.toLowerCase().includes(search.toLowerCase()) ||
        factura.id_factura.toString().includes(search) ||
        factura.id_orden.toString().includes(search);
      
      const matchEstado = filtroEstado === 'todos' || factura.estado_pago === filtroEstado;
      
      return matchSearch && matchEstado;
    });
  }, [facturas, search, filtroEstado]);

  // KPIs
  const stats = useMemo(() => {
    const totalFacturas = facturas.length;
    const totalMonto = facturas.reduce((sum, f) => sum + f.total, 0);
    const pagadas = facturas.filter(f => f.estado_pago === 'pagada').length;
    const pendientes = facturas.filter(f => f.estado_pago === 'pendiente').length;
    
    return { totalFacturas, totalMonto, pagadas, pendientes };
  }, [facturas]);

  const getEstadoPagoBadge = (estado: string) => {
    switch (estado) {
      case 'pagada':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'vencida':
        return 'bg-red-100 text-red-800';
      case 'cancelada':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!token) {
    router.push('/login');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="text-gray-600">Cargando facturas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Facturas</h2>
          <p className="text-gray-600 text-sm mt-1">
            Gestión de facturación y pagos
          </p>
        </div>
        <Link
          href="/admin/ordenes"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Ver Órdenes
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded shadow">
          <p className="text-blue-600 text-sm font-medium">Total Facturas</p>
          <p className="text-2xl font-bold text-blue-900">{stats.totalFacturas}</p>
        </div>
        <div className="bg-green-50 p-4 rounded shadow">
          <p className="text-green-600 text-sm font-medium">Monto Total</p>
          <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.totalMonto)}</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded shadow">
          <p className="text-emerald-600 text-sm font-medium">Pagadas</p>
          <p className="text-2xl font-bold text-emerald-900">{stats.pagadas}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded shadow">
          <p className="text-yellow-600 text-sm font-medium">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-900">{stats.pendientes}</p>
        </div>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Buscar por cliente, placa, #factura o #orden..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="todos">Todos</option>
          <option value="pagada">Pagadas</option>
          <option value="pendiente">Pendientes</option>
          <option value="vencida">Vencidas</option>
          <option value="cancelada">Canceladas</option>
        </select>
      </div>

      {isError && (
        <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
          Error al cargar facturas. Por favor, intenta nuevamente.
        </div>
      )}

      {/* Tabla de Facturas */}
      <div className="overflow-x-auto bg-gray-50 rounded shadow">
        <table className="min-w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 text-left"># Factura</th>
              <th className="px-4 py-2 text-left"># Orden</th>
              <th className="px-4 py-2 text-left">Cliente</th>
              <th className="px-4 py-2 text-left">Vehículo</th>
              <th className="px-4 py-2 text-left">Fecha</th>
              <th className="px-4 py-2 text-left">Total</th>
              <th className="px-4 py-2 text-left">Método</th>
              <th className="px-4 py-2 text-left">Estado</th>
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {facturasFiltradas.map(factura => (
              <tr key={factura.id_factura} className="border-t hover:bg-gray-100">
                <td className="px-4 py-2 font-medium">{factura.numero_factura}</td>
                <td className="px-4 py-2">#{factura.id_orden}</td>
                <td className="px-4 py-2">
                  {factura.orden?.cliente.nombre} {factura.orden?.cliente.apellido}
                </td>
                <td className="px-4 py-2">
                  {factura.orden?.vehiculo.marca} {factura.orden?.vehiculo.modelo}
                  <br />
                  <span className="text-xs text-gray-500">{factura.orden?.vehiculo.patente}</span>
                </td>
                <td className="px-4 py-2">{formatShortDate(factura.fecha_emision)}</td>
                <td className="px-4 py-2 font-semibold">{formatCurrency(factura.total)}</td>
                <td className="px-4 py-2">{factura.metodo_pago || '-'}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getEstadoPagoBadge(factura.estado_pago)}`}>
                    {factura.estado_pago}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <div className="flex gap-2 justify-center">
                    <Link
                      href={`/admin/facturas/${factura.id_factura}`}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors text-sm"
                    >
                      Ver
                    </Link>
                    <Link
                      href={`/admin/ordenes/${factura.id_orden}`}
                      className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors text-sm"
                    >
                      Orden
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {facturasFiltradas.length === 0 && facturas.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-gray-500">
                  No hay facturas registradas
                </td>
              </tr>
            )}
            {facturasFiltradas.length === 0 && facturas.length > 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-gray-500">
                  No se encontraron facturas con los filtros aplicados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
