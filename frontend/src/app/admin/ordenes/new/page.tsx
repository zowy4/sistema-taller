"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

interface Cliente {
  id_cliente: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
}

interface Vehiculo {
  id_vehiculo: number;
  placa: string;
  marca: string;
  modelo: string;
  año: number;
  color: string;
}

interface Servicio {
  id_servicio: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  tiempo_estimado: number;
}

interface Repuesto {
  id_repuesto: number;
  nombre: string;
  codigo: string;
  precio_venta: number;
  stock_actual: number;
}

interface ServicioItem {
  id_servicio: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

interface RepuestoItem {
  id_repuesto: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export default function NuevaOrdenPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  
  const [clienteSeleccionado, setClienteSeleccionado] = useState<number>(0);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<number>(0);
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [estado, setEstado] = useState('pendiente');
  
  const [serviciosCarrito, setServiciosCarrito] = useState<ServicioItem[]>([]);
  const [repuestosCarrito, setRepuestosCarrito] = useState<RepuestoItem[]>([]);
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClientes();
    fetchServicios();
    fetchRepuestos();
  }, []);

  useEffect(() => {
    if (clienteSeleccionado > 0) {
      fetchVehiculos(clienteSeleccionado);
    }
  }, [clienteSeleccionado]);

  const fetchClientes = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/clientes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar clientes');
      const data = await res.json();
      setClientes(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchVehiculos = async (id_cliente: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/vehiculos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar vehículos');
      const allVehiculos = await res.json();
      // Filtrar vehículos del cliente seleccionado
      const vehiculosCliente = allVehiculos.filter((v: any) => v.id_cliente === id_cliente);
      setVehiculos(vehiculosCliente);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchServicios = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/servicios`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar servicios');
      const data = await res.json();
      setServicios(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchRepuestos = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/repuestos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar repuestos');
      const data = await res.json();
      setRepuestos(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const agregarServicio = (servicio: Servicio) => {
    const existe = serviciosCarrito.find(s => s.id_servicio === servicio.id_servicio);
    if (existe) {
      setServiciosCarrito(serviciosCarrito.map(s => 
        s.id_servicio === servicio.id_servicio 
          ? { ...s, cantidad: s.cantidad + 1, subtotal: (s.cantidad + 1) * s.precio_unitario }
          : s
      ));
    } else {
      setServiciosCarrito([...serviciosCarrito, {
        id_servicio: servicio.id_servicio,
        nombre: servicio.nombre,
        cantidad: 1,
        precio_unitario: servicio.precio,
        subtotal: servicio.precio
      }]);
    }
  };

  const agregarRepuesto = (repuesto: Repuesto) => {
    const existe = repuestosCarrito.find(r => r.id_repuesto === repuesto.id_repuesto);
    if (existe) {
      if (existe.cantidad + 1 > repuesto.stock_actual) {
        alert(`Stock insuficiente para ${repuesto.nombre}. Disponible: ${repuesto.stock_actual}`);
        return;
      }
      setRepuestosCarrito(repuestosCarrito.map(r => 
        r.id_repuesto === repuesto.id_repuesto 
          ? { ...r, cantidad: r.cantidad + 1, subtotal: (r.cantidad + 1) * r.precio_unitario }
          : r
      ));
    } else {
      if (repuesto.stock_actual < 1) {
        alert(`No hay stock disponible para ${repuesto.nombre}`);
        return;
      }
      setRepuestosCarrito([...repuestosCarrito, {
        id_repuesto: repuesto.id_repuesto,
        nombre: repuesto.nombre,
        cantidad: 1,
        precio_unitario: repuesto.precio_venta,
        subtotal: repuesto.precio_venta
      }]);
    }
  };

  const eliminarServicio = (id_servicio: number) => {
    setServiciosCarrito(serviciosCarrito.filter(s => s.id_servicio !== id_servicio));
  };

  const eliminarRepuesto = (id_repuesto: number) => {
    setRepuestosCarrito(repuestosCarrito.filter(r => r.id_repuesto !== id_repuesto));
  };

  const calcularTotal = () => {
    const totalServicios = serviciosCarrito.reduce((sum, s) => sum + s.subtotal, 0);
    const totalRepuestos = repuestosCarrito.reduce((sum, r) => sum + r.subtotal, 0);
    return totalServicios + totalRepuestos;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (clienteSeleccionado === 0 || vehiculoSeleccionado === 0) {
      alert('Debe seleccionar un cliente y un vehículo');
      return;
    }
    if (serviciosCarrito.length === 0 && repuestosCarrito.length === 0) {
      alert('Debe agregar al menos un servicio o repuesto');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const profileRes = await fetch(`${API_URL}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!profileRes.ok) throw new Error('Error al obtener perfil');
      const profile = await profileRes.json();

      const ordenData = {
        id_cliente: Number(clienteSeleccionado),
        id_vehiculo: Number(vehiculoSeleccionado),
        notas: `Fecha entrega: ${fechaEntrega}`,
        servicios: serviciosCarrito.map(s => ({
          id_servicio: Number(s.id_servicio),
          cantidad: Number(s.cantidad)
        })),
        repuestos: repuestosCarrito.map(r => ({
          id_repuesto: Number(r.id_repuesto),
          cantidad: Number(r.cantidad)
        }))
      };

      const res = await fetch(`${API_URL}/ordenes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ordenData)
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(JSON.stringify(errData) || 'Error al crear orden');
      }
      toast.success('Orden creada exitosamente', {
        description: 'La orden de trabajo ha sido registrada correctamente'
      });
      router.push('/admin/ordenes');
    } catch (err: any) {
      const errorMsg = err.message || 'Error al crear orden';
      setError(errorMsg);
      toast.error('Error al crear orden', {
        description: errorMsg
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/admin/ordenes" className="text-blue-600 hover:underline text-sm">
            ← Volver a órdenes
          </Link>
          <h2 className="text-2xl font-semibold mt-2">Nueva Orden de Trabajo</h2>
        </div>
        
        {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel izquierdo: Selección */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cliente y Vehículo */}
            <div className="bg-gray-50 p-6 rounded shadow">
              <h3 className="text-lg font-semibold mb-4">Cliente y Vehículo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Cliente *</label>
                  <select 
                    value={clienteSeleccionado} 
                    onChange={(e) => setClienteSeleccionado(Number(e.target.value))} 
                    required 
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value={0}>Seleccione un cliente</option>
                    {clientes.map(c => (
                      <option key={c.id_cliente} value={c.id_cliente}>
                        {c.nombre} {c.apellido}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Vehículo *</label>
                  <select 
                    value={vehiculoSeleccionado} 
                    onChange={(e) => setVehiculoSeleccionado(Number(e.target.value))} 
                    required 
                    disabled={clienteSeleccionado === 0}
                    className="w-full border border-gray-300 rounded px-3 py-2 disabled:bg-gray-200"
                  >
                    <option value={0}>Seleccione un vehículo</option>
                    {vehiculos.map(v => (
                      <option key={v.id_vehiculo} value={v.id_vehiculo}>
                        {v.placa} - {v.marca} {v.modelo} ({v.año})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha Entrega Estimada *</label>
                  <input 
                    type="date" 
                    value={fechaEntrega} 
                    onChange={(e) => setFechaEntrega(e.target.value)} 
                    required 
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Estado *</label>
                  <select 
                    value={estado} 
                    onChange={(e) => setEstado(e.target.value)} 
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="en proceso">En Proceso</option>
                    <option value="completada">Completada</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Servicios */}
            <div className="bg-gray-50 p-6 rounded shadow">
              <h3 className="text-lg font-semibold mb-4">Servicios Disponibles</h3>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {servicios.map(s => (
                  <div key={s.id_servicio} className="flex justify-between items-center bg-white p-3 rounded border">
                    <div>
                      <p className="font-medium">{s.nombre}</p>
                      <p className="text-sm text-gray-600">${s.precio.toFixed(2)}</p>
                    </div>
                    <button 
                      onClick={() => agregarServicio(s)} 
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                    >
                      + Agregar
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Repuestos */}
            <div className="bg-gray-50 p-6 rounded shadow">
              <h3 className="text-lg font-semibold mb-4">Repuestos Disponibles</h3>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {repuestos.map(r => (
                  <div key={r.id_repuesto} className="flex justify-between items-center bg-white p-3 rounded border">
                    <div>
                      <p className="font-medium">{r.nombre}</p>
                      <p className="text-xs text-gray-500">Código: {r.codigo}</p>
                      <p className="text-sm text-gray-600">${r.precio_venta.toFixed(2)} - Stock: {r.stock_actual}</p>
                    </div>
                    <button 
                      onClick={() => agregarRepuesto(r)} 
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm disabled:bg-gray-400"
                      disabled={r.stock_actual === 0}
                    >
                      + Agregar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel derecho: Carrito y Total */}
          <div className="space-y-6">
            {/* Carrito de Servicios */}
            <div className="bg-gray-50 p-6 rounded shadow">
              <h3 className="text-lg font-semibold mb-4">Servicios Agregados</h3>
              {serviciosCarrito.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay servicios agregados</p>
              ) : (
                <div className="space-y-2">
                  {serviciosCarrito.map(s => (
                    <div key={s.id_servicio} className="bg-white p-3 rounded border">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{s.nombre}</p>
                          <p className="text-xs text-gray-600">Cantidad: {s.cantidad} x ${s.precio_unitario.toFixed(2)}</p>
                        </div>
                        <button 
                          onClick={() => eliminarServicio(s.id_servicio)} 
                          className="text-red-600 hover:text-red-800 text-xs ml-2"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-sm font-semibold mt-1">${s.subtotal.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Carrito de Repuestos */}
            <div className="bg-gray-50 p-6 rounded shadow">
              <h3 className="text-lg font-semibold mb-4">Repuestos Agregados</h3>
              {repuestosCarrito.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay repuestos agregados</p>
              ) : (
                <div className="space-y-2">
                  {repuestosCarrito.map(r => (
                    <div key={r.id_repuesto} className="bg-white p-3 rounded border">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{r.nombre}</p>
                          <p className="text-xs text-gray-600">Cantidad: {r.cantidad} x ${r.precio_unitario.toFixed(2)}</p>
                        </div>
                        <button 
                          onClick={() => eliminarRepuesto(r.id_repuesto)} 
                          className="text-red-600 hover:text-red-800 text-xs ml-2"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-sm font-semibold mt-1">${r.subtotal.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total y Acciones */}
            <div className="bg-blue-50 p-6 rounded shadow">
              <h3 className="text-2xl font-bold mb-4">Total: ${calcularTotal().toFixed(2)}</h3>
              <div className="space-y-2">
                <button 
                  onClick={handleSubmit} 
                  disabled={saving || clienteSeleccionado === 0 || vehiculoSeleccionado === 0}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {saving ? 'Creando...' : '✓ Crear Orden'}
                </button>
                <Link 
                  href="/admin/ordenes" 
                  className="block w-full text-center bg-gray-300 text-gray-700 px-6 py-3 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

