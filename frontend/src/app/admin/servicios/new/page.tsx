'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export default function NuevoServicioPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [activo, setActivo] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      const res = await fetch(`${API_URL}/servicios`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre,
          descripcion: descripcion || undefined,
          precio: parseFloat(precio),
          tiempo_estimado: 60, // Por defecto 60 minutos
          activo
        })
      });
      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Error al crear servicio');
      }
      alert('✅ Servicio creado');
      router.push('/admin/servicios');
    } catch (err: any) {
      setError(err.message || 'Error al crear servicio');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-xl mx-auto">
        <div className="mb-6">
          <Link href="/admin/servicios" className="text-blue-600 hover:underline text-sm">
            ← Volver a servicios
          </Link>
          <h2 className="text-2xl font-semibold mt-2">Nuevo Servicio</h2>
        </div>
        {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded shadow">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" rows={3} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Precio estándar *</label>
              <input type="number" value={precio} onChange={e => setPrecio(e.target.value)} required min="0" step="0.01" className="w-full border border-gray-300 rounded px-3 py-2" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={activo} onChange={e => setActivo(e.target.checked)} id="activo" />
              <label htmlFor="activo" className="text-sm">Activo</label>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? 'Guardando...' : 'Crear Servicio'}
            </button>
            <Link href="/admin/servicios" className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition-colors inline-block">Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
