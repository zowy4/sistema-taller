"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
interface Vehiculo {
  id_vehiculo: number;
  placa: string;
  vin: string;
  marca: string;
  modelo: string;
  anio: number;
  id_cliente: number;
  cliente: {
    id_cliente: number;
    nombre: string;
    apellido: string;
  };
}
export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    fetchVehiculos();
  }, []);
  const fetchVehiculos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      const res = await fetch(`${API_URL}/vehiculos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }
      if (!res.ok) {
        throw new Error('Error al cargar vehículos');
      }
      const data = await res.json();
      setVehiculos(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar vehículos');
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (id_vehiculo: number) => {
    if (!confirm('¿Seguro que deseas eliminar este vehículo? Esta acción no se puede deshacer.')) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      const res = await fetch(`${API_URL}/vehiculos/${id_vehiculo}`, {
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
        throw new Error(errData.message || 'Error al eliminar vehículo');
      }
      setVehiculos(vehiculos.filter(v => v.id_vehiculo !== id_vehiculo));
      alert('Vehículo eliminado');
    } catch (err: any) {
      setError(err.message || 'Error al eliminar vehículo');
    }
  };
  return (
    <div className="min-h-screen bg-[#0f0f0f] p-8">
      <div className="max-w-[1600px] mx-auto">
        {}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-5xl font-black text-white tracking-tight uppercase">Vehículos</h2>
            <p className="text-lg text-gray-400">
              {vehiculos.length} vehículo{vehiculos.length !== 1 ? 's' : ''} registrado{vehiculos.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link
            href="/admin/vehiculos/new"
            className="bg-gradient-to-r from-orange-600 to-orange-500 border border-orange-400/50 text-white px-8 py-4 hover:from-orange-500 hover:to-orange-400 transition-all font-black uppercase tracking-wide flex items-center gap-3"
          >
            Nuevo Vehículo
          </Link>
        </div>
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <p className="text-xl text-gray-400">Cargando vehículos...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="bg-red-600/20 border border-red-600 text-red-500 p-6 mb-6">
            <div className="flex items-center gap-3">
              <p className="text-lg font-medium">{error}</p>
            </div>
          </div>
        )}
        {!loading && !error && (
          <div className="bg-[#1a1a1a] border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-[#2d2d2d] border-b border-gray-800">
                  <tr>
                    <th className="px-8 py-5 text-left text-white font-black uppercase tracking-wide text-sm">Placa</th>
                    <th className="px-8 py-5 text-left text-white font-black uppercase tracking-wide text-sm">VIN</th>
                    <th className="px-8 py-5 text-left text-white font-black uppercase tracking-wide text-sm">Marca</th>
                    <th className="px-8 py-5 text-left text-white font-black uppercase tracking-wide text-sm">Modelo</th>
                    <th className="px-8 py-5 text-left text-white font-black uppercase tracking-wide text-sm">Año</th>
                    <th className="px-8 py-5 text-left text-white font-black uppercase tracking-wide text-sm">Propietario</th>
                    <th className="px-8 py-5 text-center text-white font-black uppercase tracking-wide text-sm">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {vehiculos.map((v, index) => (
                    <tr 
                      key={v.id_vehiculo} 
                      className="border-b border-gray-800 hover:bg-[#2d2d2d] transition-colors"
                    >
                      <td className="px-8 py-5">
                        <span className="inline-flex items-center bg-orange-600/20 border border-orange-600 text-orange-500 px-4 py-2 font-mono font-black text-base uppercase">
                          {v.placa}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-base text-gray-400 font-mono">{v.vin}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-lg font-black text-white">{v.marca}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-base text-gray-400">{v.modelo}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="inline-flex items-center bg-blue-600/20 border border-blue-600 text-blue-500 px-3 py-1 text-base font-mono">
                          {v.anio}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <div className="bg-green-600/20 border border-green-600 text-green-500 w-10 h-10 flex items-center justify-center text-base font-black">
                            {v.cliente?.nombre?.charAt(0)}{v.cliente?.apellido?.charAt(0)}
                          </div>
                          <span className="text-base text-white">{v.cliente?.nombre} {v.cliente?.apellido}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex gap-3 justify-center">
                          <Link
                            href={`/admin/vehiculos/${v.id_vehiculo}/edit`}
                            className="bg-yellow-600/20 border border-yellow-600 text-yellow-500 px-6 py-3 hover:bg-yellow-600/30 transition-all font-mono text-base flex items-center gap-2"
                          >
                            Editar
                          </Link>
                          <button
                            onClick={() => handleDelete(v.id_vehiculo)}
                            className="bg-red-600/20 border border-red-600 text-red-500 px-6 py-3 hover:bg-red-600/30 transition-all font-mono text-base flex items-center gap-2"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {vehiculos.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-8 py-20 text-center">
                        <p className="text-2xl text-gray-500 mb-4">No hay vehículos registrados</p>
                        <Link 
                          href="/admin/vehiculos/new" 
                          className="inline-block text-orange-500 hover:text-orange-400 text-lg font-medium hover:underline"
                        >
                          Registrar el primer vehículo
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
