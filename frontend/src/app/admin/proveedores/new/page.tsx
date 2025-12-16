'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
export default function NuevoProveedorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    telefono: '',
    email: '',
    direccion: '',
    activo: true,
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      const res = await fetch(`${API_URL}/proveedores`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Error al crear proveedor');
      }
      alert('✓ Proveedor creado exitosamente');
      router.push('/admin/proveedores');
    } catch (err: any) {
      setError(err.message || 'Error al crear proveedor');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#0f0f0f] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/admin/proveedores" 
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← Volver a proveedores
          </Link>
          <h1 className="text-3xl font-black text-white uppercase mt-4">Nuevo Proveedor</h1>
          <p className="text-gray-400 mt-1">Completa el formulario para registrar un nuevo proveedor</p>
        </div>
        {error && (
          <div className="bg-red-600/20 border border-red-600 text-red-500 p-4 mb-6 font-mono">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-gray-800 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">Nombre *</label>
              <input
                type="text"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                className="w-full bg-[#0f0f0f] border border-gray-800 text-white px-4 py-2 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">Empresa</label>
              <input
                type="text"
                name="empresa"
                value={formData.empresa}
                onChange={handleChange}
                className="w-full bg-[#0f0f0f] border border-gray-800 text-white px-4 py-2 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">Teléfono *</label>
              <input
                type="tel"
                name="telefono"
                required
                value={formData.telefono}
                onChange={handleChange}
                className="w-full bg-[#0f0f0f] border border-gray-800 text-white px-4 py-2 focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">Email *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-[#0f0f0f] border border-gray-800 text-white px-4 py-2 focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">Dirección</label>
              <textarea
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                rows={3}
                className="w-full bg-[#0f0f0f] border border-gray-800 text-white px-4 py-2 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="activo"
                  id="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                  className="w-5 h-5"
                />
                <span className="text-gray-400 text-sm font-bold uppercase">Proveedor Activo</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-800">
            <Link
              href="/admin/proveedores"
              className="px-6 py-2 border border-gray-700 text-gray-400 hover:bg-gray-800 transition-colors font-bold uppercase"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 font-bold uppercase disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Crear Proveedor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
