'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

interface Servicio {
  id_servicio: number;
  nombre: string;
  descripcion?: string;
  precio_estandar: number;
  activo: boolean;
}

export default function ServiciosPage() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchServicios();
  }, []);

  const fetchServicios = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      const res = await fetch(`${API_URL}/servicios`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }
      if (!res.ok) throw new Error('Error al cargar servicios');
      const data = await res.json();
      setServicios(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id_servicio: number) => {
    if (!confirm('¿Seguro que deseas eliminar este servicio?')) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      const res = await fetch(`${API_URL}/servicios/${id_servicio}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Error al eliminar servicio');
      }
      setServicios(servicios.filter(s => s.id_servicio !== id_servicio));
      alert('Servicio eliminado');
    } catch (err: any) {
      setError(err.message || 'Error al eliminar servicio');
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Servicios</h2>
          <p className="text-gray-600 text-sm mt-1">
            {servicios.length} servicio{servicios.length !== 1 ? 's' : ''} registrados
          </p>
        </div>
        <Link
          href="/admin/servicios/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          + Nuevo Servicio
        </Link>
      </div>

      {loading && <p className="text-center py-8">Cargando servicios...</p>}
      {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>}

      {!loading && !error && (
        <div className="overflow-x-auto bg-gray-50 rounded shadow">
          <table className="min-w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Descripción</th>
                <th className="px-4 py-2 text-left">Precio estándar</th>
                <th className="px-4 py-2 text-left">Activo</th>
                <th className="px-4 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {servicios.map(s => (
                <tr key={s.id_servicio} className="border-t hover:bg-gray-100">
                  <td className="px-4 py-2 font-medium">{s.nombre}</td>
                  <td className="px-4 py-2">{s.descripcion || '-'}</td>
                  <td className="px-4 py-2">${s.precio_estandar.toFixed(2)}</td>
                  <td className="px-4 py-2">{s.activo ? 'Sí' : 'No'}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2 justify-center">
                      <Link
                        href={`/admin/servicios/${s.id_servicio}/edit`}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors text-sm"
                      >
                        ✏️ Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(s.id_servicio)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors text-sm"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {servicios.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    No hay servicios registrados.
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

