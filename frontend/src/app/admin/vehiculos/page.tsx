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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-5xl font-bold text-gray-900 mb-2">Vehículos</h2>
            <p className="text-lg text-gray-600">
              {vehiculos.length} vehículo{vehiculos.length !== 1 ? 's' : ''} registrado{vehiculos.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link
            href="/admin/vehiculos/new"
            className="bg-gradient-to-br from-purple-600 to-purple-700 text-white px-8 py-4 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 font-semibold text-lg flex items-center gap-3"
          >
            <span className="text-2xl">🚗</span>
            Nuevo Vehículo
          </Link>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">⏳</div>
              <p className="text-xl text-gray-600">Cargando vehículos...</p>
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
                    <th className="px-8 py-5 text-left text-lg font-semibold">Placa</th>
                    <th className="px-8 py-5 text-left text-lg font-semibold">VIN</th>
                    <th className="px-8 py-5 text-left text-lg font-semibold">Marca</th>
                    <th className="px-8 py-5 text-left text-lg font-semibold">Modelo</th>
                    <th className="px-8 py-5 text-left text-lg font-semibold">Año</th>
                    <th className="px-8 py-5 text-left text-lg font-semibold">Propietario</th>
                    <th className="px-8 py-5 text-center text-lg font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {vehiculos.map((v, index) => (
                    <tr 
                      key={v.id_vehiculo} 
                      className={`border-b border-gray-200 hover:bg-purple-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-8 py-5">
                        <span className="inline-flex items-center bg-purple-100 text-purple-800 px-4 py-2 rounded-lg font-bold text-base">
                          {v.placa}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-base text-gray-700 font-mono">{v.vin}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-lg font-semibold text-gray-800">{v.marca}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-base text-gray-700">{v.modelo}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-base font-medium">
                          {v.anio}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-base font-bold">
                            {v.cliente?.nombre?.charAt(0)}{v.cliente?.apellido?.charAt(0)}
                          </div>
                          <span className="text-base text-gray-700">{v.cliente?.nombre} {v.cliente?.apellido}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex gap-3 justify-center">
                          <Link
                            href={`/admin/vehiculos/${v.id_vehiculo}/edit`}
                            className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 font-medium text-base flex items-center gap-2"
                          >
                            <span className="text-xl">✏️</span>
                            Editar
                          </Link>
                          <button
                            onClick={() => handleDelete(v.id_vehiculo)}
                            className="bg-gradient-to-br from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 font-medium text-base flex items-center gap-2"
                          >
                            <span className="text-xl">🗑️</span>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {vehiculos.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-8 py-20 text-center">
                        <div className="text-7xl mb-4">🚗</div>
                        <p className="text-2xl text-gray-600 mb-4">No hay vehículos registrados</p>
                        <Link 
                          href="/admin/vehiculos/new" 
                          className="inline-block text-purple-600 hover:text-purple-700 text-lg font-medium hover:underline"
                        >
                          Registrar el primer vehículo →
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

