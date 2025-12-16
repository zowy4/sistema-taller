'use client';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { fetchProveedorById } from '@/services/proveedores.service';

export default function ProveedorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const { data: proveedor, isLoading } = useQuery({
    queryKey: ['proveedor', id],
    queryFn: () => fetchProveedorById(token || '', id),
    enabled: !!token && !!id,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} de ${month} de ${year}`;
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
            <h1 className="text-3xl font-black text-white uppercase">{proveedor.nombre}</h1>
            {proveedor.empresa && (
              <p className="text-gray-400 mt-1">{proveedor.empresa}</p>
            )}
            <span className={`inline-block px-3 py-1 text-xs font-bold uppercase mt-2 ${
              proveedor.activo 
                ? 'bg-green-900/40 border border-green-700 text-green-400'
                : 'bg-gray-900/40 border border-gray-700 text-gray-400'
            }`}>
              {proveedor.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <Link
            href={`/admin/proveedores/${id}/edit`}
            className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2 font-bold uppercase"
          >
            Editar
          </Link>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Contact Info */}
        <div className="bg-[#1a1a1a] border border-gray-800 p-6">
          <h2 className="text-xl font-black text-white uppercase mb-4">Información de Contacto</h2>
          <div className="space-y-3">
            <div>
              <p className="text-gray-500 text-xs uppercase">Email</p>
              <p className="text-white font-mono">{proveedor.email}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase">Teléfono</p>
              <p className="text-white font-mono">{proveedor.telefono}</p>
            </div>
            {proveedor.direccion && (
              <div>
                <p className="text-gray-500 text-xs uppercase">Dirección</p>
                <p className="text-white">{proveedor.direccion}</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-[#1a1a1a] border border-gray-800 p-6">
          <h2 className="text-xl font-black text-white uppercase mb-4">Estadísticas</h2>
          <div className="space-y-3">
            <div>
              <p className="text-gray-500 text-xs uppercase">Total de Compras</p>
              <p className="text-2xl font-black text-orange-500 font-mono">
                {proveedor._count?.compras || 0}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs uppercase">Registrado</p>
              <p className="text-white" suppressHydrationWarning>
                {formatDate(proveedor.fecha_alta)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Purchases */}
      {proveedor.compras && proveedor.compras.length > 0 && (
        <div className="bg-[#1a1a1a] border border-gray-800 p-6">
          <h2 className="text-xl font-black text-white uppercase mb-4">Compras Recientes</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-gray-400 uppercase text-xs">ID</th>
                  <th className="text-left py-3 px-4 text-gray-400 uppercase text-xs">Fecha</th>
                  <th className="text-left py-3 px-4 text-gray-400 uppercase text-xs">Estado</th>
                  <th className="text-right py-3 px-4 text-gray-400 uppercase text-xs">Total</th>
                </tr>
              </thead>
              <tbody>
                {proveedor.compras.slice(0, 10).map((compra) => (
                  <tr key={compra.id_compra} className="border-b border-gray-800 hover:bg-[#2a2a2a]">
                    <td className="py-3 px-4 text-white font-mono">#{compra.id_compra}</td>
                    <td className="py-3 px-4 text-gray-400" suppressHydrationWarning>
                      {formatDate(compra.fecha_compra)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-bold uppercase ${
                        compra.estado === 'completada' 
                          ? 'bg-green-900/40 border border-green-700 text-green-400'
                          : 'bg-yellow-900/40 border border-yellow-700 text-yellow-400'
                      }`}>
                        {compra.estado}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-white font-mono">
                      {formatCurrency(compra.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
