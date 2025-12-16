'use client';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { fetchRepuestoById } from '@/services/repuestos.service';

export default function RepuestoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const { data: repuesto, isLoading } = useQuery({
    queryKey: ['repuesto', id],
    queryFn: () => fetchRepuestoById(token || '', id),
    enabled: !!token && !!id,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  if (!repuesto) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-white">Repuesto no encontrado</div>
      </div>
    );
  }

  const stockStatus = () => {
    if (repuesto.stock_actual === 0) return { text: 'SIN STOCK', color: 'text-red-500' };
    if (repuesto.stock_minimo && repuesto.stock_actual <= repuesto.stock_minimo) {
      return { text: 'STOCK BAJO', color: 'text-yellow-500' };
    }
    return { text: 'EN STOCK', color: 'text-green-500' };
  };

  const status = stockStatus();

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Volver
          </button>
        </div>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black text-white uppercase">{repuesto.nombre}</h1>
            {repuesto.codigo && (
              <p className="text-gray-400 font-mono mt-1">Código: {repuesto.codigo}</p>
            )}
            <span className={`inline-block px-3 py-1 text-xs font-bold uppercase mt-2 ${status.color} bg-gray-900/40 border border-gray-700`}>
              {status.text}
            </span>
          </div>
          <Link
            href={`/admin/inventory/${id}/edit`}
            className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 font-bold uppercase"
          >
            Editar
          </Link>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Stock Info */}
        <div className="bg-[#1a1a1a] border border-gray-800 p-6">
          <h2 className="text-xl font-black text-white uppercase mb-4">Stock</h2>
          <div className="space-y-3">
            <div>
              <p className="text-gray-500 text-xs uppercase">Stock Actual</p>
              <p className={`text-3xl font-black font-mono ${status.color}`}>
                {repuesto.stock_actual}
              </p>
            </div>
            {repuesto.stock_minimo !== null && (
              <div>
                <p className="text-gray-500 text-xs uppercase">Stock Mínimo</p>
                <p className="text-xl font-black text-gray-400 font-mono">
                  {repuesto.stock_minimo}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-[#1a1a1a] border border-gray-800 p-6">
          <h2 className="text-xl font-black text-white uppercase mb-4">Precios</h2>
          <div className="space-y-3">
            {repuesto.precio_venta !== null && (
              <div>
                <p className="text-gray-500 text-xs uppercase">Precio de Venta</p>
                <p className="text-2xl font-black text-green-500 font-mono">
                  {formatCurrency(repuesto.precio_venta)}
                </p>
              </div>
            )}
            {repuesto.precio_compra !== null && (
              <div>
                <p className="text-gray-500 text-xs uppercase">Precio de Compra</p>
                <p className="text-xl font-black text-orange-500 font-mono">
                  {formatCurrency(repuesto.precio_compra)}
                </p>
              </div>
            )}
            {repuesto.precio_venta !== null && repuesto.precio_compra !== null && (
              <div>
                <p className="text-gray-500 text-xs uppercase">Margen</p>
                <p className="text-xl font-black text-blue-500 font-mono">
                  {formatCurrency(repuesto.precio_venta - repuesto.precio_compra)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Category */}
        <div className="bg-[#1a1a1a] border border-gray-800 p-6">
          <h2 className="text-xl font-black text-white uppercase mb-4">Categoría</h2>
          <div className="space-y-3">
            <div>
              <p className="text-gray-500 text-xs uppercase">Nombre</p>
              <p className="text-white font-bold">
                {repuesto.categoria?.nombre || 'Sin categoría'}
              </p>
            </div>
            {repuesto.categoria?.descripcion && (
              <div>
                <p className="text-gray-500 text-xs uppercase">Descripción</p>
                <p className="text-gray-400 text-sm">
                  {repuesto.categoria.descripcion}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {repuesto.descripcion && (
        <div className="bg-[#1a1a1a] border border-gray-800 p-6">
          <h2 className="text-xl font-black text-white uppercase mb-4">Descripción</h2>
          <p className="text-gray-400">{repuesto.descripcion}</p>
        </div>
      )}
    </div>
  );
}
