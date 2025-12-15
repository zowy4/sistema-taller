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
        return 'bg-yellow-600/20 border border-yellow-600 text-yellow-500';
      case 'en_proceso':
        return 'bg-blue-600/20 border border-blue-600 text-blue-500';
      case 'completada':
        return 'bg-green-600/20 border border-green-600 text-green-500';
      case 'facturada':
        return 'bg-purple-600/20 border border-purple-600 text-purple-500';
      default:
        return 'bg-gray-600/20 border border-gray-600 text-gray-500';
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
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-4xl font-bold text-gray-400">Cargando recepción...</div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#0f0f0f] relative">
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-10 pointer-events-none"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1920&q=80')"
        }}
      ></div>
      <div className="bg-[#1a1a1a] border-b-2 border-orange-500 shadow-xl sticky top-0 z-10 relative">
        <div className="max-w-[1800px] mx-auto px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-baseline gap-2">
              <div className="w-1 h-6 bg-orange-500"></div>
              <div>
                <h1 className="text-xl font-black text-white uppercase tracking-tight font-mono">
                  RECEPCION
                </h1>
                <p className="text-xs text-gray-600 font-mono tracking-wider uppercase">
                  {user?.nombre?.toUpperCase()} {user?.apellido?.toUpperCase()}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                router.push('/login');
              }}
              className="px-4 py-2 bg-[#0a0a0a] border border-red-500/50 text-red-500 text-xs hover:border-red-500 hover:bg-[#1a1a1a] transition-all font-bold uppercase font-mono tracking-wider"
            >
              SALIR
            </button>
          </div>
        </div>
      </div>
      {error && (
        <div className="max-w-[1800px] mx-auto px-8 mt-6 relative z-10">
          <div className="bg-red-600/20 border border-red-600 text-red-500 px-8 py-6 text-2xl font-bold">
            {error}
          </div>
        </div>
      )}
      {estadisticas && (
        <div className="max-w-[1800px] mx-auto px-8 py-6 relative z-10">
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] hover:border-orange-500/50 transition-all p-5">
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-[10px] text-gray-600 font-mono tracking-widest uppercase">ORDENES.HOY</span>
                <div className="w-2 h-2 bg-orange-500"></div>
              </div>
              <div className="mb-2">
                <p className="text-4xl font-black text-white font-mono tabular-nums">{estadisticas.ordenesHoy}</p>
              </div>
              <div className="h-[1px] bg-gradient-to-r from-orange-500 to-transparent"></div>
            </div>
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] hover:border-yellow-500/50 transition-all p-5">
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-[10px] text-gray-600 font-mono tracking-widest uppercase">ORD.PENDIENTES</span>
                <div className="w-2 h-2 bg-yellow-500 animate-pulse"></div>
              </div>
              <div className="mb-2">
                <p className="text-4xl font-black text-white font-mono tabular-nums">{estadisticas.ordenesPendientes}</p>
              </div>
              <div className="h-[1px] bg-gradient-to-r from-yellow-500 to-transparent"></div>
            </div>
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] hover:border-green-500/50 transition-all p-5">
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-[10px] text-gray-600 font-mono tracking-widest uppercase">CLIENTES.REG</span>
                <div className="w-2 h-2 bg-green-500"></div>
              </div>
              <div className="mb-2">
                <p className="text-4xl font-black text-white font-mono tabular-nums">{estadisticas.clientesRegistrados}</p>
              </div>
              <div className="h-[1px] bg-gradient-to-r from-green-500 to-transparent"></div>
            </div>
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] hover:border-blue-500/50 transition-all p-5">
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-[10px] text-gray-600 font-mono tracking-widest uppercase">ORD.SEMANA</span>
                <div className="w-2 h-2 bg-blue-500"></div>
              </div>
              <div className="mb-2">
                <p className="text-4xl font-black text-white font-mono tabular-nums">{estadisticas.ordenesUltimaSemana}</p>
              </div>
              <div className="h-[1px] bg-gradient-to-r from-blue-500 to-transparent"></div>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-[1800px] mx-auto px-8 py-6 relative z-10">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleNuevaOrden}
            className="bg-[#0a0a0a] border border-orange-500/50 hover:border-orange-500 hover:bg-[#1a1a1a] transition-all p-6 text-left"
          >
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-[10px] text-orange-500 font-mono tracking-widest uppercase">ACCION.01</span>
              <div className="w-2 h-2 bg-orange-500"></div>
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight font-mono mb-2">NUEVA ORDEN</h3>
            <p className="text-xs text-gray-600 font-mono">CREAR TRABAJO</p>
          </button>
          <button
            onClick={handleNuevoCliente}
            className="bg-[#0a0a0a] border border-green-500/50 hover:border-green-500 hover:bg-[#1a1a1a] transition-all p-6 text-left"
          >
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-[10px] text-green-500 font-mono tracking-widest uppercase">ACCION.02</span>
              <div className="w-2 h-2 bg-green-500"></div>
            </div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight font-mono mb-2">NUEVO CLIENTE</h3>
            <p className="text-xs text-gray-600 font-mono">REGISTRAR</p>
          </button>
        </div>
      </div>
      <div className="max-w-[1800px] mx-auto px-8 pb-8 relative z-10">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
            <div className="flex justify-between items-center mb-4 border-b border-[#1a1a1a] pb-3">
              <div className="flex items-baseline gap-2">
                <div className="w-1 h-4 bg-orange-500"></div>
                <h2 className="text-sm font-black text-white uppercase tracking-tight font-mono">ULTIMAS ORDENES</h2>
              </div>
              <button
                onClick={() => router.push('/admin/ordenes')}
                className="text-xs text-orange-500 hover:text-orange-400 font-mono uppercase"
              >
                → VER TODAS
              </button>
            </div>
            <div className="space-y-2">
              {ordenesRecientes.length > 0 ? (
                ordenesRecientes.map(orden => (
                  <div
                    key={orden.id_orden}
                    className="bg-[#1a1a1a] border border-[#2a2a2a] hover:border-orange-500/50 transition-all p-4 border-l-2 border-l-orange-500"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-sm font-black text-orange-500 mb-1 font-mono">
                          {orden.vehiculo.placa}
                        </div>
                        <div className="text-xs text-white font-bold">
                          {orden.cliente.nombre} {orden.cliente.apellido}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {orden.vehiculo.marca} {orden.vehiculo.modelo}
                        </div>
                        <div className="text-[10px] text-gray-600 mt-1 font-mono">
                          {new Date(orden.fecha_apertura).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-[10px] font-bold ${getEstadoColor(orden.estado)}`}>
                          {getEstadoLabel(orden.estado)}
                        </span>
                        <div className="text-lg font-black text-white mt-2 font-mono tabular-nums">
                          ${orden.total_estimado.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-gray-600 font-mono">
                  NO HAY ORDENES
                </div>
              )}
            </div>
          </div>
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-6">
            <div className="flex justify-between items-center mb-4 border-b border-[#1a1a1a] pb-3">
              <div className="flex items-baseline gap-2">
                <div className="w-1 h-4 bg-green-500"></div>
                <h2 className="text-sm font-black text-white uppercase tracking-tight font-mono">Clientes</h2>
              </div>
              <button
                onClick={() => router.push('/admin/clients')}
                className="text-xs text-green-500 hover:text-green-400 font-mono uppercase"
              >
                → VER TODOS
              </button>
            </div>
            <div className="space-y-2">
              {clientesRecientes.length > 0 ? (
                clientesRecientes.map(cliente => (
                  <button
                    key={cliente.id_cliente}
                    onClick={() => router.push(`/admin/clients/${cliente.id_cliente}`)}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] hover:border-green-500/50 transition-all text-left p-4 border-l-2 border-l-green-500"
                  >
                    <div className="text-xs font-black text-white mb-2">
                      {cliente.nombre} {cliente.apellido}
                    </div>
                    {cliente.telefono && (
                      <div className="text-[10px] text-gray-500 mb-1 font-mono">
                        TEL: {cliente.telefono}
                      </div>
                    )}
                    {cliente.email && (
                      <div className="text-[10px] text-gray-500 font-mono truncate">
                        {cliente.email}
                      </div>
                    )}
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-gray-600 font-mono">
                  NO HAY CLIENTES
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
