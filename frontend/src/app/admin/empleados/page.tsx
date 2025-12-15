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
  const { data: empleados = [], isLoading, isError, error } = useQuery({
    queryKey: ['empleados'],
    queryFn: fetchEmpleados,
    staleTime: 30000, 
    gcTime: 300000, 
  });
  const { eliminarEmpleado, toggleEstado } = useEmpleadosMutations();
  const empleadosFiltrados = useMemo(() => {
    return empleados.filter((emp) => {
      const matchBusqueda = busqueda.trim() === '' || 
        emp.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        emp.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
        emp.email.toLowerCase().includes(busqueda.toLowerCase()) ||
        emp.telefono.includes(busqueda);
      const matchEstado = filtroEstado === 'todos' || emp.estado === filtroEstado;
      return matchBusqueda && matchEstado;
    });
  }, [empleados, busqueda, filtroEstado]);
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
    <div className="min-h-screen bg-[#0f0f0f] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">GESTIÓN DE EMPLEADOS</h1>
            <p className="text-gray-400 mt-2">Administra los empleados del taller</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/admin"
              className="px-4 py-2 bg-[#1a1a1a] border border-gray-800 text-white hover:bg-[#2d2d2d] font-mono"
            >
              ← Volver
            </Link>
            <Link
              href="/admin/empleados/new"
              className="px-6 py-2 bg-gradient-to-r from-orange-600 to-orange-500 border border-orange-400/50 text-white hover:from-orange-500 hover:to-orange-400 transition-all font-black uppercase"
            >
              + Nuevo Empleado
            </Link>
          </div>
        </div>
        {}
        <div className="bg-[#1a1a1a] border border-gray-800 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
                Buscar empleado
              </label>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Nombre, email o teléfono..."
                className="w-full px-4 py-2 bg-[#2d2d2d] border border-gray-800 text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
                Filtrar por estado
              </label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value as typeof filtroEstado)}
                className="w-full px-4 py-2 bg-[#2d2d2d] border border-gray-800 text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="todos">Todos</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </select>
            </div>
          </div>
        </div>
        {}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-[#1a1a1a] border border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wide">Total Empleados</p>
                <p className="text-2xl font-black text-white font-mono">{empleados.length}</p>
              </div>

            </div>
          </div>
          <div className="bg-[#1a1a1a] border border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wide">Activos</p>
                <p className="text-2xl font-black text-green-500 font-mono">
                  {empleados.filter(e => e.estado === 'activo').length}
                </p>
              </div>

            </div>
          </div>
          <div className="bg-[#1a1a1a] border border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wide">Inactivos</p>
                <p className="text-2xl font-black text-red-500 font-mono">
                  {empleados.filter(e => e.estado === 'inactivo').length}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-[#1a1a1a] border border-gray-800 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#2d2d2d] border-b border-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-black text-white uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-black text-white uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-black text-white uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-black text-white uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-black text-white uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-6 py-3 text-left text-xs font-black text-white uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-black text-white uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
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
                  <tr key={empleado.id_empleado} className="hover:bg-[#2d2d2d]">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-orange-600/20 border border-orange-600 text-orange-500 px-2 py-1 text-xs font-mono">
                        #{empleado.id_empleado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-white">
                        {empleado.nombre} {empleado.apellido}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                      {empleado.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
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
                        Editar
                      </Link>
                      <button
                        onClick={() => handleToggleEstado(empleado.id_empleado, empleado.estado)}
                        className={empleado.estado === 'activo' ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'}
                      >
                        {empleado.estado === 'activo' ? 'Desactivar' : 'Activar'}
                      </button>
                      <button
                        onClick={() => handleDelete(empleado.id_empleado)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
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
              ”„ Limpiar filtros
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
