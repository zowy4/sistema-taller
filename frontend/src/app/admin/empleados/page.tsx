"use client";

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import Loader from '@/components/ui/Loader';
import ErrorAlert from '@/components/ui/ErrorAlert';

interface Empleado {
  id_empleado: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  rol: string;
  estado: string;
}

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmpleados = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get<Empleado[]>('/admin/empleados');
      setEmpleados(data);
      setError(null);
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Error al cargar empleados';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmpleados();
  }, [fetchEmpleados]);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de desactivar este empleado?')) return;

    try {
      await api.delete(`/admin/empleados/${id}`);

      alert('Empleado desactivado exitosamente');
      fetchEmpleados();
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Error al desactivar empleado';
      alert(message);
    }
  };

  const getRolBadge = (rol: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-800',
      supervisor: 'bg-blue-100 text-blue-800',
      tecnico: 'bg-green-100 text-green-800',
      recepcionista: 'bg-yellow-100 text-yellow-800',
    };
    return colors[rol] || 'bg-gray-100 text-gray-800';
  };

  const getEstadoBadge = (estado: string) => {
    return estado === 'activo' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <Loader text="Cargando empleados..." />
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

        <ErrorAlert message={error} onClose={() => setError(null)} />

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
                  Rol
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
              {empleados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No hay empleados registrados
                  </td>
                </tr>
              ) : (
                empleados.map((empleado) => (
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
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRolBadge(empleado.rol)}`}>
                        {empleado.rol}
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
                        onClick={() => handleDelete(empleado.id_empleado)}
                        className="text-red-600 hover:text-red-900"
                        disabled={empleado.estado === 'inactivo'}
                      >
                        Desactivar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-sm text-gray-600">
          Total de empleados: {empleados.length}
        </div>
      </div>
    </div>
  );
}
