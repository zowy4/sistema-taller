'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchRepuestos, getStockStatus, calcularMargenGanancia } from '@/services/repuestos.service';
import { useRepuestosMutations } from '@/hooks/useRepuestosMutations';
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
type StockFilter = 'todos' | 'ok' | 'bajo' | 'agotado';
export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<StockFilter>('todos');
  const [showAjusteModal, setShowAjusteModal] = useState(false);
  const [selectedRepuesto, setSelectedRepuesto] = useState<number | null>(null);
  const [ajusteCantidad, setAjusteCantidad] = useState<string>('');
  const [ajusteMotivo, setAjusteMotivo] = useState('');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const { data: repuestos = [], isLoading } = useQuery({
    queryKey: ['repuestos'],
    queryFn: () => fetchRepuestos(token || ''),
    enabled: !!token,
  });
  const { ajustarStockMutation, deleteMutation } = useRepuestosMutations();
  const filteredRepuestos = useMemo(() => {
    let filtered = repuestos;
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(rep => 
        rep.nombre.toLowerCase().includes(search) ||
        rep.codigo.toLowerCase().includes(search) ||
        rep.descripcion?.toLowerCase().includes(search) ||
        rep.marca?.toLowerCase().includes(search)
      );
    }
    if (stockFilter !== 'todos') {
      filtered = filtered.filter(rep => {
        const status = getStockStatus(rep.stock_actual, rep.stock_minimo);
        return status === stockFilter;
      });
    }
    return filtered;
  }, [repuestos, searchTerm, stockFilter]);
  const stats = useMemo(() => ({
    total: repuestos.length,
    ok: repuestos.filter(r => getStockStatus(r.stock_actual, r.stock_minimo) === 'ok').length,
    bajo: repuestos.filter(r => getStockStatus(r.stock_actual, r.stock_minimo) === 'bajo').length,
    agotado: repuestos.filter(r => getStockStatus(r.stock_actual, r.stock_minimo) === 'agotado').length,
    valorTotal: repuestos.reduce((sum, r) => sum + (r.stock_actual * r.precio_compra), 0),
  }), [repuestos]);
  const handleAbrirAjuste = (idRepuesto: number) => {
    setSelectedRepuesto(idRepuesto);
    setAjusteCantidad('');
    setAjusteMotivo('');
    setShowAjusteModal(true);
  };
  const handleAjustarStock = () => {
    if (!selectedRepuesto || !ajusteCantidad) return;
    const cantidad = parseInt(ajusteCantidad);
    if (isNaN(cantidad) || cantidad === 0) return;
    ajustarStockMutation.mutate(
      { 
        id: selectedRepuesto, 
        ajuste: { 
          cantidad, 
          motivo: ajusteMotivo || (cantidad > 0 ? 'Entrada manual' : 'Salida manual')
        } 
      },
      {
        onSuccess: () => {
          setShowAjusteModal(false);
          setSelectedRepuesto(null);
          setAjusteCantidad('');
          setAjusteMotivo('');
        }
      }
    );
  };
  const handleDelete = (id: number, nombre: string) => {
    if (confirm(`¿Estás seguro de eliminar "${nombre}"?`)) {
      deleteMutation.mutate(id);
    }
  };
  const getStockBadge = (stockActual: number, stockMinimo: number) => {
    const status = getStockStatus(stockActual, stockMinimo);
    if (status === 'agotado') {
      return <span className="px-3 py-1 bg-red-600/20 border border-red-600 text-red-500 text-xs font-medium uppercase tracking-wide">Agotado</span>;
    }
    if (status === 'bajo') {
      return <span className="px-3 py-1 bg-yellow-600/20 border border-yellow-600 text-yellow-500 text-xs font-medium uppercase tracking-wide">Stock Bajo</span>;
    }
    return <span className="px-3 py-1 bg-green-600/20 border border-green-600 text-green-500 text-xs font-medium uppercase tracking-wide">Disponible</span>;
  };
  return (
    <div className="min-h-screen bg-[#0f0f0f] p-6">
      {}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight uppercase">Inventario de Repuestos</h2>
            <p className="text-gray-400 mt-1">Control de stock y gestión de piezas</p>
          </div>
          <Link
            href="/admin/inventory/new"
            className="bg-gradient-to-r from-orange-600 to-orange-500 border border-orange-400/50 hover:from-orange-500 hover:to-orange-400 text-white px-6 py-3 transition-all flex items-center gap-2 font-black uppercase tracking-wide"
          >
            Nuevo Repuesto
          </Link>
        </div>
        {}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-[#1a1a1a] border border-gray-800 p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wide">Total</p>
                <p className="text-2xl font-black text-white font-mono">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-[#1a1a1a] border border-gray-800 p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wide">Disponible</p>
                <p className="text-2xl font-black text-green-500 font-mono">{stats.ok}</p>
              </div>
            </div>
          </div>
          <div className="bg-[#1a1a1a] border border-gray-800 p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wide">Stock Bajo</p>
                <p className="text-2xl font-black text-yellow-500 font-mono">{stats.bajo}</p>
              </div>
            </div>
          </div>
          <div className="bg-[#1a1a1a] border border-gray-800 p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wide">Agotados</p>
                <p className="text-2xl font-black text-red-500 font-mono">{stats.agotado}</p>
              </div>
            </div>
          </div>
          <div className="bg-[#1a1a1a] border border-gray-800 p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wide">Valor Total</p>
                <p className="text-lg font-black text-orange-500 font-mono">
                  {formatCurrency(stats.valorTotal)}
                </p>
              </div>
            </div>
          </div>
        </div>
        {}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre, código, marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-4 py-3 bg-[#1a1a1a] border border-gray-800 text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            />

          </div>
          {}
          <div className="flex gap-2">
            {[
              { value: 'todos' as StockFilter, label: 'Todos', color: 'bg-orange-600 border border-orange-600' },
              { value: 'ok' as StockFilter, label: 'OK', color: 'bg-green-600/20 border border-green-600 text-green-500' },
              { value: 'bajo' as StockFilter, label: 'Bajo', color: 'bg-yellow-600/20 border border-yellow-600 text-yellow-500' },
              { value: 'agotado' as StockFilter, label: 'Agotado', color: 'bg-red-600/20 border border-red-600 text-red-500' },
            ].map(filter => (
              <button
                key={filter.value}
                onClick={() => setStockFilter(filter.value)}
                className={`px-4 py-2 font-mono uppercase tracking-wide text-sm transition-all ${
                  stockFilter === filter.value 
                    ? filter.color 
                    : 'bg-gray-800 border border-gray-700 text-gray-500 hover:bg-gray-700'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-[#1a1a1a] border border-gray-800 p-6 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-gray-800 w-1/3"></div>
                  <div className="h-4 bg-gray-800 w-1/2"></div>
                </div>
                <div className="flex gap-2">
                  <div className="w-20 h-9 bg-gray-800"></div>
                  <div className="w-20 h-9 bg-gray-800"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {}
      {!isLoading && (
        <div className="space-y-4">
          {filteredRepuestos.length > 0 ? (
            filteredRepuestos.map((repuesto) => {
              const margen = calcularMargenGanancia(repuesto.precio_compra, repuesto.precio_venta);
              return (
                <div
                  key={repuesto.id_repuesto}
                  className="bg-[#1a1a1a] border border-gray-800 p-6 hover:bg-[#2d2d2d] transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">
                          {repuesto.nombre}
                        </h3>
                        {getStockBadge(repuesto.stock_actual, repuesto.stock_minimo)}
                        <span className="px-3 py-1 bg-gray-600/20 border border-gray-600 text-gray-400 text-xs font-mono uppercase">
                          {repuesto.codigo}
                        </span>
                        {repuesto.marca && (
                          <span className="px-3 py-1 bg-orange-600/20 border border-orange-600 text-orange-500 text-xs font-mono uppercase">
                            {repuesto.marca}
                          </span>
                        )}
                      </div>
                      {repuesto.descripcion && (
                        <p className="text-gray-400 mb-3">{repuesto.descripcion}</p>
                      )}
                      <div className="grid grid-cols-4 gap-6 text-sm">
                        <div>
                          <p className="text-gray-500 mb-1 uppercase tracking-wide text-xs">Stock Actual</p>
                          <p className="text-2xl font-black text-white font-mono">
                            {repuesto.stock_actual}
                          </p>
                          <p className="text-xs text-gray-500">Mínimo: {repuesto.stock_minimo}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1 uppercase tracking-wide text-xs">Precio Compra</p>
                          <p className="font-mono font-black text-gray-400">
                            {formatCurrency(repuesto.precio_compra)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1 uppercase tracking-wide text-xs">Precio Venta</p>
                          <p className="font-mono font-black text-green-500">
                            {formatCurrency(repuesto.precio_venta)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 mb-1 uppercase tracking-wide text-xs">Margen</p>
                          <p className={`font-mono font-black ${margen > 30 ? 'text-green-500' : 'text-yellow-500'}`}>
                            {margen.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleAbrirAjuste(repuesto.id_repuesto)}
                        className="px-4 py-2 bg-orange-600/20 border border-orange-600 text-orange-500 hover:bg-orange-600/30 transition-colors font-mono text-sm"
                        title="Ajustar Stock"
                      >
                        Ajustar
                      </button>
                      <Link
                        href={`/admin/inventory/${repuesto.id_repuesto}/edit`}
                        className="px-4 py-2 bg-yellow-600/20 border border-yellow-600 text-yellow-500 hover:bg-yellow-600/30 transition-colors font-mono text-sm"
                        title="Editar"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(repuesto.id_repuesto, repuesto.nombre)}
                        className="px-4 py-2 bg-red-600/20 border border-red-600 text-red-500 hover:bg-red-600/30 transition-colors font-mono text-sm"
                        title="Eliminar"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-[#1a1a1a] border border-gray-800 p-12 text-center">
              <h3 className="text-xl font-black text-white mb-2 uppercase">
                {searchTerm || stockFilter !== 'todos' 
                  ? 'No se encontraron repuestos' 
                  : 'No hay repuestos registrados'}
              </h3>
              <p className="text-gray-500">
                {searchTerm || stockFilter !== 'todos'
                  ? 'Intenta con otros términos o filtros' 
                  : 'Comienza agregando tu primer repuesto'}
              </p>
            </div>
          )}
        </div>
      )}
      {}
      {showAjusteModal && selectedRepuesto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-gray-800 p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-black text-white uppercase mb-4">Ajustar Stock</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-white mb-2 uppercase tracking-wide">
                Cantidad (+ entrada / - salida)
              </label>
              <input
                type="number"
                value={ajusteCantidad}
                onChange={(e) => setAjusteCantidad(e.target.value)}
                placeholder="Ej: +10 o -5"
                className="w-full px-4 py-2 bg-[#0f0f0f] border border-gray-800 text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Usa números positivos para entrada, negativos para salida
              </p>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-white mb-2 uppercase tracking-wide">
                Motivo (opcional)
              </label>
              <input
                type="text"
                value={ajusteMotivo}
                onChange={(e) => setAjusteMotivo(e.target.value)}
                placeholder="Ej: Compra a proveedor, Venta a cliente..."
                className="w-full px-4 py-2 bg-[#0f0f0f] border border-gray-800 text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAjusteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700 transition-colors font-mono uppercase tracking-wide"
              >
                Cancelar
              </button>
              <button
                onClick={handleAjustarStock}
                disabled={!ajusteCantidad || ajustarStockMutation.isPending}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-500 border border-orange-400/50 text-white hover:from-orange-500 hover:to-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono uppercase tracking-wide"
              >
                {ajustarStockMutation.isPending ? 'Ajustando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
