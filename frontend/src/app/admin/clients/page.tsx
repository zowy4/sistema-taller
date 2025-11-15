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
    <div className="min-h-screen bg-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Listado de Clientes</h2>
        <Link
          href="/admin/clients/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          + Nuevo Cliente
        </Link>
      </div>

      {loading && <p> Cargando clientes… </p>}

      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto bg-gray-50 rounded shadow">
          <table className="min-w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Teléfono</th>
                <th className="px-4 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(c => (
                <tr key={c.id_cliente} className="border-t hover:bg-gray-100">
                  <td className="px-4 py-2">{c.id_cliente}</td>
                  <td className="px-4 py-2">{c.nombre} {c.apellido}</td>
                  <td className="px-4 py-2">{c.email}</td>
                  <td className="px-4 py-2">{c.telefono ?? '-'}</td>
                  <td className="px-4 py-2">
                    <div className="flex justify-center gap-2">
                      <Link
                        href={`/admin/clients/${c.id_cliente}/edit`}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors text-sm"
                      >
                        ✏️ Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(c.id_cliente, `${c.nombre} ${c.apellido}`)}
                        disabled={deleteLoading === c.id_cliente}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleteLoading === c.id_cliente ? '🔄' : '🗑️'} Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {clients.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    No se encontraron clientes. 
                    <Link href="/admin/clients/new" className="text-blue-600 hover:underline ml-2">
                      Crear el primero
                    </Link>
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

