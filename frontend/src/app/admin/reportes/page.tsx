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
    <div className="min-h-screen bg-[#0f0f0f] p-6 flex items-center justify-center">
      <div className="text-gray-600">Cargando reportes...</div>
    </div>
  );
  const rotacionData = getRotacionInventario();
  const proveedoresData = getComprasPorProveedor();
  const rentabilidadData = getRentabilidadServicios();
  return (
    <div className="min-h-screen bg-[#0f0f0f] p-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">REPORTES Y ANALISIS</h1>
          <p className="text-lg text-gray-600">ANALISIS DETALLADO DEL RENDIMIENTO DEL TALLER</p>
        </div>
        {error && (
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-2xl mb-6 shadow-lg">
            <div className="flex items-center gap-3">

              <p className="text-lg font-medium">{error}</p>
            </div>
          </div>
        )}
        {}
        <div className="flex gap-3 mb-8 bg-[#1a1a1a] border border-gray-800 p-2">
          <button
            onClick={() => setReportType('rotacion')}
            className={`flex-1 px-8 py-4 font-semibold text-lg rounded-xl transition-all duration-200 ${
              reportType === 'rotacion'
                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ROTACION DE INVENTARIO
          </button>
          <button
            onClick={() => setReportType('proveedores')}
            className={`flex-1 px-8 py-4 font-semibold text-lg rounded-xl transition-all duration-200 ${
              reportType === 'proveedores'
                ? 'bg-gradient-to-br from-green-600 to-green-700 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            COMPRAS POR PROVEEDOR
          </button>
          <button
            onClick={() => setReportType('rentabilidad')}
            className={`flex-1 px-8 py-4 font-semibold text-lg rounded-xl transition-all duration-200 ${
              reportType === 'rentabilidad'
                ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            RENTABILIDAD DE SERVICIOS
          </button>
        </div>
        {}
        {reportType === 'rotacion' && (
          <div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 rounded-2xl mb-8 shadow-xl text-white">
              <h2 className="text-3xl font-bold mb-3">ANALISIS DE ROTACION DE INVENTARIO</h2>
              <p className="text-blue-100 text-lg mb-6">
                ESTE REPORTE MUESTRA QUE TAN RAPIDO SE MUEVEN LOS REPUESTOS. UNA ROTACION ALTA INDICA PRODUCTOS DE ALTA DEMANDA.
              </p>
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl">
                  <p className="text-blue-100 text-base mb-2">Total Repuestos</p>
                  <p className="text-4xl font-bold">{rotacionData.length}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl">
                  <p className="text-blue-100 text-base mb-2">Valor Total Stock</p>
                  <p className="text-4xl font-bold">
                    {formatCurrency(rotacionData.reduce((sum, r) => sum + r.valorStock, 0))}
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl">
                  <p className="text-blue-100 text-base mb-2">Stock Bajo</p>
                  <p className="text-4xl font-bold">
                    {rotacionData.filter(r => r.estadoStock === 'Bajo').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-[#1a1a1a] border border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-[#2d2d2d] border-b border-gray-800">
                    <tr>
                      <th className="px-8 py-5 text-left text-lg font-semibold">REPUESTO</th>
                      <th className="px-8 py-5 text-left text-lg font-semibold">CATEGORIA</th>
                      <th className="px-8 py-5 text-right text-lg font-semibold">STOCK ACTUAL</th>
                      <th className="px-8 py-5 text-right text-lg font-semibold">USADO (TOTAL)</th>
                      <th className="px-8 py-5 text-right text-lg font-semibold">ROTACION</th>
                      <th className="px-8 py-5 text-right text-lg font-semibold">VALOR STOCK</th>
                      <th className="px-8 py-5 text-center text-lg font-semibold">ESTADO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rotacionData.map((rep, index) => (
                      <tr key={rep.id_repuesto} className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                        'hover:bg-[#2d2d2d]'
                      }`}>
                        <td className="px-8 py-5">
                          <Link
                            href={`/admin/repuestos/${rep.id_repuesto}`}
                            className="text-blue-600 hover:underline font-medium"
                          >
                            {rep.nombre}
                          </Link>
                        </td>
                        <td className="px-8 py-5 text-gray-600">{rep.categoria}</td>
                        <td className="px-8 py-5 text-right">{rep.cantidad_existente}</td>
                        <td className="px-8 py-5 text-right">{rep.totalUsado}</td>
                        <td className="px-8 py-5 text-right font-bold">
                          <span className={
                            rep.rotacion > 2 ? 'text-green-600' :
                            rep.rotacion > 1 ? 'text-blue-600' :
                            rep.rotacion > 0.5 ? 'text-yellow-600' :
                            'text-red-600'
                          }>
                            {rep.rotacion}x
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">{formatCurrency(rep.valorStock)}</td>
                        <td className="px-8 py-5 text-center">
                          <span className={`px-3 py-2 rounded-lg text-sm font-medium ${
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
          </div>
        )}
        {}
        {reportType === 'proveedores' && (
          <div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-8 rounded-2xl mb-8 shadow-xl text-white">
              <h2 className="text-3xl font-bold mb-3">COMPRAS POR PROVEEDOR</h2>
              <p className="text-green-100 text-lg mb-6">
                ANALISIS DE COMPRAS REALIZADAS A CADA PROVEEDOR PARA IDENTIFICAR RELACIONES COMERCIALES CLAVE.
              </p>
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl">
                  <p className="text-green-100 text-base mb-2">Total Proveedores</p>
                  <p className="text-4xl font-bold">{proveedoresData.length}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl">
                  <p className="text-green-100 text-base mb-2">Total Comprado</p>
                  <p className="text-4xl font-bold">
                    {formatCurrency(proveedoresData.reduce((sum, p) => sum + p.montoTotal, 0))}
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl">
                  <p className="text-green-100 text-base mb-2">Compras Totales</p>
                  <p className="text-4xl font-bold">
                    {proveedoresData.reduce((sum, p) => sum + p.totalCompras, 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left">PROVEEDOR</th>
                    <th className="px-4 py-3 text-left">EMPRESA</th>
                    <th className="px-4 py-3 text-right">COMPRAS</th>
                    <th className="px-4 py-3 text-right">MONTO TOTAL</th>
                    <th className="px-4 py-3 text-right">PROMEDIO/COMPRA</th>
                    <th className="px-4 py-3 text-right">ULTIMA COMPRA</th>
                  </tr>
                </thead>
                <tbody>
                  {proveedoresData.map(prov => (
                    <tr key={prov.id_proveedor} className="border-t border-gray-800 hover:bg-[#2d2d2d]">
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
        {}
        {reportType === 'rentabilidad' && (
          <div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-8 rounded-2xl mb-8 shadow-xl text-white">
              <h2 className="text-3xl font-bold mb-3">RENTABILIDAD DE SERVICIOS</h2>
              <p className="text-purple-100 text-lg mb-6">
                ANALISIS DE MARGENES DE GANANCIA EN ORDENES COMPLETADAS, CONSIDERANDO COSTO DE REPUESTOS VS. MANO DE OBRA.
              </p>
              <div className="grid grid-cols-4 gap-6">
                <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl">
                  <p className="text-purple-100 text-base mb-2">ORDENES COMPLETADAS</p>
                  <p className="text-4xl font-bold">{rentabilidadData.length}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl">
                  <p className="text-purple-100 text-base mb-2">Ingresos Totales</p>
                  <p className="text-4xl font-bold">
                    {formatCurrency(rentabilidadData.reduce((sum, o) => sum + o.total, 0))}
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl">
                  <p className="text-purple-100 text-base mb-2">Costo Repuestos</p>
                  <p className="text-4xl font-bold">
                    {formatCurrency(rentabilidadData.reduce((sum, o) => sum + o.costoRepuestos, 0))}
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl">
                  <p className="text-purple-100 text-base mb-2">Margen Promedio</p>
                  <p className="text-4xl font-bold">
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
                    <th className="px-4 py-3 text-left">ORDEN</th>
                    <th className="px-4 py-3 text-right">TOTAL</th>
                    <th className="px-4 py-3 text-right">COSTO REPUESTOS</th>
                    <th className="px-4 py-3 text-right">MANO DE OBRA</th>
                    <th className="px-4 py-3 text-right">MARGEN</th>
                    <th className="px-4 py-3 text-right">DIAS SERVICIO</th>
                    <th className="px-4 py-3 text-center">ESTADO</th>
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
                        {orden.diasServicio} DIAS
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
        {}
        <div className="mt-8 flex gap-4 justify-end">
          <button
            onClick={() => alert('Funcion de exportacion en desarrollo')}
            className="bg-gradient-to-br from-gray-600 to-gray-700 text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 font-semibold text-lg flex items-center gap-3"
          >
            EXPORTAR PDF
          </button>
          <button
            onClick={() => alert('Funcion de exportacion en desarrollo')}
            className="bg-gradient-to-br from-green-600 to-green-700 text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 font-semibold text-lg flex items-center gap-3"
          >
            EXPORTAR EXCEL
          </button>
        </div>
      </div>
    </div>
  );
}
