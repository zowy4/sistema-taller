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

  const money = (n?: number | null) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(n || 0);

  const totalServicios = useMemo(() => (factura?.orden.servicios_asignados || []).reduce((s, it) => s + it.subtotal, 0), [factura]);
  const totalRepuestos = useMemo(() => (factura?.orden.repuestos_usados || []).reduce((s, it) => s + it.subtotal, 0), [factura]);

  if (loading) return (
    <div className="min-h-screen p-6">
      <Loader text="Cargando factura..." />
    </div>
  );
  if (error) return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <ErrorAlert message={error} />
        <button className="text-blue-600 hover:underline" onClick={() => router.back()}>← Volver</button>
      </div>
    </div>
  );
  if (!factura) return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-semibold">Factura no encontrada</h1>
        <div className="mt-4">
          <Link href="/admin/ordenes" className="text-blue-600 hover:underline">Volver a órdenes</Link>
        </div>
      </div>
    </div>
  );

  const { orden } = factura;

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <button onClick={() => router.back()} className="text-blue-600 hover:underline text-sm">← Volver</button>
            <h1 className="text-3xl font-bold mt-1">Factura #{factura.id_factura}</h1>
            <p className="text-gray-600">Fecha: {formatFecha(factura.fecha_factura)}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Método: {factura.metodo_pago || '-'}</div>
            <div className="text-sm font-semibold mt-1">
              Estado de pago: <span className={factura.estado_pago === 'pagado' ? 'text-green-700' : 'text-yellow-700'}>{factura.estado_pago}</span>
            </div>
            <button onClick={() => window.print()} className="mt-3 px-4 py-2 border rounded hover:bg-gray-50">🖨️ Imprimir</button>
          </div>
        </div>

        {/* Datos del cliente y vehículo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded border">
            <h2 className="text-lg font-semibold mb-2">Cliente</h2>
            <div className="text-sm">
              <div><span className="text-gray-600">Nombre:</span> <span className="font-medium">{orden.cliente.nombre} {orden.cliente.apellido}</span></div>
              {orden.cliente.email && (<div><span className="text-gray-600">Email:</span> <span>{orden.cliente.email}</span></div>)}
              {orden.cliente.telefono && (<div><span className="text-gray-600">Teléfono:</span> <span>{orden.cliente.telefono}</span></div>)}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded border">
            <h2 className="text-lg font-semibold mb-2">Vehículo</h2>
            <div className="text-sm">
              <div><span className="text-gray-600">Placa:</span> <span className="font-medium">{orden.vehiculo.placa}</span></div>
              <div><span className="text-gray-600">Marca/Modelo:</span> <span>{orden.vehiculo.marca} {orden.vehiculo.modelo}</span></div>
              {orden.vehiculo.anio && (<div><span className="text-gray-600">Año:</span> <span>{orden.vehiculo.anio}</span></div>)}
            </div>
          </div>
        </div>

        {/* Conceptos */}
        <div className="bg-white border rounded shadow-sm">
          <div className="px-4 py-3 border-b bg-gray-50 font-semibold">Detalle</div>
          <div className="p-4">
            <div className="mb-4">
              <h3 className="font-medium mb-2">Servicios</h3>
              {orden.servicios_asignados.length > 0 ? (
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left px-3 py-2">Servicio</th>
                      <th className="text-center px-3 py-2">Cant.</th>
                      <th className="text-right px-3 py-2">Precio</th>
                      <th className="text-right px-3 py-2">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orden.servicios_asignados.map((s) => (
                      <tr key={s.id} className="border-t">
                        <td className="px-3 py-2">{s.servicio.nombre}</td>
                        <td className="px-3 py-2 text-center">{s.cantidad}</td>
                        <td className="px-3 py-2 text-right">{money(s.precio_unitario)}</td>
                        <td className="px-3 py-2 text-right font-medium">{money(s.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-gray-500 text-sm">No hay servicios</div>
              )}
            </div>

            <div className="mb-4">
              <h3 className="font-medium mb-2">Repuestos</h3>
              {orden.repuestos_usados.length > 0 ? (
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left px-3 py-2">Repuesto</th>
                      <th className="text-center px-3 py-2">Cant.</th>
                      <th className="text-right px-3 py-2">Precio</th>
                      <th className="text-right px-3 py-2">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orden.repuestos_usados.map((r) => (
                      <tr key={r.id} className="border-t">
                        <td className="px-3 py-2">{r.repuesto.nombre}</td>
                        <td className="px-3 py-2 text-center">{r.cantidad}</td>
                        <td className="px-3 py-2 text-right">{money(r.precio_unitario)}</td>
                        <td className="px-3 py-2 text-right font-medium">{money(r.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-gray-500 text-sm">No hay repuestos</div>
              )}
            </div>
          </div>

          {/* Totales */}
          <div className="px-4 py-3 border-t bg-gray-50">
            <div className="flex justify-end">
              <div className="w-full md:w-80">
                <div className="flex justify-between text-sm">
                  <span>Subtotal servicios</span>
                  <span>{money(totalServicios)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Subtotal repuestos</span>
                  <span>{money(totalRepuestos)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-2">
                  <span>Total factura</span>
                  <span className="text-green-700">{money(factura.monto)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-3 mt-6">
          <Link href={`/admin/ordenes/${orden.id_orden}`} className="px-4 py-2 border rounded hover:bg-gray-50">Ver orden</Link>
          <button onClick={() => window.print()} className="px-4 py-2 border rounded hover:bg-gray-50">Imprimir</button>
        </div>
      </div>
    </div>
  );
}
