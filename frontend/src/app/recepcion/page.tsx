'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

interface Orden {
  id_orden: number;
  fecha_apertura: string;
  estado: string;
  total_estimado: number;
  cliente: {
    nombre: string;
    apellido: string;
    telefono?: string;
  };
  vehiculo: {
    marca: string;
    modelo: string;
    placa: string;
  };
}

interface Cliente {
  id_cliente: number;
  nombre: string;
  apellido: string;
  telefono?: string;
  email?: string;
}

interface Estadisticas {
  ordenesHoy: number;
  ordenesPendientes: number;
  clientesRegistrados: number;
  ordenesUltimaSemana: number;
}

export default function RecepcionDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const headers = { 'Authorization': `Bearer ${token}` };

      const [ordenesRes, clientesRes] = await Promise.all([
        fetch(`${API_URL}/ordenes`, { headers }),
        fetch(`${API_URL}/clientes`, { headers }),
      ]);

      if (ordenesRes.status === 401 || clientesRes.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      const ordenesData = await ordenesRes.json();
      const clientesData = await clientesRes.json();

      setOrdenes(ordenesData);
      setClientes(clientesData);

      // Calcular estadísticas
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const hace7dias = new Date();
      hace7dias.setDate(hace7dias.getDate() - 7);

      const stats: Estadisticas = {
        ordenesHoy: ordenesData.filter((o: Orden) => {
          const fechaOrden = new Date(o.fecha_apertura);
          fechaOrden.setHours(0, 0, 0, 0);
          return fechaOrden.getTime() === hoy.getTime();
        }).length,
        ordenesPendientes: ordenesData.filter((o: Orden) => o.estado === 'pendiente').length,
        clientesRegistrados: clientesData.length,
        ordenesUltimaSemana: ordenesData.filter((o: Orden) => 
          new Date(o.fecha_apertura) >= hace7dias
        ).length,
      };

      setEstadisticas(stats);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
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
      default:
        return estado;
    }
  };

  const clientesFiltrados = busqueda.trim()
    ? clientes.filter(c =>
        c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.telefono?.includes(busqueda) ||
        c.email?.toLowerCase().includes(busqueda.toLowerCase())
      )
    : clientes.slice(0, 5);

  if (loading) {
    return (
      <ProtectedRoute requiredRoles={['recepcion']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-600">Cargando panel de recepción...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRoles={['recepcion']}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Panel de Recepción</h1>
              <p className="mt-2 text-gray-600">
                Bienvenido, {user?.nombre} {user?.apellido}
              </p>
            </div>
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

          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Estadísticas */}
          {estadisticas && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 overflow-hidden shadow-lg rounded-lg text-white">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Órdenes Hoy</p>
                      <p className="text-4xl font-bold mt-2">{estadisticas.ordenesHoy}</p>
                    </div>
                    <div className="text-5xl opacity-80">📋</div>
                  </div>
                  <p className="text-blue-100 text-xs mt-4">Órdenes creadas hoy</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 overflow-hidden shadow-lg rounded-lg text-white">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm font-medium">Pendientes</p>
                      <p className="text-4xl font-bold mt-2">{estadisticas.ordenesPendientes}</p>
                    </div>
                    <div className="text-5xl opacity-80">⏳</div>
                  </div>
                  <p className="text-yellow-100 text-xs mt-4">Órdenes por atender</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 overflow-hidden shadow-lg rounded-lg text-white">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Clientes</p>
                      <p className="text-4xl font-bold mt-2">{estadisticas.clientesRegistrados}</p>
                    </div>
                    <div className="text-5xl opacity-80">👥</div>
                  </div>
                  <p className="text-green-100 text-xs mt-4">Total registrados</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 overflow-hidden shadow-lg rounded-lg text-white">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Esta Semana</p>
                      <p className="text-4xl font-bold mt-2">{estadisticas.ordenesUltimaSemana}</p>
                    </div>
                    <div className="text-5xl opacity-80">📊</div>
                  </div>
                  <p className="text-purple-100 text-xs mt-4">Órdenes últimos 7 días</p>
                </div>
              </div>
            </div>
          )}

          {/* Acciones Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link
              href="/admin/ordenes/new"
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border-2 border-blue-200 hover:border-blue-400"
            >
              <div className="flex items-center gap-4">
                <div className="text-5xl">➕</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Nueva Orden de Trabajo</h3>
                  <p className="text-gray-600 text-sm mt-1">Crear una nueva orden para un cliente</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/clients/new"
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow border-2 border-green-200 hover:border-green-400"
            >
              <div className="flex items-center gap-4">
                <div className="text-5xl">👤</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Registrar Cliente</h3>
                  <p className="text-gray-600 text-sm mt-1">Agregar un nuevo cliente al sistema</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Últimas Órdenes y Clientes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Últimas Órdenes */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Últimas Órdenes</h3>
                  <Link href="/admin/ordenes" className="text-blue-600 hover:underline text-sm">
                    Ver todas →
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {ordenes.length > 0 ? (
                  <div className="space-y-3">
                    {ordenes.slice(0, 5).map(orden => (
                      <div key={orden.id_orden} className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {orden.cliente.nombre} {orden.cliente.apellido}
                          </p>
                          <p className="text-sm text-gray-600">
                            {orden.vehiculo.marca} {orden.vehiculo.modelo} - {orden.vehiculo.placa}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(orden.fecha_apertura).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getEstadoColor(orden.estado)}`}>
                            {getEstadoLabel(orden.estado)}
                          </span>
                          <p className="text-sm font-semibold text-gray-900 mt-1">
                            ${orden.total_estimado.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No hay órdenes registradas</p>
                )}
              </div>
            </div>

            {/* Búsqueda de Clientes */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Clientes</h3>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Buscar cliente..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {clientesFiltrados.length > 0 ? (
                  <div className="space-y-3">
                    {clientesFiltrados.map(cliente => (
                      <Link
                        key={cliente.id_cliente}
                        href={`/admin/clients/${cliente.id_cliente}`}
                        className="block p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                      >
                        <p className="font-medium text-gray-900">
                          {cliente.nombre} {cliente.apellido}
                        </p>
                        {cliente.telefono && (
                          <p className="text-sm text-gray-600">📞 {cliente.telefono}</p>
                        )}
                        {cliente.email && (
                          <p className="text-sm text-gray-600">✉️ {cliente.email}</p>
                        )}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    {busqueda ? 'No se encontraron clientes' : 'No hay clientes registrados'}
                  </p>
                )}
                {!busqueda && clientes.length > 5 && (
                  <Link
                    href="/admin/clients"
                    className="block text-center text-blue-600 hover:underline text-sm mt-4"
                  >
                    Ver todos los clientes →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
