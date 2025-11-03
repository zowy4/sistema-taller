"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Cliente {
  id_cliente: number;
  nombre: string;
  apellido: string;
}

interface Vehiculo {
  id_vehiculo: number;
  placa: string;
  vin: string;
  marca: string;
  modelo: string;
  anio: number;
  id_cliente: number;
}

export default function EditarVehiculoPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVehiculo();
    fetchClientes();
  }, [params.id]);

  const fetchVehiculo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      const res = await fetch(`http://localhost:3002/vehiculos/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }
      if (!res.ok) throw new Error('Error al cargar vehículo');
      const data = await res.json();
      setVehiculo(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar vehículo');
    } finally {
      setLoading(false);
    }
  };

  const fetchClientes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      const res = await fetch('http://localhost:3002/clientes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }
      if (!res.ok) throw new Error('Error al cargar clientes');
      const data = await res.json();
      setClientes(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar clientes');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setVehiculo(v => v ? ({
      ...v,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }) : v);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehiculo) return;
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      const res = await fetch(`http://localhost:3002/vehiculos/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vehiculo)
      });
      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Error al actualizar vehículo');
      }
      alert('✅ Vehículo actualizado');
      router.push('/admin/vehiculos');
    } catch (err: any) {
      setError(err.message || 'Error al actualizar vehículo');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !vehiculo) {
    return <div className="min-h-screen bg-white p-6 flex items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/admin/vehiculos" className="text-blue-600 hover:underline text-sm">
            ← Volver a vehículos
          </Link>
          <h2 className="text-2xl font-semibold mt-2">Editar Vehículo</h2>
        </div>
        {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded shadow">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Placa *</label>
              <input type="text" name="placa" value={vehiculo.placa} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">VIN *</label>
              <input type="text" name="vin" value={vehiculo.vin} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Marca *</label>
                <input type="text" name="marca" value={vehiculo.marca} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Modelo *</label>
                <input type="text" name="modelo" value={vehiculo.modelo} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Año *</label>
                <input type="number" name="anio" value={vehiculo.anio} onChange={handleChange} required min="1900" max={new Date().getFullYear() + 1} className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cliente *</label>
              <select name="id_cliente" value={vehiculo.id_cliente} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2">
                {clientes.map(c => (
                  <option key={c.id_cliente} value={c.id_cliente}>{c.nombre} {c.apellido}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <Link href="/admin/vehiculos" className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition-colors inline-block">Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
