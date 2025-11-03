"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Repuesto {
  id_repuesto: number;
  nombre: string;
  descripcion?: string | null;
  unidad_medida: string;
  cantidad_existente: number;
  precio_unitario: number;
  nivel_minimo_alerta: number;
}

export default function InventoryPage() {
  const router = useRouter();
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'low-stock'>('all');

  useEffect(() => {
    fetchRepuestos();
  }, [router, filterType]);

  const fetchRepuestos = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const endpoint = filterType === 'low-stock' 
        ? 'http://localhost:3002/repuestos/stock-bajo'
        : 'http://localhost:3002/repuestos';

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      if (response.status === 403) {
        setError('No tienes permiso para ver el inventario.');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Error al cargar el inventario');
      }

      const data: Repuesto[] = await response.json();
      setRepuestos(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el inventario');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar el repuesto "${nombre}"?`)) {
      return;
    }

    setDeleteLoading(id);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`http://localhost:3002/repuestos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar el repuesto');
      }

      setRepuestos(prev => prev.filter(r => r.id_repuesto !== id));
    } catch (err: any) {
      alert(err.message || 'Error al eliminar el repuesto');
    } finally {
      setDeleteLoading(null);
    }
  };

  const getStockStatus = (repuesto: Repuesto) => {
    if (repuesto.cantidad_existente === 0) {
      return { color: 'bg-red-100 text-red-800', label: 'Sin stock', icon: '❌' };
    } else if (repuesto.cantidad_existente <= repuesto.nivel_minimo_alerta) {
      return { color: 'bg-yellow-100 text-yellow-800', label: 'Stock bajo', icon: '⚠️' };
    } else {
      return { color: 'bg-green-100 text-green-800', label: 'Stock OK', icon: '✅' };
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Inventario de Repuestos</h2>
          <p className="text-gray-600 text-sm mt-1">
            {repuestos.length} repuesto{repuestos.length !== 1 ? 's' : ''} en el inventario
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/inventory/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            + Nuevo Repuesto
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-md transition-colors ${
            filterType === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFilterType('low-stock')}
          className={`px-4 py-2 rounded-md transition-colors ${
            filterType === 'low-stock'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ⚠️ Stock Bajo
        </button>
      </div>

      {loading && <p className="text-center py-8">Cargando inventario...</p>}

      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto bg-gray-50 rounded shadow">
          <table className="min-w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Descripción</th>
                <th className="px-4 py-2 text-left">Stock</th>
                <th className="px-4 py-2 text-left">Unidad</th>
                <th className="px-4 py-2 text-left">Precio</th>
                <th className="px-4 py-2 text-left">Estado</th>
                <th className="px-4 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {repuestos.map(r => {
                const status = getStockStatus(r);
                return (
                  <tr key={r.id_repuesto} className="border-t hover:bg-gray-100">
                    <td className="px-4 py-2">{r.id_repuesto}</td>
                    <td className="px-4 py-2 font-medium">{r.nombre}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {r.descripcion || '-'}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`font-bold ${
                        r.cantidad_existente === 0 ? 'text-red-600' :
                        r.cantidad_existente <= r.nivel_minimo_alerta ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {r.cantidad_existente}
                      </span>
                      <span className="text-gray-500 text-sm ml-1">
                        (min: {r.nivel_minimo_alerta})
                      </span>
                    </td>
                    <td className="px-4 py-2">{r.unidad_medida}</td>
                    <td className="px-4 py-2">${r.precio_unitario.toFixed(2)}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.icon} {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex justify-center gap-2">
                        <Link
                          href={`/admin/inventory/${r.id_repuesto}/adjust`}
                          className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600 transition-colors text-sm"
                          title="Ajustar stock"
                        >
                          📦 Stock
                        </Link>
                        <Link
                          href={`/admin/inventory/${r.id_repuesto}/edit`}
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors text-sm"
                        >
                          ✏️ Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(r.id_repuesto, r.nombre)}
                          disabled={deleteLoading === r.id_repuesto}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deleteLoading === r.id_repuesto ? '🔄' : '🗑️'} Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {repuestos.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                    {filterType === 'low-stock' 
                      ? '✅ No hay repuestos con stock bajo'
                      : 'No se encontraron repuestos. '}
                    {filterType === 'all' && (
                      <Link href="/admin/inventory/new" className="text-blue-600 hover:underline ml-2">
                        Crear el primero
                      </Link>
                    )}
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
