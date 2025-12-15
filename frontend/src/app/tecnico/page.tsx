'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Orden, ServicioAsignado, RepuestoUsado } from '@/types';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
interface OrdenTecnico extends Omit<Orden, 'fecha_ingreso' | 'total' | 'cliente' | 'vehiculo'> {
  fecha_apertura: string;
  fecha_compromiso?: string;
  total_estimado: number;
  cliente: {
    nombre: string;
    apellido: string;
    telefono?: string;
  };
  vehiculo: {
    marca: string;
    modelo: string;
    anio: number;
    placa: string;
    color?: string;
  };
  servicios_asignados: ServicioAsignado[];
  repuestos_usados: RepuestoUsado[];
}
export default function TecnicoDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [ordenes, setOrdenes] = useState<OrdenTecnico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('todas');
  const [busqueda, setBusqueda] = useState<string>('');
  useEffect(() => {
    fetchMisOrdenes();
  }, []);
  const fetchMisOrdenes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      const response = await fetch(`${API_URL}/ordenes/tecnico/mis-ordenes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }
      if (!response.ok) {
        throw new Error('Error al cargar órdenes');
      }
      const data = await response.json();
      setOrdenes(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar órdenes');
      toast.error('Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  };
  const handleIniciarTrabajo = async (id_orden: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/ordenes/${id_orden}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ estado: 'en_proceso' }),
      });
      if (!response.ok) throw new Error('Error al iniciar trabajo');
      toast.success('Trabajo iniciado correctamente');
      fetchMisOrdenes();
    } catch (err: any) {
      toast.error(err.message || 'Error al iniciar trabajo');
    }
  };
  const handleCompletarTrabajo = async (id_orden: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/ordenes/${id_orden}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ estado: 'completada' }),
      });
      if (!response.ok) throw new Error('Error al completar trabajo');
      toast.success('Trabajo completado exitosamente');
      fetchMisOrdenes();
    } catch (err: any) {
      toast.error(err.message || 'Error al completar trabajo');
    }
  };
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-600';
      case 'en_proceso':
        return 'bg-orange-600/20 text-orange-400 border-orange-600';
      case 'completada':
        return 'bg-green-600/20 text-green-400 border-green-600';
      case 'facturada':
        return 'bg-purple-600/20 text-purple-400 border-purple-600';
      case 'cancelada':
        return 'bg-red-600/20 text-red-400 border-red-600';
      default:
        return 'bg-gray-600/20 text-gray-400 border-gray-600';
    }
  };
  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'en_proceso':
        return 'En Proceso';
      case 'completada':
        return 'Completada';
      case 'facturada':
        return 'Facturada';
      case 'cancelada':
        return 'Cancelada';
      default:
        return estado;
    }
  };
  const ordenesPendientes = ordenes.filter(o => o.estado === 'pendiente');
  const ordenesEnProceso = ordenes.filter(o => o.estado === 'en_proceso');
  const ordenesCompletadas = ordenes.filter(o => o.estado === 'completada');
  const ordenesFiltradas = ordenes.filter(orden => {
    const matchEstado = filtroEstado === 'todas' || orden.estado === filtroEstado;
    const matchBusqueda = !busqueda.trim() || 
      orden.cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      orden.cliente.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
      orden.vehiculo.marca.toLowerCase().includes(busqueda.toLowerCase()) ||
      orden.vehiculo.modelo.toLowerCase().includes(busqueda.toLowerCase()) ||
      orden.vehiculo.placa.toLowerCase().includes(busqueda.toLowerCase());
    return matchEstado && matchBusqueda;
  });
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-gray-400 font-mono">CARGANDO ORDENES...</div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <div 
        className="relative h-[200px] bg-cover bg-center border-b border-gray-800"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1920&q=80')"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/60"></div>
        <div className="relative max-w-[1600px] mx-auto px-8 h-full flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">PANEL TECNICO</h1>
            <p className="mt-2 text-lg text-gray-300 font-mono">
              {user?.nombre} {user?.apellido} - ID: {user?.id}
            </p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              router.push('/login');
            }}
            className="px-6 py-3 bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2 border border-red-500 text-sm font-bold tracking-wide"
          >
            SALIR
          </button>
        </div>
      </div>
      <div className="max-w-[1600px] mx-auto px-8 py-6">
        {error && (
          <div className="mb-6 bg-red-900/30 border border-red-600 text-red-300 px-4 py-3 text-sm font-mono">
            ERROR: {error}
          </div>
        )}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div 
            className="relative h-[180px] bg-cover bg-center overflow-hidden border border-gray-800"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80')"
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-yellow-600/95 via-yellow-600/70 to-transparent"></div>
            <div className="relative h-full p-6 flex flex-col justify-end">
              <p className="text-yellow-100 text-xs font-mono uppercase tracking-wide">Pendientes</p>
              <p className="text-5xl font-black text-white mt-2">{ordenesPendientes.length}</p>
              <p className="text-yellow-100 text-xs mt-3 font-mono">Ordenes por comenzar</p>
            </div>
          </div>
          <div 
            className="relative h-[180px] bg-cover bg-center overflow-hidden border border-gray-800"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80')"
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-orange-600/95 via-orange-600/70 to-transparent"></div>
            <div className="relative h-full p-6 flex flex-col justify-end">
              <p className="text-orange-100 text-xs font-mono uppercase tracking-wide">En Proceso</p>
              <p className="text-5xl font-black text-white mt-2">{ordenesEnProceso.length}</p>
              <p className="text-orange-100 text-xs mt-3 font-mono">Trabajando actualmente</p>
            </div>
          </div>
          <div 
            className="relative h-[180px] bg-cover bg-center overflow-hidden border border-gray-800"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80')"
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-green-600/95 via-green-600/70 to-transparent"></div>
            <div className="relative h-full p-6 flex flex-col justify-end">
              <p className="text-green-100 text-xs font-mono uppercase tracking-wide">Completadas</p>
              <p className="text-5xl font-black text-white mt-2">{ordenesCompletadas.length}</p>
              <p className="text-green-100 text-xs mt-3 font-mono">Trabajos terminados</p>
            </div>
          </div>
        </div>
        <div className="bg-[#1a1a1a] border border-gray-800 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-gray-500 mb-2 uppercase tracking-wide">Estado</label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full px-3 py-2 bg-[#2d2d2d] border border-gray-700 text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-sm font-mono"
              >
                <option value="todas">Todas las órdenes</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En Proceso</option>
                <option value="completada">Completada</option>
                <option value="facturada">Facturada</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-500 mb-2 uppercase tracking-wide">Buscar</label>
              <input
                type="text"
                placeholder="Cliente, vehiculo o placa..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full px-3 py-2 bg-[#2d2d2d] border border-gray-700 text-white focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-sm font-mono placeholder-gray-600"
              />
            </div>
          </div>
        </div>
        <div className="bg-[#1a1a1a] border border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800 bg-[#2d2d2d]">
            <h3 className="text-sm font-mono text-white uppercase tracking-wide">
              Mis Ordenes de Trabajo
              <span className="ml-2 text-xs text-gray-500">
                [{ordenesFiltradas.length}]
              </span>
            </h3>
          </div>
          {ordenesFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-600 text-sm font-mono">
                {busqueda ? 'NO SE ENCONTRARON ORDENES' : 'NO HAY ORDENES ASIGNADAS'}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-[#2d2d2d]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-mono text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-mono text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-mono text-gray-500 uppercase tracking-wider">
                      Vehiculo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-mono text-gray-500 uppercase tracking-wider">
                      Servicios
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-mono text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-mono text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-mono text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[#1a1a1a] divide-y divide-gray-800">
                  {ordenesFiltradas.map((orden) => (
                    <tr key={orden.id_orden} className="hover:bg-[#2d2d2d] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-orange-500 font-bold">
                        #{orden.id_orden.toString().padStart(3, '0')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {orden.cliente.nombre} {orden.cliente.apellido}
                        </div>
                        {orden.cliente.telefono && (
                          <div className="text-xs text-gray-500 font-mono">{orden.cliente.telefono}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white font-mono font-bold">
                          {orden.vehiculo.placa}
                        </div>
                        <div className="text-xs text-gray-500">
                          {orden.vehiculo.marca} {orden.vehiculo.modelo} - {orden.vehiculo.anio}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300">
                          {orden.servicios_asignados.length > 0 ? (
                            <ul className="space-y-1">
                              {orden.servicios_asignados.slice(0, 2).map((sa, idx) => (
                                <li key={`${sa.id_servicio_asignado || sa.servicio.id_servicio}-${idx}`} className="text-xs">- {sa.servicio.nombre}</li>
                              ))}
                              {orden.servicios_asignados.length > 2 && (
                                <li key="more-services" className="text-gray-600 text-xs">+{orden.servicios_asignados.length - 2} mó¡s</li>
                              )}
                            </ul>
                          ) : (
                            <span className="text-gray-600 text-xs">Sin servicios</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                        {new Date(orden.fecha_apertura).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-4 font-mono font-bold uppercase ${getEstadoColor(orden.estado)} border`}>
                          {getEstadoLabel(orden.estado)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs space-x-2">
                        {orden.estado === 'pendiente' && (
                          <button
                            onClick={() => handleIniciarTrabajo(orden.id_orden)}
                            className="text-green-500 hover:text-green-400 font-mono font-bold uppercase"
                          >
                            Iniciar
                          </button>
                        )}
                        {orden.estado === 'en_proceso' && (
                          <button
                            onClick={() => handleCompletarTrabajo(orden.id_orden)}
                            className="text-yellow-500 hover:text-yellow-400 font-mono font-bold uppercase"
                          >
                            Completar
                          </button>
                        )}
                        <Link
                          href={`/admin/ordenes/${orden.id_orden}`}
                          className="text-orange-500 hover:text-orange-400 font-mono font-bold uppercase"
                        >
                          Detalle â†’
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
