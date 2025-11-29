"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchEmpleados, type Empleado } from '@/services/empleados.service';
import { useEmpleadosMutations } from '@/hooks/useEmpleadosMutations';
import Loader from '@/components/ui/Loader';
import ErrorAlert from '@/components/ui/ErrorAlert';

export default function EmpleadosPage() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activo' | 'inactivo'>('todos');

  // ==========================================
  // QUERY: Obtener empleados
  // ==========================================
  const { data: empleados = [], isLoading, isError, error } = useQuery({
    queryKey: ['empleados'],
    queryFn: fetchEmpleados,
    staleTime: 30000, // 30 segundos
    gcTime: 300000, // 5 minutos
  });

  // ==========================================
  // MUTATIONS: Acciones sobre empleados
  // ==========================================
  const { eliminarEmpleado, toggleEstado } = useEmpleadosMutations();

  // ==========================================
  // FILTROS Y BÚSQUEDA
  // ==========================================
  const empleadosFiltrados = useMemo(() => {
    return empleados.filter((emp) => {
      // Filtro de búsqueda
      const matchBusqueda = busqueda.trim() === '' || 
        emp.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        emp.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
        emp.email.toLowerCase().includes(busqueda.toLowerCase()) ||
        emp.telefono.includes(busqueda);

      // Filtro de estado
      const matchEstado = filtroEstado === 'todos' || emp.estado === filtroEstado;

      return matchBusqueda && matchEstado;
    });
  }, [empleados, busqueda, filtroEstado]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de eliminar este empleado? Esta acción no se puede deshacer.')) {
      eliminarEmpleado.mutate(id);
    }
  };

  const handleToggleEstado = (id: number, estadoActual: 'activo' | 'inactivo') => {
    const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';
    const accion = nuevoEstado === 'activo' ? 'activar' : 'desactivar';
    
    if (confirm(`¿Estás seguro de ${accion} este empleado?`)) {
      toggleEstado.mutate({ id, estado: nuevoEstado });
    }
  };

  // ==========================================
  // HELPERS
  // ==========================================
  const getCargoBadge = (cargo: string) => {
    const colors: Record<string, string> = {
      'Gerente': 'bg-purple-100 text-purple-800',
      'Supervisor': 'bg-blue-100 text-blue-800',
      'Mecánico': 'bg-green-100 text-green-800',
      'Técnico': 'bg-green-100 text-green-800',
      'Recepcionista': 'bg-yellow-100 text-yellow-800',
      'Administrativo': 'bg-gray-100 text-gray-800',
    };
    return colors[cargo] || 'bg-gray-100 text-gray-800';
  };

  const getEstadoBadge = (estado: string) => {
    return estado === 'activo' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const formatSalario = (salario: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(salario);
  };

  // ==========================================
  // ESTADOS DE CARGA Y ERROR
  // ==========================================
  if (isLoading) {
    return (
      <div className="min-h-screen p-8">
        <Loader text="Cargando empleados..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen p-8">
        <ErrorAlert 
          message={error instanceof Error ? error.message : 'Error al cargar empleados'} 
          onClose={() => {}} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">👥 Gestión de Empleados</h1>
            <p className="text-gray-600 mt-2">Administra los empleados del taller</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/admin"
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← Volver
            </Link>
            <Link
              href="/admin/empleados/new"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Nuevo Empleado
            </Link>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Buscar empleado
              </label>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Nombre, email o teléfono..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📊 Filtrar por estado
              </label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value as typeof filtroEstado)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="todos">Todos</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Empleados</p>
                <p className="text-2xl font-bold text-gray-900">{empleados.length}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Activos</p>
                <p className="text-2xl font-bold text-green-600">
                  {empleados.filter(e => e.estado === 'activo').length}
                </p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Inactivos</p>
                <p className="text-2xl font-bold text-red-600">
                  {empleados.filter(e => e.estado === 'inactivo').length}
                </p>
              </div>
              <div className="text-4xl">❌</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {empleadosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    {busqueda || filtroEstado !== 'todos' 
                      ? 'No se encontraron empleados con los filtros aplicados' 
                      : 'No hay empleados registrados'}
                  </td>
                </tr>
              ) : (
                empleadosFiltrados.map((empleado) => (
                  <tr key={empleado.id_empleado} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{empleado.id_empleado}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {empleado.nombre} {empleado.apellido}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {empleado.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {empleado.telefono}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCargoBadge(empleado.cargo)}`}>
                        {empleado.cargo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadge(empleado.estado)}`}>
                        {empleado.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link
                        href={`/admin/empleados/${empleado.id_empleado}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        ✏️ Editar
                      </Link>
                      <button
                        onClick={() => handleToggleEstado(empleado.id_empleado, empleado.estado)}
                        className={empleado.estado === 'activo' ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}
                      >
                        {empleado.estado === 'activo' ? '🔒 Desactivar' : '✅ Activar'}
                      </button>
                      <button
                        onClick={() => handleDelete(empleado.id_empleado)}
                        className="text-red-600 hover:text-red-900"
                      >
                        🗑️ Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-between items-center text-sm text-gray-600">
          <div>
            Mostrando {empleadosFiltrados.length} de {empleados.length} empleados
          </div>
          {(busqueda || filtroEstado !== 'todos') && (
            <button
              onClick={() => {
                setBusqueda('');
                setFiltroEstado('todos');
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              🔄 Limpiar filtros
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
