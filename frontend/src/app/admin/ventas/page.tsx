"use client";
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import ErrorAlert from '@/components/ui/ErrorAlert';
import Loader from '@/components/ui/Loader';
interface Factura {
  id_factura: number;
  fecha_factura: string;
  monto: number;
  estado_pago: string;
  metodo_pago?: string | null;
  orden: {
    id_orden: number;
    estado: string;
    cliente: { nombre: string; apellido: string };
    vehiculo: { placa: string };
  };
}
export default function VentasPage() {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState('todos'); 
  useEffect(() => {
    fetchFacturas();
  }, []);
  const fetchFacturas = async () => {
    setLoading(true);
    try {
      const data = await api.get<Factura[]>('/facturas');
      setFacturas(data);
      setError(null);
    } catch (e: unknown) {
      const message = (e as { message?: string })?.message || 'Error al cargar ventas';
      setError(message);
    } finally {
      setLoading(false);
    }
  };
  const formatCurrency = (n: number) => 
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(n || 0);
  const formatDate = (date: string | null | undefined) => {
    if (!date) return '-';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const day = String(d.getDate()).padStart(2, '0');
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };
  const facturasFiltradas = useMemo(() => {
    const ahora = new Date();
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const semanaAtras = new Date(hoy);
    semanaAtras.setDate(semanaAtras.getDate() - 7);
    const mesAtras = new Date(hoy);
    mesAtras.setMonth(mesAtras.getMonth() - 1);
    return facturas.filter(f => {
      const fechaFactura = new Date(f.fecha_factura);
      if (filtro === 'hoy') return fechaFactura >= hoy;
      if (filtro === 'semana') return fechaFactura >= semanaAtras;
      if (filtro === 'mes') return fechaFactura >= mesAtras;
      return true;
    });
  }, [facturas, filtro]);
  const totalVentas = useMemo(() => {
    return facturasFiltradas.reduce((sum, f) => sum + (f.monto || 0), 0);
  }, [facturasFiltradas]);
  const ventasPagadas = useMemo(() => {
    return facturasFiltradas.filter(f => f.estado_pago === 'pagado').reduce((sum, f) => sum + (f.monto || 0), 0);
  }, [facturasFiltradas]);
  const ventasPendientes = useMemo(() => {
    return facturasFiltradas.filter(f => f.estado_pago === 'pendiente').reduce((sum, f) => sum + (f.monto || 0), 0);
  }, [facturasFiltradas]);
  if (loading) return <Loader />;
  if (error) return <ErrorAlert message={error} />;
  return (
    <div className="container mx-auto px-4 py-8">
      {}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Ventas</h1>
            <p className="text-gray-600 mt-1">Historial de ventas y facturación</p>
          </div>
          <Link 
            href="/admin/dashboard"
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            ← Volver al Dashboard
          </Link>
        </div>
        {}
        <div className="flex gap-2">
          <button
            onClick={() => setFiltro('todos')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filtro === 'todos' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFiltro('hoy')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filtro === 'hoy' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Hoy
          </button>
          <button
            onClick={() => setFiltro('semana')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filtro === 'semana' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            óšltima Semana
          </button>
          <button
            onClick={() => setFiltro('mes')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filtro === 'mes' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            óšltimo Mes
          </button>
        </div>
      </div>
      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <p className="text-green-100 text-sm mb-2">Total Ventas</p>
          <p className="text-3xl font-bold">{formatCurrency(totalVentas)}</p>
          <p className="text-green-100 text-sm mt-2">{facturasFiltradas.length} facturas</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <p className="text-blue-100 text-sm mb-2">Ventas Pagadas</p>
          <p className="text-3xl font-bold">{formatCurrency(ventasPagadas)}</p>
          <p className="text-blue-100 text-sm mt-2">
            {facturasFiltradas.filter(f => f.estado_pago === 'pagado').length} facturas
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
          <p className="text-yellow-100 text-sm mb-2">Ventas Pendientes</p>
          <p className="text-3xl font-bold">{formatCurrency(ventasPendientes)}</p>
          <p className="text-yellow-100 text-sm mt-2">
            {facturasFiltradas.filter(f => f.estado_pago === 'pendiente').length} facturas
          </p>
        </div>
      </div>
      {}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Factura #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehículo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mó©todo Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {facturasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No hay ventas en el período seleccionado
                  </td>
                </tr>
              ) : (
                facturasFiltradas.map((factura) => (
                  <tr key={factura.id_factura} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{factura.id_factura}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" suppressHydrationWarning>
                      {formatDate(factura.fecha_factura)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {factura.orden.cliente.nombre} {factura.orden.cliente.apellido}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {factura.orden.vehiculo.placa}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(factura.monto)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        factura.estado_pago === 'pagado'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {factura.estado_pago}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {factura.metodo_pago || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        href={`/admin/facturas/${factura.id_factura}`}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        Ver detalles
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {}
      <div className="mt-6 text-center">
        <Link 
          href="/admin/facturas"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Ver gestión completa de facturas →
        </Link>
      </div>
    </div>
  );
}
