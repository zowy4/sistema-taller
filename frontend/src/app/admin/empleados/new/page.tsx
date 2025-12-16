"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import ErrorAlert from '@/components/ui/ErrorAlert';
export default function NuevoEmpleadoPage() {
  const router = useRouter();
  type FormData = {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    telefono: string;
    direccion: string;
    rol: 'tecnico' | 'recepcionista' | 'supervisor' | 'admin';
    estado: 'activo' | 'inactivo';
  };
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: '',
    direccion: '',
    rol: 'tecnico',
    estado: 'activo',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.post('/admin/empleados', formData);
      alert('Empleado creado exitosamente');
      router.push('/admin/empleados');
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Error al crear empleado';
      setError(message);
    } finally {
      setSaving(false);
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  return (
    <div className="min-h-screen bg-[#0f0f0f] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link 
            href="/admin/empleados" 
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← Volver a empleados
          </Link>
          <h1 className="text-3xl font-black text-white uppercase mt-4">Nuevo Empleado</h1>
          <p className="text-gray-400 mt-1">Completa el formulario para registrar un nuevo empleado</p>
        </div>
        {error && (
          <div className="bg-red-600/20 border border-red-600 text-red-500 p-4 mb-6 font-mono">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-gray-800 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">
                Nombre *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="w-full bg-[#0f0f0f] border border-gray-800 text-white px-4 py-2 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">
                Apellido *
              </label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                required
                className="w-full bg-[#0f0f0f] border border-gray-800 text-white px-4 py-2 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-[#0f0f0f] border border-gray-800 text-white px-4 py-2 focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">
                Contraseña * (mínimo 6 caracteres)
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full bg-[#0f0f0f] border border-gray-800 text-white px-4 py-2 focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">
                Teléfono *
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
                className="w-full bg-[#0f0f0f] border border-gray-800 text-white px-4 py-2 focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">
                Dirección
              </label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                className="w-full bg-[#0f0f0f] border border-gray-800 text-white px-4 py-2 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">
                Rol *
              </label>
              <select
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                required
                className="w-full bg-[#0f0f0f] border border-gray-800 text-white px-4 py-2 focus:outline-none focus:border-orange-500 uppercase"
              >
                <option value="tecnico">Técnico</option>
                <option value="recepcionista">Recepcionista</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">
                Estado *
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                required
                className="w-full bg-[#0f0f0f] border border-gray-800 text-white px-4 py-2 focus:outline-none focus:border-orange-500 uppercase"
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-800">
            <Link
              href="/admin/empleados"
              className="px-6 py-2 border border-gray-700 text-gray-400 hover:bg-gray-800 transition-colors font-bold uppercase"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 font-bold uppercase disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Crear Empleado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
