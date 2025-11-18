'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

interface Compra {
  id_compra: number;
  fecha_compra: string;
  total: number;
  estado: string;
  notas?: string;
  proveedor: {
    nombre: string;
    empresa?: string;
  };
  compras_repuestos: Array<{
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    repuesto: {
      nombre: string;
    };
  }>;
}

export default function ComprasPage() {
  const router = useRouter();
  const [compras, setCompras] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompras();
  }, []);

  const fetchCompras = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch(`${API_URL}/compras`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      if (!res.ok) throw new Error('Error al cargar compras');

      const data = await res.json();
      setCompras(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar compras');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <div className="text-gray-600">Cargando compras...</div>
    </div>
  );

  const totalCompras = compras.reduce((sum, c) => sum + c.total, 0);

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Compras a Proveedores</h2>
          <p className="text-gray-600 text-sm mt-1">
            {compras.length} compra{compras.length !== 1 ? 's' : ''} registradas • Total: {formatCurrency(totalCompras)}
          </p>
        </div>
        <Link
          href="/admin/compras/new"
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          + Nueva Compra
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>
      )}

      <div className="space-y-4">
        {compras.map(compra => (
          <div key={compra.id_compra} className="bg-gray-50 rounded shadow p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg">
                    Compra #{compra.id_compra}
                  </h3>
                  <span className={`px-2 py-1 rounded text-xs ${getEstadoBadgeClass(compra.estado)}`}>
                    {compra.estado}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mt-1">
                  {compra.proveedor.nombre} {compra.proveedor.empresa && `• ${compra.proveedor.empresa}`}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {formatDate(compra.fecha_compra)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(compra.total)}
                </p>
                <Link
                  href={`/admin/compras/${compra.id_compra}`}
                  className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                >
                  Ver detalles →
                </Link>
              </div>
            </div>

            {compra.notas && (
              <p className="text-gray-600 text-sm mb-3 italic">
                📝 {compra.notas}
              </p>
            )}

            <div className="border-t pt-3">
              <p className="text-sm font-medium mb-2">Repuestos comprados:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {compra.compras_repuestos.map((item, idx) => (
                  <div key={idx} className="bg-white rounded p-2 text-sm">
                    <p className="font-medium">{item.repuesto.nombre}</p>
                    <p className="text-gray-600">
                      {item.cantidad} unidades × {formatCurrency(item.precio_unitario)} = {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {compras.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No hay compras registradas</p>
            <Link
              href="/admin/compras/new"
              className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors inline-block"
            >
              Registrar Primera Compra
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
