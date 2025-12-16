'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

interface CompraDetalle {
  id_compra: number;
  fecha_compra: string;
  total: number;
  estado: string;
  notas?: string;
  proveedor: {
    id_proveedor: number;
    nombre: string;
    empresa?: string;
    telefono: string;
    email: string;
  };
  compras_repuestos: Array<{
    id: number;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    repuesto: {
      id_repuesto: number;
      nombre: string;
      categoria: string;
      cantidad_existente: number;
    };
  }>;
}

export default function CompraDetallePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [compra, setCompra] = useState<CompraDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) fetchCompra();
  }, [id]);

  const fetchCompra = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch(`${API_URL}/compras/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      if (res.status === 404) {
        setError('Compra no encontrada');
        return;
      }

      if (!res.ok) throw new Error('Error al cargar compra');

      const data = await res.json();
      setCompra(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar compra');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Está seguro de eliminar esta compra? El stock de los repuestos será decrementado.')) {
      return;
    }

    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/compras/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al eliminar compra');
      }

      alert('Compra eliminada exitosamente. El stock ha sido ajustado.');
      router.push('/admin/compras');
    } catch (err: any) {
      alert(err.message || 'Error al eliminar compra');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day} de ${month} de ${year}, ${hours}:${minutes}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getEstadoBadgeClass = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'completada':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white p-6 flex items-center justify-center">
      <div className="text-gray-600">Cargando...</div>
    </div>
  );

  if (error || !compra) return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin/compras" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Volver a compras
        </Link>
        <div className="bg-red-100 text-red-800 p-4 rounded">
          {error || 'Compra no encontrada'}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link href="/admin/compras" className="text-blue-600 hover:underline">
            ← Volver a compras
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400"
          >
            {deleting ? 'Eliminando...' : '🗑️ Eliminar Compra'}
          </button>
        </div>

        <div className="bg-gray-50 rounded shadow p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold">Compra #{compra.id_compra}</h2>
                <span className={`px-3 py-1 rounded text-sm ${getEstadoBadgeClass(compra.estado)}`}>
                  {compra.estado}
                </span>
              </div>
              <p className="text-gray-500 mt-2" suppressHydrationWarning>{formatDate(compra.fecha_compra)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-4xl font-bold text-green-600">
                {formatCurrency(compra.total)}
              </p>
            </div>
          </div>

          <div className="border-t pt-6 mb-6">
            <h3 className="text-lg font-semibold mb-3">Información del Proveedor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nombre</p>
                <p className="font-medium">{compra.proveedor.nombre}</p>
              </div>
              {compra.proveedor.empresa && (
                <div>
                  <p className="text-sm text-gray-600">Empresa</p>
                  <p className="font-medium">{compra.proveedor.empresa}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{compra.proveedor.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Teléfono</p>
                <p className="font-medium">{compra.proveedor.telefono}</p>
              </div>
            </div>
            <Link
              href={`/admin/proveedores/${compra.proveedor.id_proveedor}`}
              className="text-blue-600 hover:underline text-sm mt-3 inline-block"
            >
              Ver detalles del proveedor →
            </Link>
          </div>

          {compra.notas && (
            <div className="border-t pt-6 mb-6">
              <h3 className="text-lg font-semibold mb-2">Notas</h3>
              <p className="text-gray-700 italic">{compra.notas}</p>
            </div>
          )}

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Repuestos Comprados</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Repuesto</th>
                    <th className="px-4 py-2 text-left">Categoría</th>
                    <th className="px-4 py-2 text-right">Cantidad</th>
                    <th className="px-4 py-2 text-right">Precio Unit.</th>
                    <th className="px-4 py-2 text-right">Subtotal</th>
                    <th className="px-4 py-2 text-right">Stock Actual</th>
                  </tr>
                </thead>
                <tbody>
                  {compra.compras_repuestos.map(item => (
                    <tr key={item.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/repuestos/${item.repuesto.id_repuesto}`}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {item.repuesto.nombre}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{item.repuesto.categoria}</td>
                      <td className="px-4 py-3 text-right font-medium">{item.cantidad}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(item.precio_unitario)}</td>
                      <td className="px-4 py-3 text-right font-bold">{formatCurrency(item.subtotal)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                          {item.repuesto.cantidad_existente} unidades
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 font-bold">
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-right">Total:</td>
                    <td className="px-4 py-3 text-right text-green-600 text-lg">
                      {formatCurrency(compra.total)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="border-t pt-6 mt-6">
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-blue-800">
                ℹ️ <strong>Impacto en inventario:</strong> Esta compra incrementó el stock de {compra.compras_repuestos.length} repuesto(s). 
                Si elimina esta compra, el stock será decrementado automáticamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
