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
        console.log('No token found, redirecting to login');
        router.push('/login');
        return;
      }
      console.log('Fetching vehiculos...');
      const res = await fetch(`${API_URL}/vehiculos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Response status:', res.status);
      if (res.status === 401) {
        console.log('Unauthorized, redirecting to login');
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error response:', errorText);
        throw new Error('Error al cargar vehículos: ' + errorText);
      }
      const data = await res.json();
      console.log('Vehiculos loaded:', data);
      setVehiculos(data);
      setError(null);
    } catch (err: any) {
      console.error('Error in fetchVehiculos:', err);
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
    <div className="min-h-screen bg-white p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Vehículos Registrados</h2>
          <p className="text-gray-600 text-sm mt-1">
            {vehiculos.length} vehículo{vehiculos.length !== 1 ? 's' : ''} en el sistema
          </p>
        </div>
        <Link
          href="/admin/vehiculos/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          + Nuevo Vehículo
        </Link>
      </div>

      {loading && <p className="text-center py-8">Cargando vehículos...</p>}
      {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>}

      {!loading && !error && (
        <div className="overflow-x-auto bg-gray-50 rounded shadow">
          <table className="min-w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-left">Placa</th>
                <th className="px-4 py-2 text-left">VIN</th>
                <th className="px-4 py-2 text-left">Marca</th>
                <th className="px-4 py-2 text-left">Modelo</th>
                <th className="px-4 py-2 text-left">Año</th>
                <th className="px-4 py-2 text-left">Cliente</th>
                <th className="px-4 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vehiculos.map(v => (
                <tr key={v.id_vehiculo} className="border-t hover:bg-gray-100">
                  <td className="px-4 py-2 font-medium">{v.placa}</td>
                  <td className="px-4 py-2">{v.vin}</td>
                  <td className="px-4 py-2">{v.marca}</td>
                  <td className="px-4 py-2">{v.modelo}</td>
                  <td className="px-4 py-2">{v.anio}</td>
                  <td className="px-4 py-2">{v.cliente?.nombre} {v.cliente?.apellido}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2 justify-center">
                      <Link
                        href={`/admin/vehiculos/${v.id_vehiculo}/edit`}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-colors text-sm"
                      >
                        ✏️ Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(v.id_vehiculo)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors text-sm"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {vehiculos.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                    No hay vehículos registrados.
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

