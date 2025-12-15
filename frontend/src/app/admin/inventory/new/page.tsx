"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import ErrorAlert from '@/components/ui/ErrorAlert';
export default function NewInventoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    unidad_medida: 'unidad',
    cantidad_existente: 0,
    precio_unitario: 0,
    nivel_minimo_alerta: 5
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/repuestos', formData);
      alert('Repuesto creado exitosamente');
      router.push('/admin/inventory');
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Error al crear el repuesto';
      setError(message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#0f0f0f] p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/inventory" className="text-gray-400 hover:text-white font-mono uppercase text-sm">
            ← VOLVER AL INVENTARIO
          </Link>
          <h2 className="text-4xl font-bold text-white font-mono uppercase mt-3">NUEVO REPUESTO</h2>
        </div>
        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-400 p-4 mb-8 font-mono">
            {error.toUpperCase()}
          </div>
        )}
        <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-gray-800 p-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="nombre" className="block text-sm font-mono uppercase text-gray-400 mb-2">
                NOMBRE <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#2d2d2d] border border-gray-700 text-white font-mono focus:outline-none focus:border-gray-500"
                placeholder="EJ: FILTRO DE ACEITE"
              />
            </div>
            <div>
              <label htmlFor="descripcion" className="block text-sm font-mono uppercase text-gray-400 mb-2">
                DESCRIPCION
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 bg-[#2d2d2d] border border-gray-700 text-white font-mono focus:outline-none focus:border-gray-500"
                placeholder="DESCRIPCION DETALLADA DEL REPUESTO..."
              />
            </div>
            <div>
              <label htmlFor="unidad_medida" className="block text-sm font-mono uppercase text-gray-400 mb-2">
                UNIDAD DE MEDIDA <span className="text-red-400">*</span>
              </label>
              <select
                id="unidad_medida"
                name="unidad_medida"
                required
                value={formData.unidad_medida}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#2d2d2d] border border-gray-700 text-white font-mono focus:outline-none focus:border-gray-500"
              >
                <option value="unidad">UNIDAD</option>
                <option value="litro">LITRO</option>
                <option value="kilogramo">KILOGRAMO</option>
                <option value="metro">METRO</option>
                <option value="caja">CAJA</option>
                <option value="set">SET</option>
                <option value="par">PAR</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="cantidad_existente" className="block text-sm font-mono uppercase text-gray-400 mb-2">
                  STOCK INICIAL <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  id="cantidad_existente"
                  name="cantidad_existente"
                  required
                  min="0"
                  step="1"
                  value={formData.cantidad_existente}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#2d2d2d] border border-gray-700 text-white font-mono focus:outline-none focus:border-gray-500"
                />
              </div>
              <div>
                <label htmlFor="precio_unitario" className="block text-sm font-mono uppercase text-gray-400 mb-2">
                  PRECIO UNITARIO <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  id="precio_unitario"
                  name="precio_unitario"
                  required
                  min="0"
                  step="0.01"
                  value={formData.precio_unitario}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#2d2d2d] border border-gray-700 text-white font-mono focus:outline-none focus:border-gray-500"
                />
              </div>
              <div>
                <label htmlFor="nivel_minimo_alerta" className="block text-sm font-mono uppercase text-gray-400 mb-2">
                  STOCK MINIMO <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  id="nivel_minimo_alerta"
                  name="nivel_minimo_alerta"
                  required
                  min="0"
                  step="1"
                  value={formData.nivel_minimo_alerta}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#2d2d2d] border border-gray-700 text-white font-mono focus:outline-none focus:border-gray-500"
                />
              </div>
            </div>
            <div className="bg-[#2d2d2d] border border-gray-700 p-4 text-sm text-gray-300 font-mono">
              <strong className="text-white uppercase">STOCK MINIMO:</strong> NIVEL DE ALERTA CUANDO EL STOCK ESTA BAJO. EL SISTEMA TE NOTIFICARA CUANDO LA CANTIDAD EXISTENTE SEA IGUAL O MENOR A ESTE VALOR.
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-white text-black px-6 py-3 font-mono uppercase font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'GUARDANDO...' : 'CREAR REPUESTO'}
            </button>
            <Link
              href="/admin/inventory"
              className="flex-1 bg-[#2d2d2d] border border-gray-700 text-white px-6 py-3 font-mono uppercase font-bold hover:bg-[#3d3d3d] transition-colors inline-block text-center"
            >
              CANCELAR
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
