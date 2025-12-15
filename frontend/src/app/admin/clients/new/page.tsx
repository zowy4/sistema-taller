"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    empresa: '',
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      const response = await fetch(`${API_URL}/clientes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el cliente');
      }
      router.push('/admin/clients');
    } catch (err: any) {
      setError(err.message || 'Error al crear el cliente');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#0f0f0f] p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/admin/clients" 
            className="text-gray-400 hover:text-white mb-4 inline-flex items-center font-mono uppercase text-sm"
          >
            ← VOLVER
          </Link>
          <h1 className="text-4xl font-bold text-white mt-4 font-mono uppercase">NUEVO CLIENTE</h1>
        </div>
        <div className="bg-[#1a1a1a] border border-gray-800 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-800 text-red-400 font-mono">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="nombre" className="block text-sm font-mono uppercase text-gray-400 mb-2">
                  NOMBRE <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  required
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#2d2d2d] border border-gray-700 text-white font-mono focus:outline-none focus:border-gray-500"
                />
              </div>
              <div>
                <label htmlFor="apellido" className="block text-sm font-mono uppercase text-gray-400 mb-2">
                  APELLIDO <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="apellido"
                  name="apellido"
                  required
                  value={formData.apellido}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#2d2d2d] border border-gray-700 text-white font-mono focus:outline-none focus:border-gray-500"
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-mono uppercase text-gray-400 mb-2">
                EMAIL <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#2d2d2d] border border-gray-700 text-white font-mono focus:outline-none focus:border-gray-500"
              />
            </div>
            <div>
              <label htmlFor="telefono" className="block text-sm font-mono uppercase text-gray-400 mb-2">
                TELEFONO <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                required
                value={formData.telefono}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#2d2d2d] border border-gray-700 text-white font-mono focus:outline-none focus:border-gray-500"
              />
            </div>
            <div>
              <label htmlFor="direccion" className="block text-sm font-mono uppercase text-gray-400 mb-2">
                DIRECCION <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                required
                value={formData.direccion}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#2d2d2d] border border-gray-700 text-white font-mono focus:outline-none focus:border-gray-500"
              />
            </div>
            <div>
              <label htmlFor="empresa" className="block text-sm font-mono uppercase text-gray-400 mb-2">
                EMPRESA (OPCIONAL)
              </label>
              <input
                type="text"
                id="empresa"
                name="empresa"
                value={formData.empresa}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#2d2d2d] border border-gray-700 text-white font-mono focus:outline-none focus:border-gray-500"
              />
            </div>
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-white text-black py-3 px-6 font-mono uppercase font-bold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'CREANDO...' : 'CREAR CLIENTE'}
              </button>
              <Link
                href="/admin/clients"
                className="flex-1 bg-[#2d2d2d] border border-gray-700 text-white py-3 px-6 font-mono uppercase font-bold hover:bg-[#3d3d3d] text-center transition-colors"
              >
                CANCELAR
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
