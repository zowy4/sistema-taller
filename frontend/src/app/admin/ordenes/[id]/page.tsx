'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Orden {
  id_orden: number;
  fecha_apertura: string;
  fecha_entrega_estimada: string;
  fecha_entrega_real: string | null;
  estado: string;
  total_estimado: number;
  total_real: number | null;
  cliente: {
    id_cliente: number;
    nombre: string;
    apellido: string;
    telefono: string;
    email: string;
  };
  vehiculo: {
    id_vehiculo: number;
    placa: string;
    marca: string;
    modelo: string;
    anio: number;
  };
  empleado_responsable: {
    id_empleado: number;
    nombre: string;
    apellido: string;
  };
  servicios_asignados: Array<{
    id: number;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    servicio: {
      id_servicio: number;
      nombre: string;
      descripcion: string;
    };
  }>;
  repuestos_usados: Array<{
    id: number;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    repuesto: {
      id_repuesto: number;
      nombre: string;
      descripcion: string;
    };
  }>;
  factura?: {
    id_factura: number;
    fecha_factura: string;
    monto: number;
    estado_pago: string;
    metodo_pago: string | null;
  };
}

export default function OrdenDetallePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [orden, setOrden] = useState<Orden | null>(null);
  const [loading, setLoading] = useState(true);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [facturando, setFacturando] = useState(false);
  const [mostrarModalFactura, setMostrarModalFactura] = useState(false);
  const [metodoPago, setMetodoPago] = useState('');

  useEffect(() => {
    if (id) {
      fetchOrden();
    }
  }, [id]);

  const fetchOrden = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3002/ordenes/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrden(data);
      } else {
        alert('Error al cargar la orden');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar la orden');
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (nuevoEstado: string) => {
    if (!confirm(`¿Cambiar estado a "${nuevoEstado}"?`)) return;

    setCambiandoEstado(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3002/ordenes/${id}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (response.ok) {
        const data = await response.json();
        setOrden(data);
        alert('Estado actualizado correctamente');
      } else {
        const error = await response.json();
        alert(error.message || 'Error al cambiar estado');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cambiar estado');
    } finally {
      setCambiandoEstado(false);
    }
  };

  const generarFactura = async () => {
    if (!metodoPago) {
      alert('Selecciona un método de pago');
      return;
    }

    setFacturando(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3002/facturas/facturar/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ metodo_pago: metodoPago }),
      });

      if (response.ok) {
        const factura = await response.json();
        alert(`Factura #${factura.id_factura} generada correctamente`);
        setMostrarModalFactura(false);
        fetchOrden(); // Recargar orden
      } else {
        const error = await response.json();
        alert(error.message || 'Error al generar factura');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al generar factura');
    } finally {
      setFacturando(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const estilos: Record<string, string> = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      en_proceso: 'bg-blue-100 text-blue-800',
      completado: 'bg-green-100 text-green-800',
      entregado: 'bg-gray-100 text-gray-800',
      cancelado: 'bg-red-100 text-red-800',
    };

    return estilos[estado] || 'bg-gray-100 text-gray-800';
  };

  const formatFecha = (fecha: string | null) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(monto);
  };

  const calcularTotal = () => {
    if (!orden) return 0;
    const serviciosTotal = orden.servicios_asignados.reduce((sum, s) => sum + s.subtotal, 0);
    const repuestosTotal = orden.repuestos_usados.reduce((sum, r) => sum + r.subtotal, 0);
    return serviciosTotal + repuestosTotal;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Cargando orden...</div>
      </div>
    );
  }

  if (!orden) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Orden no encontrada</h1>
          <button
            onClick={() => router.push('/admin/ordenes')}
            className="text-blue-600 hover:underline"
          >
            Volver a órdenes
          </button>
        </div>
      </div>
    );
  }

  const puedeFacturar = orden.estado === 'completado' && !orden.factura;
  const total = orden.total_real || calcularTotal();

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/ordenes')}
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          ← Volver a órdenes
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Orden #{orden.id_orden}</h1>
            <p className="text-gray-600 mt-1">
              Creada el {formatFecha(orden.fecha_apertura)}
            </p>
          </div>
          <div className="text-right">
            <div className={`inline-block px-4 py-2 rounded-lg font-medium ${getEstadoBadge(orden.estado)}`}>
              {orden.estado.toUpperCase()}
            </div>
            {orden.factura && (
              <div className="mt-2 text-sm text-green-600 font-medium">
                ✓ Facturada
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Información del Cliente y Vehículo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Cliente</h2>
          <div className="space-y-2">
            <div>
              <span className="text-gray-600">Nombre:</span>
              <span className="ml-2 font-medium">
                {orden.cliente.nombre} {orden.cliente.apellido}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Email:</span>
              <span className="ml-2">{orden.cliente.email}</span>
            </div>
            <div>
              <span className="text-gray-600">Teléfono:</span>
              <span className="ml-2">{orden.cliente.telefono}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Vehículo</h2>
          <div className="space-y-2">
            <div>
              <span className="text-gray-600">Placa:</span>
              <span className="ml-2 font-medium">{orden.vehiculo.placa}</span>
            </div>
            <div>
              <span className="text-gray-600">Marca/Modelo:</span>
              <span className="ml-2">
                {orden.vehiculo.marca} {orden.vehiculo.modelo}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Año:</span>
              <span className="ml-2">{orden.vehiculo.anio}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Servicios */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Servicios</h2>
        {orden.servicios_asignados.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Servicio</th>
                <th className="px-4 py-2 text-center">Cantidad</th>
                <th className="px-4 py-2 text-right">Precio Unit.</th>
                <th className="px-4 py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {orden.servicios_asignados.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-2">{item.servicio.nombre}</td>
                  <td className="px-4 py-2 text-center">{item.cantidad}</td>
                  <td className="px-4 py-2 text-right">{formatMonto(item.precio_unitario)}</td>
                  <td className="px-4 py-2 text-right font-medium">{formatMonto(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">No hay servicios asignados</p>
        )}
      </div>

      {/* Repuestos */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Repuestos</h2>
        {orden.repuestos_usados.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Repuesto</th>
                <th className="px-4 py-2 text-center">Cantidad</th>
                <th className="px-4 py-2 text-right">Precio Unit.</th>
                <th className="px-4 py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {orden.repuestos_usados.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-2">{item.repuesto.nombre}</td>
                  <td className="px-4 py-2 text-center">{item.cantidad}</td>
                  <td className="px-4 py-2 text-right">{formatMonto(item.precio_unitario)}</td>
                  <td className="px-4 py-2 text-right font-medium">{formatMonto(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">No hay repuestos usados</p>
        )}
      </div>

      {/* Total */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center text-2xl font-bold">
          <span>Total:</span>
          <span className="text-green-600">{formatMonto(total)}</span>
        </div>
      </div>

      {/* Acciones */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Acciones</h2>
        <div className="flex gap-4 flex-wrap">
          {orden.estado === 'pendiente' && (
            <button
              onClick={() => cambiarEstado('en_proceso')}
              disabled={cambiandoEstado}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Iniciar Trabajo
            </button>
          )}

          {orden.estado === 'en_proceso' && (
            <button
              onClick={() => cambiarEstado('completado')}
              disabled={cambiandoEstado}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              Marcar como Completado
            </button>
          )}

          {puedeFacturar && (
            <button
              onClick={() => setMostrarModalFactura(true)}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
            >
              Generar Factura
            </button>
          )}

          {orden.factura && (
            <button
              onClick={() => router.push(`/admin/facturas/${orden.factura?.id_factura}`)}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Ver Factura
            </button>
          )}
        </div>
      </div>

      {/* Modal Facturar */}
      {mostrarModalFactura && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Generar Factura</h2>
            <p className="text-gray-600 mb-4">
              Total a facturar: <span className="font-bold text-lg">{formatMonto(total)}</span>
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Método de Pago</label>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Seleccionar...</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
            <div className="flex gap-4">
              <button
                onClick={generarFactura}
                disabled={facturando || !metodoPago}
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {facturando ? 'Generando...' : 'Confirmar'}
              </button>
              <button
                onClick={() => setMostrarModalFactura(false)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
