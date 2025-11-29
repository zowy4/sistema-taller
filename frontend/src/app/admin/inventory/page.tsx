'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchRepuestos, getStockStatus, calcularMargenGanancia } from '@/services/repuestos.service';
import { useRepuestosMutations } from '@/hooks/useRepuestosMutations';

// Utilidad de formateo de moneda
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

  // Búsqueda y filtros en tiempo real
  const filteredRepuestos = useMemo(() => {
    let filtered = repuestos;

    // Filtro de búsqueda
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(rep => 
        rep.nombre.toLowerCase().includes(search) ||
        rep.codigo.toLowerCase().includes(search) ||
        rep.descripcion?.toLowerCase().includes(search) ||
        rep.marca?.toLowerCase().includes(search)
      );
    }

    // Filtro de stock
    if (stockFilter !== 'todos') {
      filtered = filtered.filter(rep => {
        const status = getStockStatus(rep.stock_actual, rep.stock_minimo);
        return status === stockFilter;
      });
    }

    return filtered;
  }, [repuestos, searchTerm, stockFilter]);

  // Estadísticas
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
      return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">❌ Agotado</span>;
    }
    if (status === 'bajo') {
      return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">⚠️ Stock Bajo</span>;
    }
    return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">✅ Disponible</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header con Estadísticas */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Inventario de Repuestos</h2>
            <p className="text-gray-600 mt-1">Control de stock y gestión de piezas</p>
          </div>
          <Link
            href="/admin/inventory/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-medium"
          >
            <span className="text-lg">➕</span>
            Nuevo Repuesto
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Total</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <span className="text-2xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Disponible</p>
                <p className="text-2xl font-bold text-green-600">{stats.ok}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Stock Bajo</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.bajo}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Agotados</p>
                <p className="text-2xl font-bold text-red-600">{stats.agotado}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <span className="text-2xl">❌</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Valor Total</p>
                <p className="text-lg font-bold text-purple-600">
                  {formatCurrency(stats.valorTotal)}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
            <input
              type="text"
              placeholder="Buscar por nombre, código, marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtros de stock */}
          <div className="flex gap-2">
            {[
              { value: 'todos' as StockFilter, label: 'Todos', color: 'bg-gray-600' },
              { value: 'ok' as StockFilter, label: 'OK', color: 'bg-green-600' },
              { value: 'bajo' as StockFilter, label: 'Bajo', color: 'bg-yellow-600' },
              { value: 'agotado' as StockFilter, label: 'Agotado', color: 'bg-red-600' },
            ].map(filter => (
              <button
                key={filter.value}
                onClick={() => setStockFilter(filter.value)}
                className={`px-4 py-2 rounded-lg text-white transition-all ${
                  stockFilter === filter.value 
                    ? filter.color 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
              <div className="flex justify-between items-center">
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="flex gap-2">
                  <div className="w-20 h-9 bg-gray-200 rounded"></div>
                  <div className="w-20 h-9 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lista de Repuestos */}
      {!isLoading && (
        <div className="space-y-4">
          {filteredRepuestos.length > 0 ? (
            filteredRepuestos.map((repuesto) => {
              const margen = calcularMargenGanancia(repuesto.precio_compra, repuesto.precio_venta);
              
              return (
                <div
                  key={repuesto.id_repuesto}
                  className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-800">
                          {repuesto.nombre}
                        </h3>
                        {getStockBadge(repuesto.stock_actual, repuesto.stock_minimo)}
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-mono">
                          {repuesto.codigo}
                        </span>
                        {repuesto.marca && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                            {repuesto.marca}
                          </span>
                        )}
                      </div>

                      {repuesto.descripcion && (
                        <p className="text-gray-600 mb-3">{repuesto.descripcion}</p>
                      )}

                      <div className="grid grid-cols-4 gap-6 text-sm">
                        <div>
                          <p className="text-gray-500 mb-1">Stock Actual</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {repuesto.stock_actual}
                          </p>
                          <p className="text-xs text-gray-500">Mínimo: {repuesto.stock_minimo}</p>
                        </div>

                        <div>
                          <p className="text-gray-500 mb-1">Precio Compra</p>
                          <p className="font-semibold text-gray-700">
                            {formatCurrency(repuesto.precio_compra)}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-500 mb-1">Precio Venta</p>
                          <p className="font-semibold text-green-600">
                            {formatCurrency(repuesto.precio_venta)}
                          </p>
                        </div>

                        <div>
                          <p className="text-gray-500 mb-1">Margen</p>
                          <p className={`font-semibold ${margen > 30 ? 'text-green-600' : 'text-yellow-600'}`}>
                            {margen.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleAbrirAjuste(repuesto.id_repuesto)}
                        className="p-2 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-lg transition-colors"
                        title="Ajustar Stock"
                      >
                        <span className="text-lg">📦</span>
                      </button>

                      <Link
                        href={`/admin/inventory/${repuesto.id_repuesto}/edit`}
                        className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <span className="text-lg">✏️</span>
                      </Link>

                      <button
                        onClick={() => handleDelete(repuesto.id_repuesto, repuesto.nombre)}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <span className="text-lg">🗑️</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white p-12 rounded-lg shadow-sm text-center">
              <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                <span className="text-6xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
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

      {/* Modal de Ajuste de Stock */}
      {showAjusteModal && selectedRepuesto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Ajustar Stock</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad (+ entrada / - salida)
              </label>
              <input
                type="number"
                value={ajusteCantidad}
                onChange={(e) => setAjusteCantidad(e.target.value)}
                placeholder="Ej: +10 o -5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Usa números positivos para entrada, negativos para salida
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo (opcional)
              </label>
              <input
                type="text"
                value={ajusteMotivo}
                onChange={(e) => setAjusteMotivo(e.target.value)}
                placeholder="Ej: Compra a proveedor, Venta a cliente..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAjusteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAjustarStock}
                disabled={!ajusteCantidad || ajustarStockMutation.isPending}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

