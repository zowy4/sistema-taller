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

      alert('✅ Proveedor creado exitosamente');
      router.push('/admin/proveedores');
    } catch (err: any) {
      setError(err.message || 'Error al crear proveedor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/admin/proveedores" 
            className="text-blue-600 hover:underline text-sm"
          >
            ← Volver a proveedores
          </Link>
          <h2 className="text-2xl font-semibold mt-2">Nuevo Proveedor</h2>
        </div>

        {error && (
          <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded shadow">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <input
                type="text"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Empresa</label>
              <input
                type="text"
                name="empresa"
                value={formData.empresa}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono *</label>
                <input
                  type="tel"
                  name="telefono"
                  required
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Dirección</label>
              <textarea
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="activo"
                id="activo"
                checked={formData.activo}
                onChange={handleChange}
              />
              <label htmlFor="activo" className="text-sm">Activo</label>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : 'Crear Proveedor'}
            </button>
            <Link
              href="/admin/proveedores"
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition-colors inline-block"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
