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
        return 'bg-green-900/20 border border-green-800 text-green-400';
      case 'pendiente':
        return 'bg-yellow-900/20 border border-yellow-800 text-yellow-400';
      case 'cancelada':
        return 'bg-red-900/20 border border-red-800 text-red-400';
      default:
        return 'bg-gray-900/20 border border-gray-800 text-gray-400';
    }
  };
  if (!token) {
    router.push('/login');
    return null;
  }
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] p-8 flex items-center justify-center">
        <div className="text-gray-400 font-mono uppercase">CARGANDO COMPRAS...</div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#0f0f0f] p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-bold text-white font-mono uppercase">COMPRAS A PROVEEDORES</h2>
          <p className="text-gray-400 text-sm mt-2 font-mono uppercase">
            GESTION DE COMPRAS E INVENTARIO
          </p>
        </div>
        <Link
          href="/admin/compras/new"
          className="bg-white text-black px-6 py-3 font-mono uppercase font-bold hover:bg-gray-200 transition-colors"
        >
          + NUEVA COMPRA
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-[#1a1a1a] border border-gray-800 p-6">
          <p className="text-gray-400 text-sm font-mono uppercase">TOTAL COMPRAS</p>
          <p className="text-3xl font-bold text-white font-mono mt-2">{stats.totalCompras}</p>
        </div>
        <div className="bg-[#1a1a1a] border border-gray-800 p-6">
          <p className="text-gray-400 text-sm font-mono uppercase">MONTO TOTAL</p>
          <p className="text-3xl font-bold text-white font-mono mt-2">{formatCurrency(stats.totalMonto)}</p>
        </div>
        <div className="bg-[#1a1a1a] border border-gray-800 p-6">
          <p className="text-gray-400 text-sm font-mono uppercase">COMPLETADAS</p>
          <p className="text-3xl font-bold text-white font-mono mt-2">{stats.completadas}</p>
        </div>
        <div className="bg-[#1a1a1a] border border-gray-800 p-6">
          <p className="text-gray-400 text-sm font-mono uppercase">PENDIENTES</p>
          <p className="text-3xl font-bold text-white font-mono mt-2">{stats.pendientes}</p>
        </div>
        <div className="bg-[#1a1a1a] border border-gray-800 p-6">
          <p className="text-gray-400 text-sm font-mono uppercase">CANCELADAS</p>
          <p className="text-3xl font-bold text-white font-mono mt-2">{stats.canceladas}</p>
        </div>
      </div>
      <div className="flex gap-4 mb-8">
        <input
          type="text"
          placeholder="BUSCAR POR PROVEEDOR, ID O NOTAS..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-[#2d2d2d] border border-gray-700 text-white px-4 py-3 font-mono focus:outline-none focus:border-gray-500"
        />
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="bg-[#2d2d2d] border border-gray-700 text-white px-4 py-3 font-mono focus:outline-none focus:border-gray-500"
        >
          <option value="todos">TODOS</option>
          <option value="completada">COMPLETADAS</option>
          <option value="pendiente">PENDIENTES</option>
          <option value="cancelada">CANCELADAS</option>
        </select>
      </div>
      {isError && (
        <div className="bg-red-900/20 border border-red-800 text-red-400 p-4 mb-8 font-mono">
          ERROR AL CARGAR COMPRAS. POR FAVOR, INTENTA NUEVAMENTE.
        </div>
      )}
      {}
      <div className="space-y-4">
        {comprasFiltradas.map(compra => (
          <div key={compra.id_compra} className="bg-[#1a1a1a] border border-gray-800 p-4 hover:bg-[#2d2d2d] transition-all">
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
                  {compra.proveedor.empresa && ` â€¢ ${compra.proveedor.empresa}`}
                </p>
                <p className="text-gray-500 text-xs mt-1" suppressHydrationWarning>
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
                  Ver detalles â†’
                </Link>
              </div>
            </div>
            {compra.notas && (
              <p className="text-gray-600 text-sm mb-3 italic">
                “ {compra.notas}
              </p>
            )}
            <div className="border-t border-gray-800 pt-4">
              <p className="text-sm font-bold text-white font-mono uppercase mb-3">
                REPUESTOS COMPRADOS ({compra.compras_repuestos?.length || 0}):
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {compra.compras_repuestos?.map((item, idx) => (
                  <div key={idx} className="bg-[#2d2d2d] border border-gray-700 p-3 text-sm">
                    <p className="font-bold text-white font-mono">{item.repuesto?.nombre?.toUpperCase() || 'SIN NOMBRE'}</p>
                    <p className="text-gray-400 font-mono mt-1">
                      {item.cantidad} UNIDADES x {formatCurrency(item.precio_unitario)} = {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        {comprasFiltradas.length === 0 && compras.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg mb-6 font-mono uppercase">NO HAY COMPRAS REGISTRADAS</p>
            <Link
              href="/admin/compras/new"
              className="bg-white text-black px-6 py-3 font-mono uppercase font-bold hover:bg-gray-200 transition-colors inline-block"
            >
              REGISTRAR PRIMERA COMPRA
            </Link>
          </div>
        )}
        {comprasFiltradas.length === 0 && compras.length > 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg font-mono uppercase">NO SE ENCONTRARON COMPRAS CON LOS FILTROS APLICADOS</p>
          </div>
        )}
      </div>
    </div>
  );
}
