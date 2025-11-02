"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchClients = async () => {
      try {
        const res = await fetch('http://localhost:3002/clientes', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.status === 401) {
          // Token inválido / expirado
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

  return (
    <div className="min-h-screen bg-white p-6">
      <h2 className="text-2xl font-semibold mb-4">Listado de Clientes</h2>

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
              </tr>
            </thead>
            <tbody>
              {clients.map(c => (
                <tr key={c.id_cliente} className="border-t">
                  <td className="px-4 py-2">{c.id_cliente}</td>
                  <td className="px-4 py-2">{c.nombre} {c.apellido}</td>
                  <td className="px-4 py-2">{c.email}</td>
                  <td className="px-4 py-2">{c.telefono ?? '-'}</td>
                </tr>
              ))}

              {clients.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500">No se encontraron clientes.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
