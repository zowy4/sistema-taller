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
    if (!confirm(`Estas seguro de eliminar al cliente ${clientName}?`)) {
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
    <div className="min-h-screen bg-[#0f0f0f] p-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-4xl font-black text-white mb-2 tracking-tight">CLIENTES</h2>
            <p className="text-sm text-gray-500 font-mono uppercase">[{clients.length}] Registros</p>
          </div>
          <Link
            href="/admin/clients/new"
            className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 py-3 hover:from-orange-700 hover:to-orange-600 transition-all font-black text-sm tracking-wide uppercase flex items-center gap-2 border border-orange-400/50 shadow-lg shadow-orange-500/20"
          >
            + NUEVO CLIENTE
          </Link>
        </div>
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="text-6xl mb-4 opacity-50">?</div>
              <p className="text-sm text-gray-500 font-mono uppercase">CARGANDO DATOS...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="bg-red-600/20 border border-red-600 text-red-400 p-6 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">??</span>
              <p className="text-sm font-mono">{error}</p>
            </div>
          </div>
        )}
        {!loading && !error && (
          <div className="bg-[#1a1a1a] border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-[#2d2d2d] border-b border-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-mono text-gray-500 uppercase tracking-wide">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-mono text-gray-500 uppercase tracking-wide">Nombre</th>
                    <th className="px-6 py-4 text-left text-xs font-mono text-gray-500 uppercase tracking-wide">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-mono text-gray-500 uppercase tracking-wide">Telefono</th>
                    <th className="px-6 py-4 text-center text-xs font-mono text-gray-500 uppercase tracking-wide">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {clients.map((c) => (
                    <tr 
                      key={c.id_cliente} 
                      className="hover:bg-[#2d2d2d] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center bg-orange-600/20 text-orange-500 w-10 h-10 font-mono font-bold text-sm border border-orange-600">
                          {c.id_cliente}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white w-10 h-10 flex items-center justify-center text-sm font-bold">
                            {c.nombre.charAt(0)}{c.apellido.charAt(0)}
                          </div>
                          <span className="text-sm font-bold text-white">{c.nombre} {c.apellido}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-400 font-mono">{c.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-400 font-mono">{c.telefono ?? '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <Link
                            href={`/admin/clients/${c.id_cliente}/edit`}
                            className="bg-yellow-600/20 border border-yellow-600 text-yellow-500 px-4 py-2 hover:bg-yellow-600/30 transition-all font-mono font-bold text-xs uppercase"
                          >
                            EDITAR
                          </Link>
                          <button
                            onClick={() => handleDelete(c.id_cliente, `${c.nombre} ${c.apellido}`)}
                            disabled={deleteLoading === c.id_cliente}
                            className="bg-red-600/20 border border-red-600 text-red-500 px-4 py-2 hover:bg-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-mono font-bold text-xs uppercase"
                          >
                            {deleteLoading === c.id_cliente ? 'BORRANDO...' : 'ELIMINAR'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {clients.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <div className="text-6xl mb-4 opacity-30">??</div>
                        <p className="text-lg text-gray-500 mb-4 font-mono uppercase">Sin clientes registrados</p>
                        <Link 
                          href="/admin/clients/new" 
                          className="inline-block text-orange-500 hover:text-orange-400 text-sm font-mono font-bold uppercase"
                        >
                          CREAR PRIMER CLIENTE ?
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
