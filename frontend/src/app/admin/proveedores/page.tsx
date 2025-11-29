'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchProveedores } from '@/services/proveedores.service';
import { useProveedoresMutations } from '@/hooks/useProveedoresMutations';

export default function ProveedoresPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<'todos' | 'activos' | 'inactivos'>('todos');
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const { data: proveedores = [], isLoading } = useQuery({
    queryKey: ['proveedores'],
    queryFn: () => fetchProveedores(token || ''),
    enabled: !!token,
  });

  const { toggleEstadoMutation, deleteMutation } = useProveedoresMutations();

  // Búsqueda y filtros en tiempo real
  const filteredProveedores = useMemo(() => {
    let filtered = proveedores;

    // Filtro de búsqueda
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(prov => 
        prov.nombre.toLowerCase().includes(search) ||
        prov.empresa?.toLowerCase().includes(search) ||
        prov.email.toLowerCase().includes(search) ||
        prov.telefono.includes(search)
      );
    }

    // Filtro de estado
    if (filterEstado === 'activos') {
      filtered = filtered.filter(p => p.activo);
    } else if (filterEstado === 'inactivos') {
      filtered = filtered.filter(p => !p.activo);
    }

    return filtered;
  }, [proveedores, searchTerm, filterEstado]);

  // Estadísticas
  const stats = useMemo(() => ({
    total: proveedores.length,
    activos: proveedores.filter(p => p.activo).length,
    inactivos: proveedores.filter(p => !p.activo).length,
    totalCompras: proveedores.reduce((sum, p) => sum + (p._count?.compras || 0), 0),
  }), [proveedores]);

  const handleToggleEstado = (id: number, activo: boolean) => {
    toggleEstadoMutation.mutate({ id, activo: !activo });
  };

  const handleDelete = (id: number, nombre: string) => {
    if (confirm(`¿Estás seguro de eliminar "${nombre}"?\nEsta acción no se puede deshacer.`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header con Estadísticas */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Proveedores</h2>
            <p className="text-gray-600 mt-1">Gestión de proveedores y suministros</p>
          </div>
          <Link
            href="/admin/proveedores/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-medium"
          >
            <span className="text-lg">➕</span>
            Nuevo Proveedor
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Total Proveedores</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <span className="text-2xl">🏢</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Activos</p>
                <p className="text-2xl font-bold text-green-600">{stats.activos}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-gray-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Inactivos</p>
                <p className="text-2xl font-bold text-gray-600">{stats.inactivos}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-full">
                <span className="text-2xl">⏸️</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Total Compras</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalCompras}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <span className="text-2xl">📦</span>
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
              placeholder="Buscar por nombre, empresa, email o teléfono..."
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

          {/* Filtros de estado */}
          <div className="flex gap-2">
            {[
              { value: 'todos' as const, label: 'Todos', color: 'bg-gray-600' },
              { value: 'activos' as const, label: 'Activos', color: 'bg-green-600' },
              { value: 'inactivos' as const, label: 'Inactivos', color: 'bg-gray-400' },
            ].map(filter => (
              <button
                key={filter.value}
                onClick={() => setFilterEstado(filter.value)}
                className={`px-4 py-2 rounded-lg text-white transition-all ${
                  filterEstado === filter.value 
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

      {/* Lista de Proveedores */}
      {!isLoading && (
        <div className="space-y-4">
          {filteredProveedores.length > 0 ? (
            filteredProveedores.map((proveedor) => (
              <div
                key={proveedor.id_proveedor}
                className={`bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all border-l-4 ${
                  proveedor.activo ? 'border-green-500' : 'border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {proveedor.nombre}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          proveedor.activo
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {proveedor.activo ? 'Activo' : 'Inactivo'}
                      </span>
                      {proveedor.empresa && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {proveedor.empresa}
                        </span>
                      )}
                      {(proveedor._count?.compras || 0) > 0 && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          📦 {proveedor._count?.compras} compras
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">📧 Email</p>
                        <p className="text-gray-700">{proveedor.email}</p>
                      </div>

                      <div>
                        <p className="text-gray-500 mb-1">📞 Teléfono</p>
                        <p className="text-gray-700">{proveedor.telefono}</p>
                      </div>

                      {proveedor.direccion && (
                        <div>
                          <p className="text-gray-500 mb-1">📍 Dirección</p>
                          <p className="text-gray-700">{proveedor.direccion}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleToggleEstado(proveedor.id_proveedor, proveedor.activo)}
                      className={`p-2 rounded-lg transition-colors ${
                        proveedor.activo
                          ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                          : 'bg-green-100 hover:bg-green-200 text-green-600'
                      }`}
                      title={proveedor.activo ? 'Desactivar' : 'Activar'}
                    >
                      <span className="text-lg">{proveedor.activo ? '⏸️' : '▶️'}</span>
                    </button>

                    <Link
                      href={`/admin/proveedores/${proveedor.id_proveedor}/edit`}
                      className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <span className="text-lg">✏️</span>
                    </Link>

                    <button
                      onClick={() => handleDelete(proveedor.id_proveedor, proveedor.nombre)}
                      className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <span className="text-lg">🗑️</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-12 rounded-lg shadow-sm text-center">
              <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                <span className="text-6xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {searchTerm || filterEstado !== 'todos' 
                  ? 'No se encontraron proveedores' 
                  : 'No hay proveedores registrados'}
              </h3>
              <p className="text-gray-500">
                {searchTerm || filterEstado !== 'todos'
                  ? 'Intenta con otros términos o filtros' 
                  : 'Comienza agregando tu primer proveedor'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
