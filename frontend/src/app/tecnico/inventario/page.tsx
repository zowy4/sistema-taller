'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

interface Repuesto {
  id_repuesto: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  stock_actual: number;
  stock_minimo: number;
  ubicacion?: string;
  categoria?: string;
}

export default function TecnicoInventarioPage() {
  const router = useRouter();
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroStock, setFiltroStock] = useState<'todos' | 'disponible' | 'bajo' | 'agotado'>('todos');

  useEffect(() => {
    fetchInventario();
  }, []);

  const fetchInventario = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${API_URL}/repuestos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Error al cargar inventario');
      }

      const data = await response.json();
      setRepuestos(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar inventario');
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (repuesto: Repuesto) => {
    if (repuesto.stock_actual === 0) return 'agotado';
    if (repuesto.stock_actual <= repuesto.stock_minimo) return 'bajo';
    return 'disponible';
  };

  const getStockColor = (status: string) => {
    switch (status) {
      case 'agotado':
        return 'bg-red-100 text-red-800';
      case 'bajo':
        return 'bg-yellow-100 text-yellow-800';
      case 'disponible':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockLabel = (status: string) => {
    switch (status) {
      case 'agotado':
        return 'Agotado';
      case 'bajo':
        return 'Stock Bajo';
      case 'disponible':
        return 'Disponible';
      default:
        return '';
    }
  };

  const repuestosFiltrados = repuestos.filter((repuesto) => {
    // Filtro de búsqueda
    const matchBusqueda = busqueda === '' ||
      repuesto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      repuesto.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      (repuesto.descripcion?.toLowerCase().includes(busqueda.toLowerCase())) ||
      (repuesto.categoria?.toLowerCase().includes(busqueda.toLowerCase()));

    // Filtro de stock
    const status = getStockStatus(repuesto);
    const matchStock = filtroStock === 'todos' || status === filtroStock;

    return matchBusqueda && matchStock;
  });

  const totalRepuestos = repuestos.length;
  const repuestosDisponibles = repuestos.filter(r => getStockStatus(r) === 'disponible').length;
  const repuestosStockBajo = repuestos.filter(r => getStockStatus(r) === 'bajo').length;
  const repuestosAgotados = repuestos.filter(r => getStockStatus(r) === 'agotado').length;

  if (loading) {
    return (
      <ProtectedRoute requiredRoles={['tecnico']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-600">Cargando inventario...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['tecnico']}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/tecnico"
              className="text-blue-600 hover:text-blue-800 font-medium mb-4 inline-block"
            >
              ← Volver a mis órdenes
            </Link>
            
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Inventario de Repuestos</h1>
                <p className="text-gray-600 mt-1">Vista de solo lectura - Consulta de disponibilidad</p>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-500 px-4 py-2">
                <p className="text-sm font-semibold text-blue-900">🔒 Solo Lectura</p>
                <p className="text-xs text-blue-700">No puedes modificar stock</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Repuestos</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{totalRepuestos}</p>
                </div>
                <div className="bg-gray-100 rounded-full p-3">
                  <span className="text-2xl">📦</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Disponibles</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{repuestosDisponibles}</p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">{repuestosStockBajo}</p>
                </div>
                <div className="bg-yellow-100 rounded-full p-3">
                  <span className="text-2xl">⚠️</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Agotados</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{repuestosAgotados}</p>
                </div>
                <div className="bg-red-100 rounded-full p-3">
                  <span className="text-2xl">🚫</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white shadow rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="busqueda" className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar
                </label>
                <input
                  id="busqueda"
                  type="text"
                  placeholder="Buscar por nombre, código, descripción o categoría..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="filtroStock" className="block text-sm font-medium text-gray-700 mb-2">
                  Estado de Stock
                </label>
                <select
                  id="filtroStock"
                  value={filtroStock}
                  onChange={(e) => setFiltroStock(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="disponible">✅ Disponible</option>
                  <option value="bajo">⚠️ Stock Bajo</option>
                  <option value="agotado">🚫 Agotado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabla de Inventario */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Repuesto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ubicación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Actual
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Mínimo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {repuestosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        {busqueda || filtroStock !== 'todos'
                          ? 'No se encontraron repuestos con los filtros seleccionados'
                          : 'No hay repuestos en el inventario'}
                      </td>
                    </tr>
                  ) : (
                    repuestosFiltrados.map((repuesto) => {
                      const status = getStockStatus(repuesto);
                      return (
                        <tr key={repuesto.id_repuesto} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-mono font-semibold text-gray-900">
                              {repuesto.codigo}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {repuesto.nombre}
                              </div>
                              {repuesto.descripcion && (
                                <div className="text-sm text-gray-500">
                                  {repuesto.descripcion}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">
                              {repuesto.categoria || '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">
                              {repuesto.ubicacion || '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-lg font-bold ${
                              status === 'agotado' ? 'text-red-600' :
                              status === 'bajo' ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {repuesto.stock_actual}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-500">
                              {repuesto.stock_minimo}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStockColor(status)}`}>
                              {getStockLabel(status)}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-blue-600 text-xl">ℹ️</span>
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  Información para Técnicos
                </p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Esta es una vista de <strong>solo lectura</strong>. No puedes modificar el stock.</li>
                  <li>• Consulta esta página para verificar disponibilidad de repuestos antes de iniciar trabajos.</li>
                  <li>• Si necesitas un repuesto con stock bajo o agotado, contacta a recepción o administración.</li>
                  <li>• Los repuestos con estado "Agotado" no pueden ser asignados a órdenes.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
