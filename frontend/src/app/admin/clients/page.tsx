"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

interface Client {
  id_cliente: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string | null;
}

export default function AdminClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchClients = async () => {
      try {
        const res = await fetch(`${API_URL}/clientes`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('access_token');
          router.push('/login');
          return;
        }

        if (res.status === 403) {
          setError('No tienes permiso para ver esta página.');
          setLoading(false);
          return;
        }

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Error al obtener clientes');
        }

        const data: Client[] = await res.json();
        setClients(data);
        setError(null);
      } catch (err: any) {
        setError(err?.message || 'Error desconocido al cargar clientes');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [router]);

  const handleDelete = async (clientId: number, clientName: string) => {
    if (!confirm(`¿Estás seguro de eliminar al cliente ${clientName}?`)) {
      return;
    }

    setDeleteLoading(clientId);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${API_URL}/clientes/${clientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }
        throw new Error('Error al eliminar el cliente');
      }

      setClients(prev => prev.filter(c => c.id_cliente !== clientId));
    } catch (err: any) {
      alert(err.message || 'Error al eliminar el cliente');
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-5xl font-bold text-gray-900 mb-2">Clientes</h2>
            <p className="text-lg text-gray-600">{clients.length} clientes registrados</p>
          </div>
          <Link
            href="/admin/clients/new"
            className="bg-gradient-to-br from-blue-600 to-blue-700 text-white px-8 py-4 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-semibold text-lg flex items-center gap-3"
          >
            <span className="text-2xl">➕</span>
            Nuevo Cliente
          </Link>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">⏳</div>
              <p className="text-xl text-gray-600">Cargando clientes...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-2xl mb-6 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚠️</span>
              <p className="text-lg font-medium">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                  <tr>
                    <th className="px-8 py-5 text-left text-lg font-semibold">ID</th>
                    <th className="px-8 py-5 text-left text-lg font-semibold">Nombre Completo</th>
                    <th className="px-8 py-5 text-left text-lg font-semibold">Email</th>
                    <th className="px-8 py-5 text-left text-lg font-semibold">Teléfono</th>
                    <th className="px-8 py-5 text-center text-lg font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c, index) => (
                    <tr 
                      key={c.id_cliente} 
                      className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-8 py-5">
                        <span className="inline-flex items-center justify-center bg-blue-100 text-blue-800 w-12 h-12 rounded-full font-bold text-lg">
                          {c.id_cliente}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                            {c.nombre.charAt(0)}{c.apellido.charAt(0)}
                          </div>
                          <span className="text-lg font-semibold text-gray-800">{c.nombre} {c.apellido}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-base text-gray-700">{c.email}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-base text-gray-700">{c.telefono ?? '-'}</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex justify-center gap-3">
                          <Link
                            href={`/admin/clients/${c.id_cliente}/edit`}
                            className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 font-medium text-base flex items-center gap-2"
                          >
                            <span className="text-xl">✏️</span>
                            Editar
                          </Link>
                          <button
                            onClick={() => handleDelete(c.id_cliente, `${c.nombre} ${c.apellido}`)}
                            disabled={deleteLoading === c.id_cliente}
                            className="bg-gradient-to-br from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-base flex items-center gap-2"
                          >
                            <span className="text-xl">{deleteLoading === c.id_cliente ? '🔄' : '🗑️'}</span>
                            {deleteLoading === c.id_cliente ? 'Eliminando...' : 'Eliminar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {clients.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <div className="text-7xl mb-4">👥</div>
                        <p className="text-2xl text-gray-600 mb-4">No hay clientes registrados</p>
                        <Link 
                          href="/admin/clients/new" 
                          className="inline-block text-blue-600 hover:text-blue-700 text-lg font-medium hover:underline"
                        >
                          Crear el primer cliente →
                        </Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

