'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

interface Servicio {
  id_servicio: number;
  nombre: string;
  descripcion?: string;
}

interface ServicioAsignado {
  id_servicio_asignado: number;
  servicio: Servicio;
}

interface Orden {
  id_orden: number;
  fecha_apertura: string;
  fecha_compromiso?: string;
  estado: string;
  total_estimado: number;
  notas?: string;
  descripcion_problema?: string;
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
  repuestos_usados: any[];
}

export default function TecnicoDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
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

      toast.success('¡Trabajo completado! 🎉');
      fetchMisOrdenes();
    } catch (err: any) {
      toast.error(err.message || 'Error al completar trabajo');
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'en_proceso':
        return 'bg-blue-100 text-blue-800';
      case 'completada':
        return 'bg-green-100 text-green-800';
      case 'facturada':
        return 'bg-purple-100 text-purple-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
  const ordenesCompletadas = ordenes.filter(o => o.estado === 'completada' || o.estado === 'facturada');

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-gray-600">Cargando órdenes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* HEADER */}
      <div className="bg-white border-b-4 border-blue-600 shadow-xl">
        <div className="max-w-[1600px] mx-auto px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-5xl font-bold text-gray-900">Panel del Técnico</h1>
              <p className="mt-2 text-xl text-gray-600">
                Bienvenido, {user?.nombre} {user?.apellido}
              </p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                router.push('/login');
              }}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <span>🚪</span>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8 py-5">
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Pendientes</p>
                <p className="text-4xl font-bold mt-2">{ordenesPendientes.length}</p>
              </div>
              <div className="text-5xl opacity-80">⏳</div>
            </div>
            <p className="text-yellow-100 text-xs mt-4">Órdenes por comenzar</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-blue-100 text-sm font-medium">En Proceso</p>
                <p className="text-4xl font-bold mt-2">{ordenesEnProceso.length}</p>
              </div>
              <div className="text-5xl opacity-80">⚡</div>
            </div>
            <p className="text-blue-100 text-xs mt-4">Trabajando actualmente</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-green-100 text-sm font-medium">Completadas</p>
                <p className="text-4xl font-bold mt-2">{ordenesCompletadas.length}</p>
              </div>
              <div className="text-5xl opacity-80">✅</div>
            </div>
            <p className="text-green-100 text-xs mt-4">Trabajos terminados</p>
          </div>
        </div>

        {/* FILTROS Y BÚSQUEDA */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todas">Todas las órdenes</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En Proceso</option>
                <option value="completada">Completada</option>
                <option value="facturada">Facturada</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <input
                type="text"
                placeholder="Cliente, vehículo o placa..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* TABLA DE ÓRDENES */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Mis Órdenes de Trabajo
              <span className="ml-2 text-sm text-gray-500">
                ({ordenesFiltradas.length} {ordenesFiltradas.length === 1 ? 'orden' : 'órdenes'})
              </span>
            </h3>
          </div>

          {ordenesFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🔧</div>
              <p className="text-gray-600">
                {busqueda ? 'No se encontraron órdenes con ese criterio' : 'No tienes órdenes asignadas actualmente'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orden
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehículo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Servicios
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Apertura
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ordenesFiltradas.map((orden) => (
                    <tr key={orden.id_orden} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{orden.id_orden.toString().padStart(3, '0')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {orden.cliente.nombre} {orden.cliente.apellido}
                        </div>
                        {orden.cliente.telefono && (
                          <div className="text-sm text-gray-500">{orden.cliente.telefono}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          {orden.vehiculo.placa}
                        </div>
                        <div className="text-sm text-gray-500">
                          {orden.vehiculo.marca} {orden.vehiculo.modelo} • {orden.vehiculo.anio}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {orden.servicios_asignados.length > 0 ? (
                            <ul className="list-disc list-inside">
                              {orden.servicios_asignados.slice(0, 2).map((sa) => (
                                <li key={sa.id_servicio_asignado}>{sa.servicio.nombre}</li>
                              ))}
                              {orden.servicios_asignados.length > 2 && (
                                <li className="text-gray-500">+{orden.servicios_asignados.length - 2} más</li>
                              )}
                            </ul>
                          ) : (
                            <span className="text-gray-400">Sin servicios</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(orden.fecha_apertura).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(orden.estado)}`}>
                          {getEstadoLabel(orden.estado)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        {orden.estado === 'pendiente' && (
                          <button
                            onClick={() => handleIniciarTrabajo(orden.id_orden)}
                            className="text-green-600 hover:text-green-800 font-medium"
                          >
                            Comenzar
                          </button>
                        )}
                        {orden.estado === 'en_proceso' && (
                          <button
                            onClick={() => handleCompletarTrabajo(orden.id_orden)}
                            className="text-purple-600 hover:text-purple-800 font-medium"
                          >
                            Completar
                          </button>
                        )}
                        <Link
                          href={`/admin/ordenes/${orden.id_orden}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Ver Detalle
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
