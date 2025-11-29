'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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

  const ordenesPendientes = ordenes.filter(o => o.estado === 'pendiente');
  const ordenesEnProceso = ordenes.filter(o => o.estado === 'en_proceso');
  const ordenesRecientes = ordenes.slice(0, 8);
  const clientesRecientes = clientes.slice(0, 6);

  const handleNuevaOrden = () => {
    router.push('/admin/ordenes/new');
  };

  const handleNuevoCliente = () => {
    router.push('/admin/clients/new');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-4xl font-bold text-gray-600">Cargando recepción...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* HEADER - Sticky y grande */}
      <div className="bg-white border-b-4 border-purple-600 shadow-xl sticky top-0 z-10">
        <div className="max-w-[1800px] mx-auto px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-5xl font-bold text-gray-900">📋 Recepción</h1>
              <p className="mt-2 text-2xl text-gray-600">
                {user?.nombre} {user?.apellido}
              </p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                router.push('/login');
              }}
              className="px-8 py-5 bg-red-600 text-white text-xl rounded-2xl hover:bg-red-700 transition-all shadow-xl font-bold"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-[1800px] mx-auto px-8 mt-6">
          <div className="bg-red-100 border-4 border-red-400 text-red-700 px-8 py-6 rounded-2xl text-2xl font-bold">
            {error}
          </div>
        </div>
      )}

      {/* STATS BAR - Contadores grandes */}
      {estadisticas && (
        <div className="max-w-[1800px] mx-auto px-8 py-6">
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl shadow-2xl p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xl font-semibold">Hoy</p>
                  <p className="text-7xl font-bold text-white mt-3">{estadisticas.ordenesHoy}</p>
                </div>
                <div className="text-8xl opacity-80">📋</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-3xl shadow-2xl p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-xl font-semibold">Pendientes</p>
                  <p className="text-7xl font-bold text-white mt-3">{estadisticas.ordenesPendientes}</p>
                </div>
                <div className="text-8xl opacity-80">⏳</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-3xl shadow-2xl p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xl font-semibold">Clientes</p>
                  <p className="text-7xl font-bold text-white mt-3">{estadisticas.clientesRegistrados}</p>
                </div>
                <div className="text-8xl opacity-80">👥</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl shadow-2xl p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-xl font-semibold">Semana</p>
                  <p className="text-7xl font-bold text-white mt-3">{estadisticas.ordenesUltimaSemana}</p>
                </div>
                <div className="text-8xl opacity-80">📊</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ACCIONES RÁPIDAS - Botones grandes */}
      <div className="max-w-[1800px] mx-auto px-8 py-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 gap-8">
          <button
            onClick={handleNuevaOrden}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-2xl p-12 hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] transition-all hover:scale-105"
          >
            <div className="text-center text-white">
              <div className="text-9xl mb-6">➕</div>
              <h3 className="text-4xl font-bold mb-3">NUEVA ORDEN</h3>
              <p className="text-2xl text-blue-100">Crear orden de trabajo</p>
            </div>
          </button>

          <button
            onClick={handleNuevoCliente}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl shadow-2xl p-12 hover:shadow-[0_0_40px_rgba(34,197,94,0.5)] transition-all hover:scale-105"
          >
            <div className="text-center text-white">
              <div className="text-9xl mb-6">👤</div>
              <h3 className="text-4xl font-bold mb-3">NUEVO CLIENTE</h3>
              <p className="text-2xl text-green-100">Registrar en el sistema</p>
            </div>
          </button>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL - Grid de 2 columnas */}
      <div className="max-w-[1800px] mx-auto px-8 pb-8">
        <div className="grid grid-cols-2 gap-8">
          {/* COLUMNA IZQUIERDA - Últimas Órdenes */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-blue-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">📋 Últimas Órdenes</h2>
              <button
                onClick={() => router.push('/admin/ordenes')}
                className="px-6 py-3 bg-blue-600 text-white text-lg rounded-xl hover:bg-blue-700 transition-all font-bold"
              >
                Ver Todas →
              </button>
            </div>

            <div className="space-y-4">
              {ordenesRecientes.length > 0 ? (
                ordenesRecientes.map(orden => (
                  <div
                    key={orden.id_orden}
                    className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border-l-8 border-blue-500 hover:shadow-lg transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-2xl font-bold text-gray-900 mb-2">
                          {orden.vehiculo.placa}
                        </div>
                        <div className="text-xl text-gray-700 font-semibold">
                          {orden.cliente.nombre} {orden.cliente.apellido}
                        </div>
                        <div className="text-lg text-gray-600 mt-1">
                          {orden.vehiculo.marca} {orden.vehiculo.modelo}
                        </div>
                        <div className="text-base text-gray-500 mt-2">
                          {new Date(orden.fecha_apertura).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-4 py-2 rounded-xl text-base font-bold ${getEstadoColor(orden.estado)}`}>
                          {getEstadoLabel(orden.estado)}
                        </span>
                        <div className="text-2xl font-bold text-gray-900 mt-3">
                          ${orden.total_estimado.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 text-2xl text-gray-500">
                  No hay órdenes registradas
                </div>
              )}
            </div>
          </div>

          {/* COLUMNA DERECHA - Clientes */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-green-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900">👥 Clientes</h2>
              <button
                onClick={() => router.push('/admin/clients')}
                className="px-6 py-3 bg-green-600 text-white text-lg rounded-xl hover:bg-green-700 transition-all font-bold"
              >
                Ver Todos →
              </button>
            </div>

            <div className="space-y-4">
              {clientesRecientes.length > 0 ? (
                clientesRecientes.map(cliente => (
                  <button
                    key={cliente.id_cliente}
                    onClick={() => router.push(`/admin/clients/${cliente.id_cliente}`)}
                    className="w-full bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border-l-8 border-green-500 hover:shadow-lg transition-all text-left"
                  >
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {cliente.nombre} {cliente.apellido}
                    </div>
                    {cliente.telefono && (
                      <div className="text-xl text-gray-700 flex items-center gap-3 mb-1">
                        <span>📞</span> {cliente.telefono}
                      </div>
                    )}
                    {cliente.email && (
                      <div className="text-xl text-gray-700 flex items-center gap-3">
                        <span>✉️</span> {cliente.email}
                      </div>
                    )}
                  </button>
                ))
              ) : (
                <div className="text-center py-16 text-2xl text-gray-500">
                  No hay clientes registrados
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
