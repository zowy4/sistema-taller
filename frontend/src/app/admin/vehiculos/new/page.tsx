"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

interface Cliente {
  id_cliente: number;
  nombre: string;
  apellido: string;
}

export default function NuevoVehiculoPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    placa: '',
    vin: '',
    marca: '',
    modelo: '',
    anio: new Date().getFullYear(),
    id_cliente: 0,
    detalles: '',
  });

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      const res = await fetch(`${API_URL}/clientes`, {
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
      if (data && data.length > 0) {
        setForm(f => ({ ...f, id_cliente: data[0].id_cliente }));
        setError(null);
      } else {
        setError('No hay clientes registrados. Por favor, registre un cliente primero.');
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(f => ({
      ...f,
      [name]: (type === 'number' || name === 'id_cliente' || name === 'anio') ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    // Validación del cliente
    if (!form.id_cliente || form.id_cliente === 0) {
      setError('Debe seleccionar un cliente válido');
      setSaving(false);
      return;
    }
    
    // Validación del año
    if (form.anio < 1900 || form.anio > new Date().getFullYear() + 1) {
      setError('El año del vehículo no es válido');
      setSaving(false);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      // Asegurar que los campos numéricos sean números y limpiar campos opcionales vacíos
      const payload: Partial<{
        placa: string;
        vin: string;
        marca: string;
        modelo: string;
        anio: number;
        id_cliente: number;
        detalles?: string;
      }> = {
        placa: form.placa,
        vin: form.vin,
        marca: form.marca,
        modelo: form.modelo,
        anio: parseInt(String(form.anio)),
        id_cliente: parseInt(String(form.id_cliente))
      };
      
      // Solo incluir detalles si no está vacío
      if (form.detalles && form.detalles.trim()) {
        payload.detalles = form.detalles.trim();
      }
      
      const res = await fetch(`${API_URL}/vehiculos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }
      if (!res.ok) {
        const errData = await res.json();
        // Manejar errores de validación
        if (Array.isArray(errData.message)) {
          throw new Error(errData.message.join(', '));
        }
        throw new Error(errData.message || 'Error al crear vehículo');
      }
      alert('✅ Vehículo registrado');
      router.push('/admin/vehiculos');
    } catch (err: any) {
      setError(err.message || 'Error al crear vehículo');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/admin/vehiculos" className="text-blue-600 hover:underline text-sm">
            ← Volver a vehículos
          </Link>
          <h2 className="text-2xl font-semibold mt-2">Nuevo Vehículo</h2>
        </div>
        {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded shadow">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Placa *</label>
              <input type="text" name="placa" value={form.placa} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">VIN *</label>
              <input type="text" name="vin" value={form.vin} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Marca *</label>
                <input type="text" name="marca" value={form.marca} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Modelo *</label>
                <input type="text" name="modelo" value={form.modelo} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Año *</label>
                <input type="number" name="anio" value={form.anio} onChange={handleChange} required min="1900" max={new Date().getFullYear() + 1} className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cliente *</label>
              <select name="id_cliente" value={form.id_cliente} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2">
                <option value="0">-- Seleccione un cliente --</option>
                {clientes.map(c => (
                  <option key={c.id_cliente} value={c.id_cliente}>{c.nombre} {c.apellido}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Detalles (opcional)</label>
              <textarea name="detalles" value={form.detalles} onChange={(e) => setForm(f => ({ ...f, detalles: e.target.value }))} rows={3} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Información adicional del vehículo..."></textarea>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button type="submit" disabled={saving || clientes.length === 0} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? 'Guardando...' : 'Registrar Vehículo'}
            </button>
            <Link href="/admin/vehiculos" className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition-colors inline-block">Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
