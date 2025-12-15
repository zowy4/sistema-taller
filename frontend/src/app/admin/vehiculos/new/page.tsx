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
    if (!form.id_cliente || form.id_cliente === 0) {
      setError('Debe seleccionar un cliente valido');
      setSaving(false);
      return;
    }
    if (form.anio < 1900 || form.anio > new Date().getFullYear() + 1) {
      setError('El año del vehiculo no es valido');
      setSaving(false);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
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
        if (Array.isArray(errData.message)) {
          throw new Error(errData.message.join(', '));
        }
        throw new Error(errData.message || 'Error al crear vehiculo');
      }
      alert('Vehiculo registrado exitosamente');
      router.push('/admin/vehiculos');
    } catch (err: any) {
      setError(err.message || 'Error al crear vehículo');
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#0f0f0f] p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/vehiculos" className="text-gray-400 hover:text-white font-mono uppercase text-sm">
            ← VOLVER
          </Link>
          <h2 className="text-4xl font-bold text-white mt-4 font-mono uppercase">NUEVO VEHICULO</h2>
        </div>
        {error && <div className="bg-red-900/20 border border-red-800 text-red-400 p-4 mb-6 font-mono">{error}</div>}
        <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-gray-800 p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-mono uppercase text-gray-400 mb-2">PLACA *</label>
              <input type="text" name="placa" value={form.placa} onChange={handleChange} required className="w-full px-4 py-3 bg-[#2d2d2d] border border-gray-700 text-white font-mono focus:outline-none focus:border-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-mono uppercase text-gray-400 mb-2">VIN *</label>
              <input type="text" name="vin" value={form.vin} onChange={handleChange} required className="w-full px-4 py-3 bg-[#2d2d2d] border border-gray-700 text-white font-mono focus:outline-none focus:border-gray-500" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-mono uppercase text-gray-400 mb-2">MARCA *</label>
                <input type="text" name="marca" value={form.marca} onChange={handleChange} required className="w-full px-4 py-3 bg-[#2d2d2d] border border-gray-700 text-white font-mono focus:outline-none focus:border-gray-500" />
              </div>
              <div>
                <label className="block text-sm font-mono uppercase text-gray-400 mb-2">MODELO *</label>
                <input type="text" name="modelo" value={form.modelo} onChange={handleChange} required className="w-full px-4 py-3 bg-[#2d2d2d] border border-gray-700 text-white font-mono focus:outline-none focus:border-gray-500" />
              </div>
              <div>
                <label className="block text-sm font-mono uppercase text-gray-400 mb-2">AÑO *</label>
                <input type="number" name="anio" value={form.anio} onChange={handleChange} required min="1900" max={new Date().getFullYear() + 1} className="w-full px-4 py-3 bg-[#2d2d2d] border border-gray-700 text-white font-mono focus:outline-none focus:border-gray-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-mono uppercase text-gray-400 mb-2">CLIENTE *</label>
              <select name="id_cliente" value={form.id_cliente} onChange={handleChange} required className="w-full px-4 py-3 bg-[#2d2d2d] border border-gray-700 text-white font-mono focus:outline-none focus:border-gray-500">
                <option value="0">-- SELECCIONE UN CLIENTE --</option>
                {clientes.map(c => (
                  <option key={c.id_cliente} value={c.id_cliente}>{c.nombre} {c.apellido}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-mono uppercase text-gray-400 mb-2">DETALLES (OPCIONAL)</label>
              <textarea name="detalles" value={form.detalles} onChange={(e) => setForm(f => ({ ...f, detalles: e.target.value }))} rows={3} className="w-full px-4 py-3 bg-[#2d2d2d] border border-gray-700 text-white font-mono focus:outline-none focus:border-gray-500" placeholder="INFORMACION ADICIONAL DEL VEHICULO..."></textarea>
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            <button type="submit" disabled={saving || clientes.length === 0} className="flex-1 bg-white text-black px-6 py-3 font-mono uppercase font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? 'GUARDANDO...' : 'REGISTRAR VEHICULO'}
            </button>
            <Link href="/admin/vehiculos" className="flex-1 bg-[#2d2d2d] border border-gray-700 text-white px-6 py-3 font-mono uppercase font-bold hover:bg-[#3d3d3d] transition-colors text-center">CANCELAR</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
