'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

interface Repuesto {
  id_repuesto: number;
  nombre: string;
  categoria: string;
  cantidad_existente: number;
  stock_minimo: number;
  precio: number;
  ordenes_repuestos: Array<{
    cantidad: number;
    orden: { fecha_apertura: string };
  }>;
}

interface Proveedor {
  id_proveedor: number;
  nombre: string;
  empresa?: string;
  compras: Array<{
    id_compra: number;
    total: number;
    fecha_compra: string;
  }>;
}

interface Orden {
  id_orden: number;
  fecha_apertura: string;
  fecha_cierre?: string;
  total: number;
  estado: string;
  ordenes_repuestos: Array<{
    cantidad: number;
    precio_unitario: number;
  }>;
}

type ReportType = 'rotacion' | 'proveedores' | 'rentabilidad';

export default function ReportesPage() {
  const router = useRouter();
  const [reportType, setReportType] = useState<ReportType>('rotacion');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [ordenes, setOrdenes] = useState<Orden[]>([]);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const headers = { 'Authorization': `Bearer ${token}` };

      const [repuestosRes, proveedoresRes, ordenesRes] = await Promise.all([
        fetch(`${API_URL}/repuestos`, { headers }),
        fetch(`${API_URL}/proveedores`, { headers }),
        fetch(`${API_URL}/ordenes`, { headers })
      ]);

      if (repuestosRes.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      if (!repuestosRes.ok || !proveedoresRes.ok || !ordenesRes.ok) {
        throw new Error('Error al cargar datos para reportes');
      }

      const [repData, provData, ordData] = await Promise.all([
        repuestosRes.json(),
        proveedoresRes.json(),
        ordenesRes.json()
      ]);

      setRepuestos(repData);
      setProveedores(provData);
      setOrdenes(ordData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar reportes');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Reporte de Rotación de Inventario
  const getRotacionInventario = () => {
    return repuestos.map(rep => {
      const totalUsado = rep.ordenes_repuestos?.reduce((sum, or) => sum + or.cantidad, 0) || 0;
      const valorStock = rep.cantidad_existente * rep.precio;
      const rotacion = rep.cantidad_existente > 0 ? (totalUsado / rep.cantidad_existente).toFixed(2) : '0.00';
      const estadoStock = rep.cantidad_existente < rep.stock_minimo ? 'Bajo' : 'Normal';

      return {
        ...rep,
        totalUsado,
        valorStock,
        rotacion: parseFloat(rotacion),
        estadoStock
      };
    }).sort((a, b) => b.rotacion - a.rotacion);
  };

  // Reporte de Compras por Proveedor
  const getComprasPorProveedor = () => {
    return proveedores.map(prov => {
      const totalCompras = prov.compras?.length || 0;
      const montoTotal = prov.compras?.reduce((sum, c) => sum + c.total, 0) || 0;
      const ultimaCompra = prov.compras?.[prov.compras.length - 1]?.fecha_compra;
      const promedio = totalCompras > 0 ? montoTotal / totalCompras : 0;

      return {
        ...prov,
        totalCompras,
        montoTotal,
        ultimaCompra,
        promedio
      };
    }).sort((a, b) => b.montoTotal - a.montoTotal);
  };

  // Reporte de Rentabilidad de Servicios
  const getRentabilidadServicios = () => {
    const ordenesCompletas = ordenes.filter(o => o.estado === 'facturada' || o.estado === 'cerrada');
    
    return ordenesCompletas.map(orden => {
      const costoRepuestos = orden.ordenes_repuestos?.reduce(
        (sum, or) => sum + (or.cantidad * or.precio_unitario), 0
      ) || 0;
      const manoDeObra = orden.total - costoRepuestos;
      const margen = orden.total > 0 ? ((orden.total - costoRepuestos) / orden.total * 100).toFixed(1) : '0.0';
      
      const diasServicio = orden.fecha_cierre && orden.fecha_apertura
        ? Math.ceil((new Date(orden.fecha_cierre).getTime() - new Date(orden.fecha_apertura).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      return {
        ...orden,
        costoRepuestos,
        manoDeObra,
        margen: parseFloat(margen),
        diasServicio
      };
    }).sort((a, b) => b.margen - a.margen);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-white p-6 flex items-center justify-center">
      <div className="text-gray-600">Cargando reportes...</div>
    </div>
  );

  const rotacionData = getRotacionInventario();
  const proveedoresData = getComprasPorProveedor();
  const rentabilidadData = getRentabilidadServicios();

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">📊 Reportes y Análisis</h1>
          <p className="text-gray-600">Análisis detallado del rendimiento del taller</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>
        )}

        {/* Report Type Selector */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setReportType('rotacion')}
            className={`px-6 py-3 font-medium transition-colors ${
              reportType === 'rotacion'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            📦 Rotación de Inventario
          </button>
          <button
            onClick={() => setReportType('proveedores')}
            className={`px-6 py-3 font-medium transition-colors ${
              reportType === 'proveedores'
                ? 'border-b-2 border-green-600 text-green-600'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            🏢 Compras por Proveedor
          </button>
          <button
            onClick={() => setReportType('rentabilidad')}
            className={`px-6 py-3 font-medium transition-colors ${
              reportType === 'rentabilidad'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            💰 Rentabilidad de Servicios
          </button>
        </div>

        {/* Rotación de Inventario Report */}
        {reportType === 'rotacion' && (
          <div>
            <div className="bg-blue-50 p-6 rounded mb-6">
              <h2 className="text-2xl font-bold mb-2">Análisis de Rotación de Inventario</h2>
              <p className="text-gray-700">
                Este reporte muestra qué tan rápido se mueven los repuestos. Una rotación alta indica productos de alta demanda.
              </p>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <p className="text-sm text-gray-600">Total Repuestos</p>
                  <p className="text-2xl font-bold">{rotacionData.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valor Total Stock</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(rotacionData.reduce((sum, r) => sum + r.valorStock, 0))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Stock Bajo</p>
                  <p className="text-2xl font-bold text-red-600">
                    {rotacionData.filter(r => r.estadoStock === 'Bajo').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left">Repuesto</th>
                    <th className="px-4 py-3 text-left">Categoría</th>
                    <th className="px-4 py-3 text-right">Stock Actual</th>
                    <th className="px-4 py-3 text-right">Usado (Total)</th>
                    <th className="px-4 py-3 text-right">Rotación</th>
                    <th className="px-4 py-3 text-right">Valor Stock</th>
                    <th className="px-4 py-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {rotacionData.map(rep => (
                    <tr key={rep.id_repuesto} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/repuestos/${rep.id_repuesto}`}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {rep.nombre}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{rep.categoria}</td>
                      <td className="px-4 py-3 text-right">{rep.cantidad_existente}</td>
                      <td className="px-4 py-3 text-right">{rep.totalUsado}</td>
                      <td className="px-4 py-3 text-right font-bold">
                        <span className={
                          rep.rotacion > 2 ? 'text-green-600' :
                          rep.rotacion > 1 ? 'text-blue-600' :
                          rep.rotacion > 0.5 ? 'text-yellow-600' :
                          'text-red-600'
                        }>
                          {rep.rotacion}x
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">{formatCurrency(rep.valorStock)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          rep.estadoStock === 'Bajo'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {rep.estadoStock}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Compras por Proveedor Report */}
        {reportType === 'proveedores' && (
          <div>
            <div className="bg-green-50 p-6 rounded mb-6">
              <h2 className="text-2xl font-bold mb-2">Compras por Proveedor</h2>
              <p className="text-gray-700">
                Análisis de compras realizadas a cada proveedor para identificar relaciones comerciales clave.
              </p>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <p className="text-sm text-gray-600">Total Proveedores</p>
                  <p className="text-2xl font-bold">{proveedoresData.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Comprado</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(proveedoresData.reduce((sum, p) => sum + p.montoTotal, 0))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Compras Totales</p>
                  <p className="text-2xl font-bold">
                    {proveedoresData.reduce((sum, p) => sum + p.totalCompras, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left">Proveedor</th>
                    <th className="px-4 py-3 text-left">Empresa</th>
                    <th className="px-4 py-3 text-right">Compras</th>
                    <th className="px-4 py-3 text-right">Monto Total</th>
                    <th className="px-4 py-3 text-right">Promedio/Compra</th>
                    <th className="px-4 py-3 text-right">Última Compra</th>
                  </tr>
                </thead>
                <tbody>
                  {proveedoresData.map(prov => (
                    <tr key={prov.id_proveedor} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/proveedores/${prov.id_proveedor}`}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {prov.nombre}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{prov.empresa || '-'}</td>
                      <td className="px-4 py-3 text-right font-medium">{prov.totalCompras}</td>
                      <td className="px-4 py-3 text-right font-bold text-green-600">
                        {formatCurrency(prov.montoTotal)}
                      </td>
                      <td className="px-4 py-3 text-right">{formatCurrency(prov.promedio)}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-600">
                        {formatDate(prov.ultimaCompra)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Rentabilidad de Servicios Report */}
        {reportType === 'rentabilidad' && (
          <div>
            <div className="bg-purple-50 p-6 rounded mb-6">
              <h2 className="text-2xl font-bold mb-2">Rentabilidad de Servicios</h2>
              <p className="text-gray-700">
                Análisis de márgenes de ganancia en órdenes completadas, considerando costo de repuestos vs. mano de obra.
              </p>
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-sm text-gray-600">Órdenes Completadas</p>
                  <p className="text-2xl font-bold">{rentabilidadData.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ingresos Totales</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(rentabilidadData.reduce((sum, o) => sum + o.total, 0))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Costo Repuestos</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(rentabilidadData.reduce((sum, o) => sum + o.costoRepuestos, 0))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Margen Promedio</p>
                  <p className="text-2xl font-bold text-green-600">
                    {rentabilidadData.length > 0
                      ? (rentabilidadData.reduce((sum, o) => sum + o.margen, 0) / rentabilidadData.length).toFixed(1)
                      : '0.0'}%
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left">Orden</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-right">Costo Repuestos</th>
                    <th className="px-4 py-3 text-right">Mano de Obra</th>
                    <th className="px-4 py-3 text-right">Margen</th>
                    <th className="px-4 py-3 text-right">Días Servicio</th>
                    <th className="px-4 py-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {rentabilidadData.map(orden => (
                    <tr key={orden.id_orden} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/ordenes/${orden.id_orden}`}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Orden #{orden.id_orden}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right font-bold">
                        {formatCurrency(orden.total)}
                      </td>
                      <td className="px-4 py-3 text-right text-red-600">
                        {formatCurrency(orden.costoRepuestos)}
                      </td>
                      <td className="px-4 py-3 text-right text-green-600">
                        {formatCurrency(orden.manoDeObra)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold">
                        <span className={
                          orden.margen > 70 ? 'text-green-600' :
                          orden.margen > 50 ? 'text-blue-600' :
                          orden.margen > 30 ? 'text-yellow-600' :
                          'text-red-600'
                        }>
                          {orden.margen}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {orden.diasServicio} días
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                          {orden.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Export Buttons */}
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={() => alert('Función de exportación en desarrollo')}
            className="bg-gray-100 text-gray-700 px-6 py-2 rounded hover:bg-gray-200 transition-colors"
          >
            📄 Exportar PDF
          </button>
          <button
            onClick={() => alert('Función de exportación en desarrollo')}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition-colors"
          >
            📊 Exportar Excel
          </button>
        </div>
      </div>
    </div>
  );
}
