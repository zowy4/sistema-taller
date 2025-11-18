'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

interface Proveedor {
  id_proveedor: number;
  nombre: string;
  empresa?: string;
  telefono: string;
  email: string;
  direccion?: string;
  activo: boolean;
  _count?: {
    compras: number;
  };
}

export default function ProveedoresPage() {
  const router = useRouter();
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch(`${API_URL}/proveedores`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      if (!res.ok) throw new Error('Error al cargar proveedores');

      const data = await res.json();
      setProveedores(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/proveedores/${id}/toggle-active`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Error al cambiar estado');

      fetchProveedores();
    } catch (err: any) {
      alert(err.message || 'Error al cambiar estado');
    }
  };

  const handleDelete = async (id: number, nombre: string) => {
    if (!confirm(`¿Eliminar proveedor ${nombre}? Esta acción no se puede deshacer.`)) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/proveedores/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Error al eliminar');
      }

      setProveedores(proveedores.filter(p => p.id_proveedor !== id));
      alert('Proveedor eliminado');
    } catch (err: any) {
      alert(err.message || 'Error al eliminar proveedor');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white p-6 flex items-center justify-center">
      <div className="text-gray-600">Cargando proveedores...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Proveedores</h2>
          <p className="text-gray-600 text-sm mt-1">
            {proveedores.length} proveedor{proveedores.length !== 1 ? 'es' : ''} registrados
          </p>
        </div>
        <Link
          href="/admin/proveedores/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          + Nuevo Proveedor
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>
      )}

      <div className="overflow-x-auto bg-gray-50 rounded shadow">
        <table className="min-w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">Nombre</th>
              <th className="px-4 py-2 text-left">Empresa</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Teléfono</th>
              <th className="px-4 py-2 text-left">Compras</th>
              <th className="px-4 py-2 text-left">Estado</th>
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedores.map(p => (
              <tr key={p.id_proveedor} className="border-t hover:bg-gray-100">
                <td className="px-4 py-2 font-medium">{p.nombre}</td>
                <td className="px-4 py-2 text-gray-600">{p.empresa || '-'}</td>
                <td className="px-4 py-2 text-gray-600">{p.email}</td>
                <td className="px-4 py-2 text-gray-600">{p.telefono}</td>
                <td className="px-4 py-2 text-center">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {p._count?.compras || 0}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => toggleActive(p.id_proveedor)}
                    className={`px-3 py-1 rounded text-sm ${
                      p.activo 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {p.activo ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="px-4 py-2 text-center">
                  <div className="flex gap-2 justify-center">
                    <Link
                      href={`/admin/proveedores/${p.id_proveedor}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Ver
                    </Link>
                    <Link
                      href={`/admin/proveedores/${p.id_proveedor}/edit`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(p.id_proveedor, p.nombre)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {proveedores.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No hay proveedores registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
