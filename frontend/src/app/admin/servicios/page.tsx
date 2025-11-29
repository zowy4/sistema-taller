'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchServicios } from '@/services/servicios.service';
import { useServiciosMutations } from '@/hooks/useServiciosMutations';

// Utilidad de formateo de moneda
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

  // Búsqueda en tiempo real
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

  // Estadísticas
  const stats = useMemo(() => ({
    total: servicios.length,
    activos: servicios.filter(s => s.activo).length,
    inactivos: servicios.filter(s => !s.activo).length,
    precioPromedio: servicios.length > 0 
      ? servicios.reduce((sum, s) => sum + s.precio_base, 0) / servicios.length 
      : 0,
  }), [servicios]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header con Estadísticas */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Catálogo de Servicios</h2>
            <p className="text-gray-600 mt-1">Gestión de mano de obra y servicios</p>
          </div>
          <Link
            href="/admin/servicios/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-medium"
          >
            <span className="text-lg">➕</span>
            Nuevo Servicio
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Total Servicios</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <span className="text-2xl">💼</span>
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
                <p className="text-gray-500 text-sm">Precio Promedio</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(stats.precioPromedio)}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre, descripción o categoría..."
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

      {/* Lista de Servicios */}
      {!isLoading && (
        <div className="space-y-4">
          {filteredServicios.length > 0 ? (
            filteredServicios.map((servicio) => (
              <div
                key={servicio.id_servicio}
                className={`bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all border-l-4 ${
                  servicio.activo ? 'border-green-500' : 'border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {servicio.nombre}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          servicio.activo
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {servicio.activo ? 'Activo' : 'Inactivo'}
                      </span>
                      {servicio.categoria && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {servicio.categoria}
                        </span>
                      )}
                    </div>

                    {servicio.descripcion && (
                      <p className="text-gray-600 mb-3">{servicio.descripcion}</p>
                    )}

                    <div className="flex gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">💵</span>
                        <span className="font-medium text-gray-700">
                          Precio: {formatCurrency(servicio.precio_base)}
                        </span>
                      </div>
                      
                      {servicio.duracion_estimada && (
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600">⏱️</span>
                          <span className="text-gray-700">
                            Duración: {servicio.duracion_estimada} min
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleEstado(servicio.id_servicio, servicio.activo)}
                      className={`p-2 rounded-lg transition-colors ${
                        servicio.activo
                          ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                          : 'bg-green-100 hover:bg-green-200 text-green-600'
                      }`}
                      title={servicio.activo ? 'Desactivar' : 'Activar'}
                    >
                      <span className="text-lg">{servicio.activo ? '⏸️' : '▶️'}</span>
                    </button>

                    <Link
                      href={`/admin/servicios/${servicio.id_servicio}/edit`}
                      className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <span className="text-lg">✏️</span>
                    </Link>

                    <button
                      onClick={() => handleDelete(servicio.id_servicio, servicio.nombre)}
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

