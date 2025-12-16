'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

interface Servicio {
  id_servicio: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  activo: boolean;
}

export default function EditarServicioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [servicio, setServicio] = useState<Servicio | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServicio();
  }, [id]);

  const fetchServicio = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      const res = await fetch(`${API_URL}/servicios/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }
      if (!res.ok) throw new Error('Error al cargar servicio');
      const data = await res.json();
      setServicio(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar servicio');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const name = (target as any).name as string;
    const type = (target as any).type as string | undefined;
    const valueStr = (target as any).value as string;
    const checked = (target as HTMLInputElement).checked ?? false;
    setServicio(s => s ? ({
      ...s,
      [name]: type === 'checkbox' ? checked : (name === 'precio' ? parseFloat(valueStr) || 0 : valueStr)
    }) : s);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!servicio) return;
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      const payload = {
        nombre: servicio.nombre,
        descripcion: servicio.descripcion || undefined,
        precio: servicio.precio,
        tiempo_estimado: 60,
        activo: servicio.activo
      };
      const res = await fetch(`${API_URL}/servicios/${id}`, {
        method: 'PATCH',
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
        throw new Error(errData.message || 'Error al actualizar servicio');
      }
      alert('✅ Servicio actualizado');
      router.push('/admin/servicios');
    } catch (err: any) {
      setError(err.message || 'Error al actualizar servicio');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !servicio) {
    return <div className="min-h-screen bg-white p-6 flex items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-xl mx-auto">
        <div className="mb-6">
          <Link href="/admin/servicios" className="text-blue-600 hover:underline text-sm">
            ← Volver a servicios
          </Link>
          <h2 className="text-2xl font-semibold mt-2">Editar Servicio</h2>
        </div>
        {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded shadow">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <input type="text" name="nombre" value={servicio.nombre} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <textarea name="descripcion" value={servicio.descripcion || ''} onChange={handleChange} className="w-full border border-gray-300 rounded px-3 py-2" rows={3} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Precio *</label>
              <input type="number" name="precio" value={servicio.precio || 0} onChange={handleChange} required min="0" step="0.01" className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="activo" checked={servicio.activo} onChange={handleChange} id="activo" />
              <label htmlFor="activo" className="text-sm">Activo</label>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <Link href="/admin/servicios" className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition-colors inline-block">Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
