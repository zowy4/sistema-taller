/**
 * EJEMPLO: Refactorización de Clientes con Tanstack Query
 * 
 * Este es un ejemplo de cómo refactorizar la página de clientes
 * siguiendo las mismas mejores prácticas del dashboard
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { 
  fetchClientes, 
  deleteCliente, 
  type Cliente 
} from '@/services/clientes.service';
import { useEffect } from 'react';

export default function ClientesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  const queryClient = useQueryClient();
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  /**
   * ✅ Query para obtener todos los clientes
   * - Se ejecuta automáticamente cuando el componente se monta
   * - Los datos se cachean con la key ['clientes']
   * - Si navegas a otra página y vuelves, los datos aparecen instantáneamente
   */
  const {
    data: clientes = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => fetchClientes(token!),
    enabled: !!token && !authLoading && !!user,
    retry: 1,
  });

  /**
   * ✅ Mutation para eliminar un cliente
   * - Optimistic updates: actualiza la UI antes de confirmar con el servidor
   * - Invalida el caché automáticamente para recargar la lista
   */
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCliente(token!, id),
    onSuccess: () => {
      // Invalida el caché de clientes para que se recargue
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      alert('Cliente eliminado exitosamente');
    },
    onError: (error: any) => {
      if (error.message === 'UNAUTHORIZED') {
        logout();
        router.push('/login');
      } else {
        alert(`Error al eliminar: ${error.message}`);
      }
    },
  });

  // Manejo de errores de autenticación
  useEffect(() => {
    if (error?.message === 'UNAUTHORIZED') {
      logout();
      router.push('/login');
    }
  }, [error, logout, router]);

  // ✅ Loading State con Skeleton
  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-10 bg-gray-200 rounded w-1/3 mb-6 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ✅ Error State
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-100 border border-red-300 text-red-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">⚠️ Error al cargar clientes</h2>
            <p className="mb-4">
              {error?.message === 'UNAUTHORIZED' 
                ? 'Tu sesión ha expirado. Redirigiendo al login...'
                : error?.message === 'FORBIDDEN'
                ? 'No tienes permisos para ver esta información.'
                : 'Hubo un problema al cargar los clientes.'}
            </p>
            <button
              onClick={() => refetch()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Vista Principal
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Clientes</h1>
          <Link
            href="/admin/clientes/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Nuevo Cliente
          </Link>
        </div>

        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Total Clientes</p>
            <p className="text-3xl font-bold text-gray-800">{clientes.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Clientes Activos</p>
            <p className="text-3xl font-bold text-green-600">
              {clientes.filter(c => c.activo).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Clientes Inactivos</p>
            <p className="text-3xl font-bold text-gray-400">
              {clientes.filter(c => !c.activo).length}
            </p>
          </div>
        </div>

        {/* Lista de Clientes */}
        {clientes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2">No hay clientes registrados</h3>
            <p className="text-gray-600 mb-4">Comienza agregando tu primer cliente</p>
            <Link
              href="/admin/clientes/new"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Agregar Cliente
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clientes.map((cliente: Cliente) => (
              <div key={cliente.id_cliente} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {cliente.nombre} {cliente.apellido}
                      </h3>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded ${
                          cliente.activo
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {cliente.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p>📧 {cliente.email}</p>
                    <p>📱 {cliente.telefono}</p>
                    {cliente.direccion && <p>📍 {cliente.direccion}</p>}
                    <p className="text-xs text-gray-400">
                      Registrado: {new Date(cliente.fecha_registro).toLocaleDateString('es-ES')}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/admin/clientes/${cliente.id_cliente}`}
                      className="flex-1 bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700 text-sm"
                    >
                      Ver Detalles
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar a ${cliente.nombre} ${cliente.apellido}?`)) {
                          deleteMutation.mutate(cliente.id_cliente);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="px-4 bg-red-600 text-white rounded hover:bg-red-700 text-sm disabled:opacity-50"
                    >
                      {deleteMutation.isPending ? '...' : '🗑️'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
