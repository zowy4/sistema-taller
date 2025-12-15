'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchServicios } from '@/services/servicios.service';
import { useServiciosMutations } from '@/hooks/useServiciosMutations';
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
export default function ServiciosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const { data: servicios = [], isLoading } = useQuery({
    queryKey: ['servicios'],
    queryFn: () => fetchServicios(token || ''),
    enabled: !!token,
  });
  const { toggleEstadoMutation, deleteMutation } = useServiciosMutations();
  const filteredServicios = useMemo(() => {
    if (!searchTerm.trim()) return servicios;
    const search = searchTerm.toLowerCase();
    return servicios.filter(servicio => 
      servicio.nombre.toLowerCase().includes(search) ||
      servicio.descripcion?.toLowerCase().includes(search) ||
      servicio.categoria?.toLowerCase().includes(search)
    );
  }, [servicios, searchTerm]);
  const handleToggleEstado = (id: number, activo: boolean) => {
    toggleEstadoMutation.mutate({ id, activo: !activo });
  };
  const handleDelete = (id: number, nombre: string) => {
    if (confirm(`¿Estás seguro de eliminar el servicio "${nombre}"?`)) {
      deleteMutation.mutate(id);
    }
  };
  const stats = useMemo(() => {
    const serviciosConPrecio = servicios.filter(s => s.precio_base != null && !isNaN(s.precio_base));
    return {
      total: servicios.length,
      activos: servicios.filter(s => s.activo).length,
      inactivos: servicios.filter(s => !s.activo).length,
      precioPromedio: serviciosConPrecio.length > 0 
        ? serviciosConPrecio.reduce((sum, s) => sum + s.precio_base, 0) / serviciosConPrecio.length 
        : 0,
    };
  }, [servicios]);
  return (
    <div className="min-h-screen bg-[#0f0f0f] p-6">
      {}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight uppercase">Catálogo de Servicios</h2>
            <p className="text-gray-400 mt-1">Gestión de mano de obra y servicios</p>
          </div>
          <Link
            href="/admin/servicios/new"
            className="bg-gradient-to-r from-orange-600 to-orange-500 border border-orange-400/50 hover:from-orange-500 hover:to-orange-400 text-white px-6 py-3 transition-all flex items-center gap-2 font-black uppercase tracking-wide"
          >
            Nuevo Servicio
          </Link>
        </div>
        {}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#1a1a1a] border border-gray-800 p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wide">Total Servicios</p>
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
                <p className="text-gray-400 text-sm uppercase tracking-wide">Precio Promedio</p>
                <p className="text-2xl font-black text-orange-500 font-mono">
                  {formatCurrency(stats.precioPromedio)}
                </p>
              </div>
            </div>
          </div>
        </div>
        {}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre, descripción o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-4 py-3 bg-[#1a1a1a] border border-gray-800 text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
          />
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
          {filteredServicios.length > 0 ? (
            filteredServicios.map((servicio) => (
              <div
                key={servicio.id_servicio}
                className="bg-[#1a1a1a] border border-gray-800 p-6 hover:bg-[#2d2d2d] transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">
                        {servicio.nombre}
                      </h3>
                      <span
                        className={`px-3 py-1 text-xs font-medium uppercase tracking-wide ${
                          servicio.activo
                            ? 'bg-green-600/20 border border-green-600 text-green-500'
                            : 'bg-gray-600/20 border border-gray-600 text-gray-500'
                        }`}
                      >
                        {servicio.activo ? 'Activo' : 'Inactivo'}
                      </span>
                      {servicio.categoria && (
                        <span className="px-3 py-1 bg-orange-600/20 border border-orange-600 text-orange-500 text-xs font-mono uppercase">
                          {servicio.categoria}
                        </span>
                      )}
                    </div>
                    {servicio.descripcion && (
                      <p className="text-gray-400 mb-3">{servicio.descripcion}</p>
                    )}
                    <div className="flex gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-white">
                          Precio: {servicio.precio_base != null && !isNaN(servicio.precio_base) ? formatCurrency(servicio.precio_base) : 'No definido'}
                        </span>
                      </div>
                      {servicio.duracion_estimada && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">
                            Duración: {servicio.duracion_estimada} min
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleEstado(servicio.id_servicio, servicio.activo)}
                      className={`p-2 transition-colors ${
                        servicio.activo
                          ? 'bg-gray-600/20 border border-gray-600 text-gray-500 hover:bg-gray-600/30'
                          : 'bg-green-600/20 border border-green-600 text-green-500 hover:bg-green-600/30'
                      }`}
                      title={servicio.activo ? 'Desactivar' : 'Activar'}
                    >
                      {servicio.activo ? 'Desactivar' : 'Activar'}
                    </button>
                    <Link
                      href={`/admin/servicios/${servicio.id_servicio}/edit`}
                      className="px-4 py-2 bg-yellow-600/20 border border-yellow-600 text-yellow-500 hover:bg-yellow-600/30 transition-colors font-mono text-sm"
                      title="Editar"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(servicio.id_servicio, servicio.nombre)}
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
                {searchTerm ? 'No se encontraron servicios' : 'No hay servicios registrados'}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda' 
                  : 'Comienza agregando tu primer servicio'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
