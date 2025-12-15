'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import Loader from '@/components/ui/Loader';
import ErrorAlert from '@/components/ui/ErrorAlert';

interface FacturaOrdenServicio {
  id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  servicio: {
    id_servicio: number;
    nombre: string;
    descripcion?: string;
  };
}

interface FacturaOrdenRepuesto {
  id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  repuesto: {
    id_repuesto: number;
    nombre: string;
    descripcion?: string;
  };
}

interface FacturaOrden {
  id_orden: number;
  estado: string;
  fecha_apertura: string;
  fecha_entrega_estimada?: string;
  fecha_entrega_real?: string | null;
  total_estimado: number;
  total_real?: number | null;
  cliente: { nombre: string; apellido: string; email?: string; telefono?: string };
  vehiculo: { placa: string; marca: string; modelo: string; anio?: number };
  servicios_asignados: FacturaOrdenServicio[];
  repuestos_usados: FacturaOrdenRepuesto[];
}

interface Factura {
  id_factura: number;
  fecha_factura: string;
  monto: number;
  estado_pago: string;
  metodo_pago?: string | null;
  orden: FacturaOrden;
}

export default function FacturaDetallePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [factura, setFactura] = useState<Factura | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchFactura();
  }, [id]);

  const fetchFactura = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<Factura>(`/facturas/${id}`);
      setFactura(data);
    } catch (e: unknown) {
      const message = (e as { message?: string })?.message || 'Error al cargar la factura';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const formatFecha = (fecha?: string | null) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
    });
  };

  const money = (n?: number | null) => {
    if (n == null || isNaN(n)) return 'No definido';
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(n);
  };

  const totalServicios = useMemo(() => {
    return (factura?.orden.servicios_asignados || [])
      .filter(it => it.subtotal != null && !isNaN(it.subtotal))
      .reduce((s, it) => s + it.subtotal, 0);
  }, [factura]);
  const totalRepuestos = useMemo(() => {
    return (factura?.orden.repuestos_usados || [])
      .filter(it => it.subtotal != null && !isNaN(it.subtotal))
      .reduce((s, it) => s + it.subtotal, 0);
  }, [factura]);

  if (loading) return (
    <div className="min-h-screen bg-[#0f0f0f] p-8 flex items-center justify-center">
      <div className="text-gray-400 font-mono uppercase">CARGANDO FACTURA...</div>
    </div>
  );
  if (error) return (
    <div className="min-h-screen bg-[#0f0f0f] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-900/20 border border-red-800 text-red-400 p-4 mb-4 font-mono">{error.toUpperCase()}</div>
        <button className="text-gray-400 hover:text-white font-mono uppercase" onClick={() => router.back()}>← VOLVER</button>
      </div>
    </div>
  );
  if (!factura) return (
    <div className="min-h-screen bg-[#0f0f0f] p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-white font-mono uppercase">FACTURA NO ENCONTRADA</h1>
        <div className="mt-6">
          <Link href="/admin/ordenes" className="text-gray-400 hover:text-white font-mono uppercase">VOLVER A ORDENES</Link>
        </div>
      </div>
    </div>
  );

  const { orden } = factura;

  return (
    <div className="min-h-screen bg-[#0f0f0f] p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <button onClick={() => router.back()} className="text-gray-400 hover:text-white font-mono uppercase text-sm mb-3">← VOLVER</button>
            <h1 className="text-4xl font-bold text-white font-mono uppercase">FACTURA #{factura.id_factura}</h1>
            <p className="text-gray-400 font-mono mt-2">FECHA: {formatFecha(factura.fecha_factura)}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400 font-mono uppercase">METODO: {factura.metodo_pago || '-'}</div>
            <div className="text-sm font-semibold mt-2 font-mono">
              <span className="text-gray-400 uppercase">ESTADO DE PAGO:</span> <span className={factura.estado_pago === 'pagado' ? 'text-green-400' : 'text-yellow-400'}>{factura.estado_pago.toUpperCase()}</span>
            </div>
            <button onClick={() => window.print()} className="mt-4 bg-white text-black px-4 py-2 font-mono uppercase font-bold hover:bg-gray-200">IMPRIMIR</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#1a1a1a] border border-gray-800 p-6">
            <h2 className="text-xl font-bold text-white font-mono uppercase mb-4">CLIENTE</h2>
            <div className="text-sm space-y-2">
              <div><span className="text-gray-400 font-mono uppercase">NOMBRE:</span> <span className="font-medium text-white font-mono">{orden.cliente.nombre} {orden.cliente.apellido}</span></div>
              {orden.cliente.email && (<div><span className="text-gray-400 font-mono uppercase">EMAIL:</span> <span className="text-white font-mono">{orden.cliente.email}</span></div>)}
              {orden.cliente.telefono && (<div><span className="text-gray-400 font-mono uppercase">TELEFONO:</span> <span className="text-white font-mono">{orden.cliente.telefono}</span></div>)}
            </div>
          </div>
          <div className="bg-[#1a1a1a] border border-gray-800 p-6">
            <h2 className="text-xl font-bold text-white font-mono uppercase mb-4">VEHICULO</h2>
            <div className="text-sm space-y-2">
              <div><span className="text-gray-400 font-mono uppercase">PLACA:</span> <span className="font-medium text-white font-mono">{orden.vehiculo.placa}</span></div>
              <div><span className="text-gray-400 font-mono uppercase">MARCA/MODELO:</span> <span className="text-white font-mono">{orden.vehiculo.marca} {orden.vehiculo.modelo}</span></div>
              {orden.vehiculo.anio && (<div><span className="text-gray-400 font-mono uppercase">ANO:</span> <span className="text-white font-mono">{orden.vehiculo.anio}</span></div>)}
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-gray-800">
          <div className="px-6 py-4 border-b border-gray-800 font-bold text-white font-mono uppercase">DETALLE</div>
          <div className="p-6">
            <div className="mb-6">
              <h3 className="font-bold text-white font-mono uppercase mb-3">SERVICIOS</h3>
              {orden.servicios_asignados.length > 0 ? (
                <table className="w-full text-sm">
                  <thead className="bg-[#2d2d2d] border-b border-gray-800">
                    <tr>
                      <th className="text-left px-3 py-3 text-gray-400 font-mono uppercase">SERVICIO</th>
                      <th className="text-center px-3 py-3 text-gray-400 font-mono uppercase">CANT.</th>
                      <th className="text-right px-3 py-3 text-gray-400 font-mono uppercase">PRECIO</th>
                      <th className="text-right px-3 py-3 text-gray-400 font-mono uppercase">SUBTOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orden.servicios_asignados.map((s) => (
                      <tr key={s.id} className="border-t border-gray-800">
                        <td className="px-3 py-3 text-white font-mono">{s.servicio.nombre}</td>
                        <td className="px-3 py-3 text-center text-gray-400 font-mono">{s.cantidad}</td>
                        <td className="px-3 py-3 text-right text-gray-400 font-mono">{money(s.precio_unitario)}</td>
                        <td className="px-3 py-3 text-right font-medium text-white font-mono">{money(s.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-gray-400 text-sm font-mono uppercase">NO HAY SERVICIOS</div>
              )}
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-white font-mono uppercase mb-3">REPUESTOS</h3>
              {orden.repuestos_usados.length > 0 ? (
                <table className="w-full text-sm">
                  <thead className="bg-[#2d2d2d] border-b border-gray-800">
                    <tr>
                      <th className="text-left px-3 py-3 text-gray-400 font-mono uppercase">REPUESTO</th>
                      <th className="text-center px-3 py-3 text-gray-400 font-mono uppercase">CANT.</th>
                      <th className="text-right px-3 py-3 text-gray-400 font-mono uppercase">PRECIO</th>
                      <th className="text-right px-3 py-3 text-gray-400 font-mono uppercase">SUBTOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orden.repuestos_usados.map((r) => (
                      <tr key={r.id} className="border-t border-gray-800">
                        <td className="px-3 py-3 text-white font-mono">{r.repuesto.nombre}</td>
                        <td className="px-3 py-3 text-center text-gray-400 font-mono">{r.cantidad}</td>
                        <td className="px-3 py-3 text-right text-gray-400 font-mono">{money(r.precio_unitario)}</td>
                        <td className="px-3 py-3 text-right font-medium text-white font-mono">{money(r.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-gray-400 text-sm font-mono uppercase">NO HAY REPUESTOS</div>
              )}
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-800 bg-[#2d2d2d]">
            <div className="flex justify-end">
              <div className="w-full md:w-80 space-y-2">
                <div className="flex justify-between text-sm font-mono">
                  <span className="text-gray-400 uppercase">SUBTOTAL SERVICIOS</span>
                  <span className="text-white">{money(totalServicios)}</span>
                </div>
                <div className="flex justify-between text-sm font-mono">
                  <span className="text-gray-400 uppercase">SUBTOTAL REPUESTOS</span>
                  <span className="text-white">{money(totalRepuestos)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-3 font-mono pt-3 border-t border-gray-700">
                  <span className="text-gray-400 uppercase">TOTAL FACTURA</span>
                  <span className="text-white">{money(factura.monto)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <Link href={`/admin/ordenes/${orden.id_orden}`} className="bg-white text-black px-6 py-3 font-mono uppercase font-bold hover:bg-gray-200">VER ORDEN</Link>
          <button onClick={() => window.print()} className="bg-[#2d2d2d] border border-gray-700 text-white px-6 py-3 font-mono uppercase font-bold hover:bg-[#3d3d3d]">IMPRIMIR</button>
        </div>
      </div>
    </div>
  );
}
