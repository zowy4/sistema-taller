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
  const filteredProveedores = useMemo(() => {
    let filtered = proveedores;
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(prov => 
        prov.nombre.toLowerCase().includes(search) ||
        prov.empresa?.toLowerCase().includes(search) ||
        prov.email.toLowerCase().includes(search) ||
        prov.telefono.includes(search)
      );
    }
    if (filterEstado === 'activos') {
      filtered = filtered.filter(p => p.activo);
    } else if (filterEstado === 'inactivos') {
      filtered = filtered.filter(p => !p.activo);
    }
    return filtered;
  }, [proveedores, searchTerm, filterEstado]);
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
    <div className="min-h-screen bg-[#0f0f0f] p-6">
      {}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight uppercase">Proveedores</h2>
            <p className="text-gray-400 mt-1">Gestión de proveedores y suministros</p>
          </div>
          <Link
            href="/admin/proveedores/new"
            className="bg-gradient-to-r from-orange-600 to-orange-500 border border-orange-400/50 hover:from-orange-500 hover:to-orange-400 text-white px-6 py-3 transition-all flex items-center gap-2 font-black uppercase tracking-wide"
          >

            Nuevo Proveedor
          </Link>
        </div>
        {}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#1a1a1a] border border-gray-800 p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wide">Total Proveedores</p>
                <p className="text-2xl font-black text-white font-mono">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-[#1a1a1a] border border-gray-800 p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wide">Activos</p>
                <p className="text-2xl font-black text-green-500 font-mono">{stats.activos}</p>
              </div>

            </div>
          </div>
          <div className="bg-[#1a1a1a] border border-gray-800 p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wide">Inactivos</p>
                <p className="text-2xl font-black text-gray-500 font-mono">{stats.inactivos}</p>
              </div>

            </div>
          </div>
          <div className="bg-[#1a1a1a] border border-gray-800 p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wide">Total Compras</p>
                <p className="text-2xl font-black text-orange-500 font-mono">{stats.totalCompras}</p>
              </div>

            </div>
          </div>
        </div>
        {}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar por nombre, empresa, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-4 py-3 bg-[#1a1a1a] border border-gray-800 text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            />
          </div>
          {}
          <div className="flex gap-2">
            {[
              { value: 'todos' as const, label: 'Todos', color: 'bg-orange-600' },
              { value: 'activos' as const, label: 'Activos', color: 'bg-green-600' },
              { value: 'inactivos' as const, label: 'Inactivos', color: 'bg-gray-600' },
            ].map(filter => (
              <button
                key={filter.value}
                onClick={() => setFilterEstado(filter.value)}
                className={`px-4 py-2 text-white transition-all font-mono ${
                  filterEstado === filter.value 
                    ? filter.color 
                    : 'bg-[#1a1a1a] border border-gray-800 hover:bg-[#2d2d2d]'
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
          {filteredProveedores.length > 0 ? (
            filteredProveedores.map((proveedor) => (
              <div
                key={proveedor.id_proveedor}
                className="bg-[#1a1a1a] border border-gray-800 p-6 hover:bg-[#2d2d2d] transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">
                        {proveedor.nombre}
                      </h3>
                      <span
                        className={`px-3 py-1 text-xs font-medium uppercase tracking-wide ${
                          proveedor.activo
                            ? 'bg-green-600/20 border border-green-600 text-green-500'
                            : 'bg-gray-600/20 border border-gray-600 text-gray-500'
                        }`}
                      >
                        {proveedor.activo ? 'Activo' : 'Inactivo'}
                      </span>
                      {proveedor.empresa && (
                        <span className="px-3 py-1 bg-orange-600/20 border border-orange-600 text-orange-500 text-xs font-mono uppercase">
                          {proveedor.empresa}
                        </span>
                      )}
                      {(proveedor._count?.compras || 0) > 0 && (
                        <span className="px-3 py-1 bg-blue-600/20 border border-blue-600 text-blue-500 text-xs font-mono">
                          {proveedor._count?.compras} compras
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1 uppercase tracking-wide text-xs">Email</p>
                        <p className="text-gray-400 font-mono">{proveedor.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1 uppercase tracking-wide text-xs">Teléfono</p>
                        <p className="text-gray-400 font-mono">{proveedor.telefono}</p>
                      </div>
                      {proveedor.direccion && (
                        <div>
                          <p className="text-gray-500 mb-1 uppercase tracking-wide text-xs">Dirección</p>
                          <p className="text-gray-400">{proveedor.direccion}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleToggleEstado(proveedor.id_proveedor, proveedor.activo)}
                      className={`px-4 py-2 transition-colors font-mono text-sm ${
                        proveedor.activo
                          ? 'bg-gray-600/20 border border-gray-600 text-gray-500 hover:bg-gray-600/30'
                          : 'bg-green-600/20 border border-green-600 text-green-500 hover:bg-green-600/30'
                      }`}
                      title={proveedor.activo ? 'Desactivar' : 'Activar'}
                    >
                      {proveedor.activo ? 'Desactivar' : 'Activar'}
                    </button>
                    <Link
                      href={`/admin/proveedores/${proveedor.id_proveedor}/edit`}
                      className="px-4 py-2 bg-yellow-600/20 border border-yellow-600 text-yellow-500 hover:bg-yellow-600/30 transition-colors font-mono text-sm"
                      title="Editar"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(proveedor.id_proveedor, proveedor.nombre)}
                      className="px-4 py-2 bg-red-600/20 border border-red-600 text-red-500 hover:bg-red-600/30 transition-colors font-mono text-sm"
                      title="Eliminar"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-[#1a1a1a] border border-gray-800 p-12 text-center">
              <h3 className="text-xl font-black text-white mb-2 uppercase">
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
