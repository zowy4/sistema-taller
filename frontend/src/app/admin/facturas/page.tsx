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
  const stats = useMemo(() => {
    const totalFacturas = facturas.length;
    const facturasConTotal = facturas.filter(f => f.total != null && !isNaN(f.total));
    const totalMonto = facturasConTotal.reduce((sum, f) => sum + f.total, 0);
    const pagadas = facturas.filter(f => f.estado_pago === 'pagada').length;
    const pendientes = facturas.filter(f => f.estado_pago === 'pendiente').length;
    return { totalFacturas, totalMonto, pagadas, pendientes };
  }, [facturas]);
  const getEstadoPagoBadge = (estado: string) => {
    switch (estado) {
      case 'pagada':
        return 'bg-green-900/20 border border-green-800 text-green-400';
      case 'pendiente':
        return 'bg-yellow-900/20 border border-yellow-800 text-yellow-400';
      case 'vencida':
        return 'bg-red-900/20 border border-red-800 text-red-400';
      case 'cancelada':
        return 'bg-gray-900/20 border border-gray-800 text-gray-400';
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
        <div className="text-gray-400 font-mono uppercase">CARGANDO FACTURAS...</div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#0f0f0f] p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-bold text-white font-mono uppercase">FACTURAS</h2>
          <p className="text-gray-400 text-sm mt-2 font-mono uppercase">
            GESTION DE FACTURACION Y PAGOS
          </p>
        </div>
        <Link
          href="/admin/ordenes"
          className="bg-white text-black px-6 py-3 font-mono uppercase font-bold hover:bg-gray-200 transition-colors"
        >
          VER ORDENES
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1a1a1a] border border-gray-800 p-6">
          <p className="text-gray-400 text-sm font-mono uppercase">TOTAL FACTURAS</p>
          <p className="text-3xl font-bold text-white font-mono mt-2">{stats.totalFacturas}</p>
        </div>
        <div className="bg-[#1a1a1a] border border-gray-800 p-6">
          <p className="text-gray-400 text-sm font-mono uppercase">MONTO TOTAL</p>
          <p className="text-3xl font-bold text-white font-mono mt-2">{formatCurrency(stats.totalMonto)}</p>
        </div>
        <div className="bg-[#1a1a1a] border border-gray-800 p-6">
          <p className="text-gray-400 text-sm font-mono uppercase">PAGADAS</p>
          <p className="text-3xl font-bold text-white font-mono mt-2">{stats.pagadas}</p>
        </div>
        <div className="bg-[#1a1a1a] border border-gray-800 p-6">
          <p className="text-gray-400 text-sm font-mono uppercase">PENDIENTES</p>
          <p className="text-3xl font-bold text-white font-mono mt-2">{stats.pendientes}</p>
        </div>
      </div>
      {}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="” Buscar por cliente, placa, #factura o #orden..."
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
        <div className="bg-red-900/20 border border-red-800 text-red-400 p-4 mb-8 font-mono">
          ERROR AL CARGAR FACTURAS. POR FAVOR, INTENTA NUEVAMENTE.
        </div>
      )}
      <div className="overflow-x-auto bg-[#1a1a1a] border border-gray-800">
        <table className="min-w-full">
          <thead className="bg-[#2d2d2d] border-b border-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-gray-400 font-mono uppercase text-sm"># FACTURA</th>
              <th className="px-4 py-3 text-left text-gray-400 font-mono uppercase text-sm"># ORDEN</th>
              <th className="px-4 py-3 text-left text-gray-400 font-mono uppercase text-sm">CLIENTE</th>
              <th className="px-4 py-3 text-left text-gray-400 font-mono uppercase text-sm">VEHICULO</th>
              <th className="px-4 py-3 text-left text-gray-400 font-mono uppercase text-sm">FECHA</th>
              <th className="px-4 py-3 text-left text-gray-400 font-mono uppercase text-sm">TOTAL</th>
              <th className="px-4 py-3 text-left text-gray-400 font-mono uppercase text-sm">METODO</th>
              <th className="px-4 py-3 text-left text-gray-400 font-mono uppercase text-sm">ESTADO</th>
              <th className="px-4 py-3 text-center text-gray-400 font-mono uppercase text-sm">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {facturasFiltradas.map(factura => (
              <tr key={factura.id_factura} className="border-t border-gray-800 hover:bg-[#2d2d2d] transition-colors">
                <td className="px-4 py-3 font-medium text-white font-mono">{factura.numero_factura}</td>
                <td className="px-4 py-3 text-gray-400 font-mono">#{factura.id_orden}</td>
                <td className="px-4 py-3 text-gray-300 font-mono">
                  {factura.orden?.cliente.nombre} {factura.orden?.cliente.apellido}
                </td>
                <td className="px-4 py-3 text-gray-300 font-mono">
                  {factura.orden?.vehiculo.marca} {factura.orden?.vehiculo.modelo}
                  <br />
                  <span className="text-xs text-gray-500 font-mono">{factura.orden?.vehiculo.patente}</span>
                </td>
                <td className="px-4 py-3 text-gray-400 font-mono">{formatShortDate(factura.fecha_emision)}</td>
                <td className="px-4 py-3 font-semibold text-white font-mono">{factura.total != null && !isNaN(factura.total) ? formatCurrency(factura.total) : 'NO DEFINIDO'}</td>
                <td className="px-4 py-3 text-gray-400 font-mono">{factura.metodo_pago || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-mono uppercase ${getEstadoPagoBadge(factura.estado_pago)}`}>
                    {factura.estado_pago}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-center">
                    <Link
                      href={`/admin/facturas/${factura.id_factura}`}
                      className="bg-white text-black px-3 py-1.5 font-mono uppercase font-bold hover:bg-gray-200 transition-colors text-xs"
                    >
                      VER
                    </Link>
                    <Link
                      href={`/admin/ordenes/${factura.id_orden}`}
                      className="bg-[#2d2d2d] border border-gray-700 text-white px-3 py-1.5 font-mono uppercase font-bold hover:bg-[#3d3d3d] transition-colors text-xs"
                    >
                      ORDEN
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {facturasFiltradas.length === 0 && facturas.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400 font-mono uppercase">
                  NO HAY FACTURAS REGISTRADAS
                </td>
              </tr>
            )}
            {facturasFiltradas.length === 0 && facturas.length > 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400 font-mono uppercase">
                  NO SE ENCONTRARON FACTURAS CON LOS FILTROS APLICADOS
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
