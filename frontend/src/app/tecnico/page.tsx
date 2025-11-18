'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

interface Orden {
  id_orden: number;
  fecha_apertura: string;
  fecha_compromiso?: string;
  estado: string;
  total_estimado: number;
  notas?: string;
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
  };
  servicios_asignados: any[];
  repuestos_usados: any[];
}

interface Estadisticas {
  totalOrdenes: number;
  ordenesCompletadas: number;
  ordenesMes: number;
  ordenesSemana: number;
  tiempoPromedioHoras: number;
  tasaCompletitud: string;
}

export default function TecnicoDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [ordenesOriginales, setOrdenesOriginales] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('todas');
  const [busqueda, setBusqueda] = useState<string>('');
  const [ordenesNuevas, setOrdenesNuevas] = useState<number>(0);

  useEffect(() => {
    fetchMisOrdenes();
    fetchEstadisticas();

    // Verificar nuevas órdenes cada 30 segundos
    const interval = setInterval(() => {
      verificarNuevasOrdenes();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [filtroEstado, busqueda, ordenesOriginales]);

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
      setOrdenesOriginales(data);
      setOrdenes(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  };

  const fetchEstadisticas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/ordenes/tecnico/estadisticas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEstadisticas(data);
      }
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  };

  const aplicarFiltros = () => {
    let resultado = [...ordenesOriginales];

    // Filtrar por estado
    if (filtroEstado !== 'todas') {
      resultado = resultado.filter(orden => orden.estado === filtroEstado);
    }

    // Filtrar por búsqueda
    if (busqueda.trim()) {
      const termino = busqueda.toLowerCase();
      resultado = resultado.filter(orden => 
        orden.cliente.nombre.toLowerCase().includes(termino) ||
        orden.cliente.apellido.toLowerCase().includes(termino) ||
        orden.vehiculo.marca.toLowerCase().includes(termino) ||
        orden.vehiculo.modelo.toLowerCase().includes(termino) ||
        orden.vehiculo.placa.toLowerCase().includes(termino)
      );
    }

    setOrdenes(resultado);
  };

  const verificarNuevasOrdenes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/ordenes/tecnico/mis-ordenes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const nuevasPendientes = data.filter((o: Orden) => o.estado === 'pendiente').length;
        const actualesPendientes = ordenesOriginales.filter(o => o.estado === 'pendiente').length;
        
        if (nuevasPendientes > actualesPendientes) {
          setOrdenesNuevas(nuevasPendientes - actualesPendientes);
          // Actualizar la lista
          setOrdenesOriginales(data);
          setOrdenes(data);
        }
      }
    } catch (err) {
      console.error('Error verificando nuevas órdenes:', err);
    }
  };

  const limpiarNotificaciones = () => {
    setOrdenesNuevas(0);
  };

  const handleUpdateEstado = async (id_orden: number, nuevoEstado: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/ordenes/${id_orden}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!response.ok) throw new Error('Error al actualizar estado');

      // Recargar órdenes
      fetchMisOrdenes();
    } catch (err: any) {
      alert(err.message || 'Error al actualizar estado');
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

  const ordenesPendientes = ordenesOriginales.filter(o => o.estado === 'pendiente');
  const ordenesEnProceso = ordenesOriginales.filter(o => o.estado === 'en_proceso');
  const ordenesCompletadas = ordenesOriginales.filter(o => o.estado === 'completada' || o.estado === 'facturada');

  if (loading) {
    return (
      <ProtectedRoute requiredRoles={['tecnico']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-600">Cargando órdenes...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['tecnico']}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Panel del Técnico</h1>
              <p className="mt-2 text-gray-600">
                Bienvenido, {user?.nombre} {user?.apellido}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {ordenesNuevas > 0 && (
                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg px-4 py-3 flex items-center gap-3">
                  <div className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    {ordenesNuevas}
                  </div>
                  <div>
                    <p className="font-semibold text-yellow-900">¡Nuevas órdenes!</p>
                    <p className="text-sm text-yellow-700">{ordenesNuevas} orden{ordenesNuevas > 1 ? 'es' : ''} pendiente{ordenesNuevas > 1 ? 's' : ''}</p>
                  </div>
                  <button
                    onClick={limpiarNotificaciones}
                    className="ml-2 text-yellow-600 hover:text-yellow-800"
                  >
                    ✕
                  </button>
                </div>
              )}
              <Link
                href="/tecnico/inventario"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <span>📦</span>
                Ver Inventario
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  router.push('/login');
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <span>🚪</span>
                Cerrar Sesión
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* KPIs Principales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 overflow-hidden shadow-lg rounded-lg text-white">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium">Pendientes</p>
                    <p className="text-4xl font-bold mt-2">{ordenesPendientes.length}</p>
                  </div>
                  <div className="text-5xl opacity-80">🔧</div>
                </div>
                <p className="text-yellow-100 text-xs mt-4">Órdenes por comenzar</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 overflow-hidden shadow-lg rounded-lg text-white">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">En Proceso</p>
                    <p className="text-4xl font-bold mt-2">{ordenesEnProceso.length}</p>
                  </div>
                  <div className="text-5xl opacity-80">⚡</div>
                </div>
                <p className="text-blue-100 text-xs mt-4">Trabajando actualmente</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 overflow-hidden shadow-lg rounded-lg text-white">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Completadas</p>
                    <p className="text-4xl font-bold mt-2">{ordenesCompletadas.length}</p>
                  </div>
                  <div className="text-5xl opacity-80">✅</div>
                </div>
                <p className="text-green-100 text-xs mt-4">Trabajos terminados</p>
              </div>
            </div>
          </div>

          {/* Estadísticas del Técnico */}
          {estadisticas && (
            <div className="mt-6 bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Mis Estadísticas</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Total Órdenes</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.totalOrdenes}</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded">
                  <p className="text-sm text-blue-600">Esta Semana</p>
                  <p className="text-2xl font-bold text-blue-900">{estadisticas.ordenesSemana}</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded">
                  <p className="text-sm text-purple-600">Este Mes</p>
                  <p className="text-2xl font-bold text-purple-900">{estadisticas.ordenesMes}</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded">
                  <p className="text-sm text-green-600">Tasa Completitud</p>
                  <p className="text-2xl font-bold text-green-900">{estadisticas.tasaCompletitud}%</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded">
                  <p className="text-sm text-orange-600">Tiempo Promedio</p>
                  <p className="text-2xl font-bold text-orange-900">{estadisticas.tiempoPromedioHoras}h</p>
                </div>
              </div>
            </div>
          )}

          {/* Filtros y Búsqueda */}
          <div className="mt-8 bg-white shadow rounded-lg p-4">
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

          {/* Lista de Mis Órdenes */}
          <div className="mt-6 bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Mis Órdenes de Trabajo</h3>
                <span className="text-sm text-gray-500">{ordenes.length} de {ordenesOriginales.length} órdenes</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFiltroEstado('todas')}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    filtroEstado === 'todas' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setFiltroEstado('pendiente')}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    filtroEstado === 'pendiente' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Pendientes
                </button>
                <button
                  onClick={() => setFiltroEstado('en_proceso')}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    filtroEstado === 'en_proceso' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  En Proceso
                </button>
                <button
                  onClick={() => setFiltroEstado('completada')}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    filtroEstado === 'completada' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Completadas
                </button>
              </div>
            </div>
            
            {ordenes.length === 0 ? (
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
                        Fecha Apertura
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Entrega Estimada
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
                    {ordenes.map((orden) => (
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
                          <div className="text-sm text-gray-900">
                            {orden.vehiculo.marca} {orden.vehiculo.modelo}
                          </div>
                          <div className="text-sm text-gray-500">
                            {orden.vehiculo.placa} • {orden.vehiculo.anio}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(orden.fecha_apertura).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {orden.fecha_compromiso ? (
                            <span className="text-green-700 font-medium">
                              {new Date(orden.fecha_compromiso).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          ) : (
                            <span className="text-gray-400">Sin definir</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(orden.estado)}`}>
                            {getEstadoLabel(orden.estado)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <Link
                            href={`/tecnico/ordenes/${orden.id_orden}`}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Ver Detalle
                          </Link>
                          {orden.estado === 'pendiente' && (
                            <button
                              onClick={() => handleUpdateEstado(orden.id_orden, 'en_proceso')}
                              className="text-green-600 hover:text-green-800 font-medium"
                            >
                              Comenzar
                            </button>
                          )}
                          {orden.estado === 'en_proceso' && (
                            <button
                              onClick={() => handleUpdateEstado(orden.id_orden, 'completada')}
                              className="text-purple-600 hover:text-purple-800 font-medium"
                            >
                              Completar
                            </button>
                          )}
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
    </ProtectedRoute>
  );
}
