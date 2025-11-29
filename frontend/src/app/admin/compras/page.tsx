'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { fetchCompras } from '@/services/compras.service';
import { Compra } from '@/types';
import { formatCurrency, formatDate } from '@/lib/formatters';

export default function ComprasPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const { data: compras = [], isLoading, isError } = useQuery<Compra[]>({
    queryKey: ['compras'],
    queryFn: () => {
      if (!token) throw new Error('No token found');
      return fetchCompras(token);
    },
    enabled: !!token,
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Filtrado y búsqueda
  const comprasFiltradas = useMemo(() => {
    return compras.filter(compra => {
      const matchSearch = search === '' || 
        compra.proveedor.nombre.toLowerCase().includes(search.toLowerCase()) ||
        compra.notas?.toLowerCase().includes(search.toLowerCase()) ||
        compra.id_compra.toString().includes(search);
      
      const matchEstado = filtroEstado === 'todos' || compra.estado === filtroEstado;
      
      return matchSearch && matchEstado;
    });
  }, [compras, search, filtroEstado]);

  // KPIs
  const stats = useMemo(() => {
    const totalCompras = compras.length;
    const totalMonto = compras.reduce((sum, c) => sum + c.total, 0);
    const completadas = compras.filter(c => c.estado === 'completada').length;
    const pendientes = compras.filter(c => c.estado === 'pendiente').length;
    const canceladas = compras.filter(c => c.estado === 'cancelada').length;
    
    return { totalCompras, totalMonto, completadas, pendientes, canceladas };
  }, [compras]);

  const getEstadoBadgeClass = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'completada':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
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
        <div className="text-gray-600">Cargando compras...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Compras a Proveedores</h2>
          <p className="text-gray-600 text-sm mt-1">
            Gestión de compras e inventario
          </p>
        </div>
        <Link
          href="/admin/compras/new"
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          + Nueva Compra
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded shadow">
          <p className="text-blue-600 text-sm font-medium">Total Compras</p>
          <p className="text-2xl font-bold text-blue-900">{stats.totalCompras}</p>
        </div>
        <div className="bg-green-50 p-4 rounded shadow">
          <p className="text-green-600 text-sm font-medium">Monto Total</p>
          <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.totalMonto)}</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded shadow">
          <p className="text-emerald-600 text-sm font-medium">Completadas</p>
          <p className="text-2xl font-bold text-emerald-900">{stats.completadas}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded shadow">
          <p className="text-yellow-600 text-sm font-medium">Pendientes</p>
          <p className="text-2xl font-bold text-yellow-900">{stats.pendientes}</p>
        </div>
        <div className="bg-red-50 p-4 rounded shadow">
          <p className="text-red-600 text-sm font-medium">Canceladas</p>
          <p className="text-2xl font-bold text-red-900">{stats.canceladas}</p>
        </div>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Buscar por proveedor, ID o notas..."
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
          <option value="completada">Completadas</option>
          <option value="pendiente">Pendientes</option>
          <option value="cancelada">Canceladas</option>
        </select>
      </div>

      {isError && (
        <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
          Error al cargar compras. Por favor, intenta nuevamente.
        </div>
      )}

      {/* Lista de Compras */}
      <div className="space-y-4">
        {comprasFiltradas.map(compra => (
          <div key={compra.id_compra} className="bg-gray-50 rounded shadow p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg">
                    Compra #{compra.id_compra}
                  </h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getEstadoBadgeClass(compra.estado)}`}>
                    {compra.estado}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mt-1">
                  {compra.proveedor.nombre}
                  {compra.proveedor.empresa && ` • ${compra.proveedor.empresa}`}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {formatDate(compra.fecha_compra)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(compra.total)}
                </p>
                <Link
                  href={`/admin/compras/${compra.id_compra}`}
                  className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                >
                  Ver detalles →
                </Link>
              </div>
            </div>

            {compra.notas && (
              <p className="text-gray-600 text-sm mb-3 italic">
                📝 {compra.notas}
              </p>
            )}

            <div className="border-t pt-3">
              <p className="text-sm font-medium mb-2">
                Repuestos comprados ({compra.compras_repuestos?.length || 0}):
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {compra.compras_repuestos?.map((item, idx) => (
                  <div key={idx} className="bg-white rounded p-2 text-sm">
                    <p className="font-medium">{item.repuesto?.nombre || 'Sin nombre'}</p>
                    <p className="text-gray-600">
                      {item.cantidad} unidades × {formatCurrency(item.precio_unitario)} = {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {comprasFiltradas.length === 0 && compras.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No hay compras registradas</p>
            <Link
              href="/admin/compras/new"
              className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors inline-block"
            >
              Registrar Primera Compra
            </Link>
          </div>
        )}

        {comprasFiltradas.length === 0 && compras.length > 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No se encontraron compras con los filtros aplicados</p>
          </div>
        )}
      </div>
    </div>
  );
}
