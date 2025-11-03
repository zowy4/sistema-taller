"use client";

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import Loader from '@/components/ui/Loader';
import ErrorAlert from '@/components/ui/ErrorAlert';

interface Repuesto {
  id_repuesto: number;
  nombre: string;
  descripcion?: string | null;
  unidad_medida: string;
  cantidad_existente: number;
  precio_unitario: number;
  nivel_minimo_alerta: number;
}

export default function EditInventoryPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repuesto, setRepuesto] = useState<Repuesto | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    unidad_medida: 'unidad',
    cantidad_existente: 0,
    precio_unitario: 0,
    nivel_minimo_alerta: 5
  });

  const fetchRepuestoData = useCallback(async () => {
    try {
      const data = await api.get<Repuesto>(`/repuestos/${params.id}`);
      setRepuesto(data);
      setFormData({
        nombre: data.nombre,
        descripcion: data.descripcion || '',
        unidad_medida: data.unidad_medida,
        cantidad_existente: data.cantidad_existente,
        precio_unitario: data.precio_unitario,
        nivel_minimo_alerta: data.nivel_minimo_alerta,
      });
      setError(null);
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Error al cargar el repuesto';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchRepuestoData();
  }, [fetchRepuestoData]);

  // old fetchRepuesto removed in favor of fetchRepuestoData

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await api.patch(`/repuestos/${params.id}`, formData);
      alert('✅ Repuesto actualizado exitosamente');
      router.push('/admin/inventory');
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Error al actualizar el repuesto';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <Loader text="Cargando repuesto..." />
      </div>
    );
  }

  if (error && !repuesto) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-2xl mx-auto">
          <Link href="/admin/inventory" className="text-blue-600 hover:underline text-sm">
            ← Volver al inventario
          </Link>
          <div className="bg-red-100 text-red-800 p-4 rounded mt-4">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/admin/inventory" className="text-blue-600 hover:underline text-sm">
            ← Volver al inventario
          </Link>
          <h2 className="text-2xl font-semibold mt-2">
            Editar Repuesto #{params.id}
          </h2>
          {repuesto && (
            <p className="text-gray-600 text-sm mt-1">
              Editando: <strong>{repuesto.nombre}</strong>
            </p>
          )}
        </div>

        <ErrorAlert message={error} onClose={() => setError(null)} />

        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded shadow">
          <div className="space-y-4">
            {/* Nombre */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Filtro de aceite"
              />
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium mb-1">
                Descripción
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción detallada del repuesto..."
              />
            </div>

            {/* Unidad de medida */}
            <div>
              <label htmlFor="unidad_medida" className="block text-sm font-medium mb-1">
                Unidad de Medida <span className="text-red-500">*</span>
              </label>
              <select
                id="unidad_medida"
                name="unidad_medida"
                required
                value={formData.unidad_medida}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="unidad">Unidad</option>
                <option value="litro">Litro</option>
                <option value="kilogramo">Kilogramo</option>
                <option value="metro">Metro</option>
                <option value="caja">Caja</option>
                <option value="set">Set</option>
                <option value="par">Par</option>
              </select>
            </div>

            {/* Grid con 3 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Cantidad existente */}
              <div>
                <label htmlFor="cantidad_existente" className="block text-sm font-medium mb-1">
                  Stock Actual <span className="text-red-500">*</span>
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
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Usa el botón "Ajustar Stock" para cambios frecuentes
                </p>
              </div>

              {/* Precio unitario */}
              <div>
                <label htmlFor="precio_unitario" className="block text-sm font-medium mb-1">
                  Precio Unitario <span className="text-red-500">*</span>
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
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Nivel mínimo de alerta */}
              <div>
                <label htmlFor="nivel_minimo_alerta" className="block text-sm font-medium mb-1">
                  Stock Mínimo <span className="text-red-500">*</span>
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
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-yellow-50 p-3 rounded text-sm text-yellow-800">
              ℹ️ <strong>Nota:</strong> Si solo necesitas ajustar el stock (entrada/salida de almacén), usa el botón "📦 Stock" en la tabla principal.
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '🔄 Guardando...' : '✅ Guardar Cambios'}
            </button>
            <Link
              href="/admin/inventory"
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition-colors inline-block"
            >
              Cancelar
            </Link>
            <Link
              href={`/admin/inventory/${params.id}/adjust`}
              className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition-colors inline-block ml-auto"
            >
              📦 Ajustar Stock
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
