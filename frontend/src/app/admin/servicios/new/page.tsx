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
          tiempo_estimado: 60, 
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
      alert('Servicio creado exitosamente');
      router.push('/admin/servicios');
    } catch (err: any) {
      setError(err.message || 'Error al crear servicio');
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#0f0f0f] p-8">
      <div className="max-w-xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/servicios" className="text-gray-400 hover:text-white font-mono uppercase text-sm">
            ← VOLVER
          </Link>
          <h2 className="text-4xl font-bold text-white mt-4 font-mono uppercase">NUEVO SERVICIO</h2>
        </div>
        {error && <div className="bg-red-900/20 border border-red-800 text-red-400 p-4 mb-6 font-mono">{error}</div>}
        <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-gray-800 p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-mono uppercase text-gray-400 mb-2">NOMBRE *</label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required className="w-full px-4 py-3 bg-[#2d2d2d] border border-gray-700 text-white font-mono focus:outline-none focus:border-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-mono uppercase text-gray-400 mb-2">DESCRIPCION</label>
              <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} className="w-full px-4 py-3 bg-[#2d2d2d] border border-gray-700 text-white font-mono focus:outline-none focus:border-gray-500" rows={3} />
            </div>
            <div>
              <label className="block text-sm font-mono uppercase text-gray-400 mb-2">PRECIO BASE *</label>
              <input type="number" value={precio} onChange={e => setPrecio(e.target.value)} required min="0" step="0.01" className="w-full px-4 py-3 bg-[#2d2d2d] border border-gray-700 text-white font-mono focus:outline-none focus:border-gray-500" />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={activo} onChange={e => setActivo(e.target.checked)} id="activo" className="w-5 h-5" />
              <label htmlFor="activo" className="text-sm font-mono uppercase text-gray-400">ACTIVO</label>
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            <button type="submit" disabled={saving} className="flex-1 bg-white text-black px-6 py-3 font-mono uppercase font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? 'GUARDANDO...' : 'CREAR SERVICIO'}
            </button>
            <Link href="/admin/servicios" className="flex-1 bg-[#2d2d2d] border border-gray-700 text-white px-6 py-3 font-mono uppercase font-bold hover:bg-[#3d3d3d] transition-colors text-center">CANCELAR</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
