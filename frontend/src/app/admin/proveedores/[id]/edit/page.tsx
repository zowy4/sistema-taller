'use client';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { fetchProveedorById } from '@/services/proveedores.service';
import { useProveedoresMutations } from '@/hooks/useProveedoresMutations';

export default function EditProveedorPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const { data: proveedor, isLoading } = useQuery({
    queryKey: ['proveedor', id],
    queryFn: () => fetchProveedorById(token || '', id),
    enabled: !!token && !!id,
  });

  const { updateMutation } = useProveedoresMutations();

  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    direccion: '',
    activo: true,
  });

  useEffect(() => {
    if (proveedor) {
      setFormData({
        nombre: proveedor.nombre,
        empresa: proveedor.empresa || '',
        email: proveedor.email,
        telefono: proveedor.telefono,
        direccion: proveedor.direccion || '',
        activo: proveedor.activo,
      });
    }
  }, [proveedor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ 
      id, 
      data: formData 
    }, {
      onSuccess: () => {
        router.push(`/admin/proveedores/${id}`);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  if (!proveedor) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-white">Proveedor no encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors mb-4"
          >
            ← Volver
          </button>
          <h1 className="text-3xl font-black text-white uppercase">Editar Proveedor</h1>
          <p className="text-gray-400 mt-1">Modifica la información del proveedor</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-gray-800 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full bg-[#0f0f0f] border border-gray-800 text-white px-4 py-2 focus:outline-none focus:border-orange-500"
                required
              />
            </div>

            {/* Empresa */}
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">
                Empresa
              </label>
              <input
                type="text"
                value={formData.empresa}
                onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                className="w-full bg-[#0f0f0f] border border-gray-800 text-white px-4 py-2 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#0f0f0f] border border-gray-800 text-white px-4 py-2 focus:outline-none focus:border-orange-500"
                required
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">
                Teléfono *
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full bg-[#0f0f0f] border border-gray-800 text-white px-4 py-2 focus:outline-none focus:border-orange-500"
                required
              />
            </div>

            {/* Dirección */}
            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm font-bold mb-2 uppercase">
                Dirección
              </label>
              <textarea
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                className="w-full bg-[#0f0f0f] border border-gray-800 text-white px-4 py-2 focus:outline-none focus:border-orange-500"
                rows={3}
              />
            </div>

            {/* Activo */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="text-gray-400 text-sm font-bold uppercase">
                  Proveedor Activo
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-800">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-700 text-gray-400 hover:bg-gray-800 transition-colors font-bold uppercase"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 font-bold uppercase disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
