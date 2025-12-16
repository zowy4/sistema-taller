'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchMiPerfil,
  fetchMisVehiculos,
  fetchMisOrdenes,
  type PerfilCliente,
  type VehiculoPortal,
  type OrdenPortal,
} from '@/services/portal.service';
export default function PortalPage() {
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  useEffect(() => {
    if (!token) {
      toast.error('Sesión expirada', {
        description: 'Por favor, inicia sesión nuevamente',
      });
      router.push('/login');
    }
  }, [token, router]);
  const { data: perfil, isLoading: perfilLoading, error: perfilError } = useQuery({
    queryKey: ['portal-perfil'],
    queryFn: async () => {
      return await fetchMiPerfil(token!);
    },
    enabled: !!token,
    retry: 1,
  });
  const { data: vehiculos = [], isLoading: vehiculosLoading, error: vehiculosError } = useQuery({
    queryKey: ['portal-vehiculos'],
    queryFn: async () => {
      return await fetchMisVehiculos(token!);
    },
    enabled: !!token,
    retry: 1,
  });
  const { data: ordenes = [], isLoading: ordenesLoading, error: ordenesError } = useQuery({
    queryKey: ['portal-ordenes'],
    queryFn: async () => {
      return await fetchMisOrdenes(token!);
    },
    enabled: !!token,
    retry: 1,
  });
  useEffect(() => {
    if (perfilError && perfilError.message === 'UNAUTHORIZED') {
      localStorage.removeItem('token');
      toast.error('Sesión expirada');
      router.push('/login');
    }
  }, [perfilError, vehiculosError, ordenesError, router]);
  const ordenesActivas = ordenes.filter((o) => 
    o.estado === 'pendiente' || o.estado === 'en_proceso' || o.estado === 'esperando_repuestos'
  );
  const ordenesCompletadas = ordenes.filter((o) => 
    o.estado === 'completada' || o.estado === 'entregada'
  );
  const vehiculosEnTaller = vehiculos.filter((v) => v.orden_activa);
  const formatCurrency = (amount: number | null | undefined) => {
    if (amount == null || isNaN(amount)) {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'USD',
      }).format(0);
    }
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };
  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, { color: string; label: string; icon: string }> = {
      pendiente: { color: 'bg-gray-600/20 text-gray-400 border border-gray-600', label: 'PENDIENTE', icon: '' },
      en_proceso: { color: 'bg-orange-600/20 text-orange-400 border border-orange-600', label: 'EN PROCESO', icon: '”§' },
      esperando_repuestos: { color: 'bg-yellow-600/20 text-yellow-400 border border-yellow-600', label: 'ESPERANDO', icon: '“¦' },
      completada: { color: 'bg-green-600/20 text-green-400 border border-green-600', label: 'COMPLETADA', icon: '…' },
      entregada: { color: 'bg-green-600/20 text-green-400 border border-green-600', label: 'ENTREGADA', icon: '—' },
      cancelada: { color: 'bg-red-600/20 text-red-400 border border-red-600', label: 'CANCELADA', icon: 'Œ' },
    };
    const badge = badges[estado] || badges.pendiente;
    return (
      <span className={`px-3 py-1 text-xs font-mono font-bold ${badge.color}`}>
        {badge.icon} {badge.label}
      </span>
    );
  };
  if (perfilLoading || vehiculosLoading || ordenesLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400 font-mono">CARGANDO PORTAL...</p>
        </div>
      </div>
    );
  }
  if (!perfil) {
    return null;
  }
  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <div className="bg-[#1a1a1a] border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                PORTAL CLIENTE
              </div>
              <div className="border-l border-gray-700 pl-6">
                <h2 className="text-lg font-bold text-white">
                  {perfil.nombre} {perfil.apellido}
                </h2>
                <p className="text-xs text-gray-500 font-mono">{perfil.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right bg-[#2d2d2d] px-4 py-2 border border-gray-700">
                <p className="text-xs text-gray-500 font-mono uppercase">Total Invertido</p>
                <p className="text-xl font-black text-orange-500">
                  {formatCurrency(vehiculos.reduce((sum, v) => sum + v.total_gastado, 0))}
                </p>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  toast.info('Sesion cerrada');
                  router.push('/login');
                }}
                className="px-5 py-2.5 text-white bg-red-600 hover:bg-red-700 font-bold text-sm tracking-wide transition-colors border border-red-500"
              >
                SALIR
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-[1920px] mx-auto px-8 py-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1a1a1a] border border-gray-800 p-4 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-mono uppercase">Vehiculos</p>
                <p className="text-3xl font-black text-blue-500">{vehiculos.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 flex items-center justify-center">
                <span className="text-2xl">V</span>
              </div>
            </div>
          </div>
          <div className="bg-[#1a1a1a] border border-gray-800 p-4 border-l-4 border-l-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-mono uppercase">En Taller</p>
                <p className="text-3xl font-black text-orange-500">{ordenesActivas.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 flex items-center justify-center">
                <span className="text-2xl">T</span>
              </div>
            </div>
          </div>
          <div className="bg-[#1a1a1a] border border-gray-800 p-4 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-mono uppercase">Completadas</p>
                <p className="text-3xl font-black text-green-500">{ordenesCompletadas.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 flex items-center justify-center">
                <span className="text-2xl">C</span>
              </div>
            </div>
          </div>
          <div className="bg-[#1a1a1a] border border-gray-800 p-4 border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-mono uppercase">Servicios</p>
                <p className="text-3xl font-black text-purple-500">{ordenes.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 flex items-center justify-center">
                <span className="text-2xl">S</span>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-1 space-y-6">{vehiculos.length > 0 ? (
              <div className="bg-[#1a1a1a] border border-gray-800 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 py-4 border-b border-orange-400/30">
                  <h3 className="text-sm font-black tracking-wide uppercase">MIS VEHICULOS</h3>
                </div>
                <div className="divide-y divide-gray-800">
                  {vehiculos.map((vehiculo) => {
                    const carImageUrl = `https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80`;
                    return (
                      <div key={vehiculo.id_vehiculo} className="relative overflow-hidden group">
                        <div 
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                          style={{ backgroundImage: `url('${vehiculo.foto_url || carImageUrl}')` }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40"></div>
                        <div className="relative p-6">
                          <h4 className="font-black text-white text-xl mb-1">
                            {vehiculo.marca} {vehiculo.modelo}
                          </h4>
                          <p className="text-sm text-gray-300 font-mono">{vehiculo.patente} - {vehiculo.anio}</p>
                          {vehiculo.color && (
                            <p className="text-xs text-gray-500 uppercase tracking-wide">{vehiculo.color}</p>
                          )}
                          <div className="mt-4 grid grid-cols-2 gap-2">
                            <div className="bg-blue-600/20 border border-blue-600 px-3 py-2">
                              <p className="text-xs text-blue-400 font-mono">SERVICIOS</p>
                              <p className="text-xl font-black text-blue-400">{vehiculo.ordenes_completadas}</p>
                            </div>
                            <div className="bg-green-600/20 border border-green-600 px-3 py-2">
                              <p className="text-xs text-green-400 font-mono">GASTADO</p>
                              <p className="text-sm font-black text-green-400">
                                {formatCurrency(vehiculo.total_gastado)}
                              </p>
                            </div>
                          </div>
                          {vehiculo.orden_activa && (
                            <div className="mt-3 bg-orange-600/30 border border-orange-500 px-3 py-2 animate-pulse-safety">
                              <p className="text-xs font-mono font-bold text-orange-400 uppercase">
                                 EN TALLER - ORDEN #{vehiculo.orden_activa.id_orden}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-[#1a1a1a] border border-gray-800 p-8 text-center">
                <div className="text-6xl mb-4 opacity-50">V</div>
                <h3 className="text-lg font-bold text-white mb-2">NO HAY VEHICULOS</h3>
                <p className="text-gray-500 text-sm font-mono">Contacta al taller para registrar tu primer vehiculo</p>
              </div>
            )}
          </div>
          <div className="col-span-2 space-y-6">
            {ordenesActivas.length > 0 ? (
              <div className="bg-[#1a1a1a] border border-gray-800 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 py-4 border-b border-orange-400/30">
                  <h3 className="text-sm font-black tracking-wide uppercase">REPARACIONES EN CURSO</h3>
                </div>
                <div className="divide-y divide-gray-800">
                  {ordenesActivas.map((orden) => (
                    <div key={orden.id_orden} className="p-6 bg-[#1a1a1a] hover:bg-[#2d2d2d] transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-black text-orange-500 font-mono">ORDEN #{orden.id_orden}</h4>
                            {getEstadoBadge(orden.estado)}
                          </div>
                          <p className="text-white font-bold mb-1">
                            {orden.vehiculo.marca} {orden.vehiculo.modelo} - <span className="text-gray-500 font-mono">{orden.vehiculo.patente}</span>
                          </p>
                          <p className="text-gray-400 text-sm">{orden.descripcion_problema}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-black text-green-500">{formatCurrency(orden.total)}</p>
                        </div>
                      </div>
                      {}
                      <div className="bg-black/50 h-4 mb-4 overflow-hidden relative border border-gray-800">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            orden.estado === 'pendiente' ? 'bg-gradient-to-r from-gray-500 to-gray-600 w-1/4' :
                            orden.estado === 'en_proceso' ? 'bg-gradient-to-r from-orange-500 to-orange-600 w-1/2 shadow-lg shadow-orange-500/50' :
                            orden.estado === 'esperando_repuestos' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 w-3/4 shadow-lg shadow-yellow-500/50' :
                            'bg-gradient-to-r from-green-500 to-green-600 w-full shadow-lg shadow-green-500/50'
                          }`}
                        >
                          <div className="h-full w-full bg-gradient-to-t from-transparent to-white/20"></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div className="bg-[#2d2d2d] border border-gray-800 p-2">
                          <p className="text-gray-500 font-mono uppercase">Ingreso</p>
                          <p className="font-mono text-white font-bold" suppressHydrationWarning>{formatDate(orden.fecha_ingreso)}</p>
                        </div>
                        {orden.fecha_estimada && (
                          <div className="bg-[#2d2d2d] border border-gray-800 p-2">
                            <p className="text-gray-500 font-mono uppercase">Estimado</p>
                            <p className="font-mono text-orange-500 font-bold" suppressHydrationWarning>{formatDate(orden.fecha_estimada)}</p>
                          </div>
                        )}
                        {orden.empleado && (
                          <div className="bg-[#2d2d2d] border border-gray-800 p-2">
                            <p className="text-gray-500 font-mono uppercase">Mecanico</p>
                            <p className="font-mono text-white font-bold">{orden.empleado.nombre} {orden.empleado.apellido}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-[#1a1a1a] border border-gray-800 p-8 text-center">
                <div className="text-6xl mb-4 opacity-50">OK</div>
                <h3 className="text-lg font-bold text-white mb-2">SIN REPARACIONES ACTIVAS</h3>
                <p className="text-gray-500 text-sm font-mono">Todos tus vehículos están listos</p>
              </div>
            )}
            {ordenesCompletadas.length > 0 && (
              <div className="bg-[#1a1a1a] border border-gray-800 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-4 border-b border-green-400/30">
                  <h3 className="text-sm font-black tracking-wide uppercase">HISTORIAL DE SERVICIOS</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-[#2d2d2d] border-b border-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-mono text-gray-500 uppercase">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-mono text-gray-500 uppercase">Vehiculo</th>
                        <th className="px-6 py-3 text-left text-xs font-mono text-gray-500 uppercase">Descripcion</th>
                        <th className="px-6 py-3 text-left text-xs font-mono text-gray-500 uppercase">Fecha</th>
                        <th className="px-6 py-3 text-right text-xs font-mono text-gray-500 uppercase">Total</th>
                        <th className="px-6 py-3 text-center text-xs font-mono text-gray-500 uppercase">Pago</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {ordenesCompletadas.slice(0, 10).map((orden) => (
                        <tr key={orden.id_orden} className="hover:bg-[#2d2d2d] transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-mono font-bold text-orange-500">#{orden.id_orden}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-bold text-white">
                              {orden.vehiculo.marca} {orden.vehiculo.modelo}
                            </div>
                            <div className="text-xs text-gray-500 font-mono">{orden.vehiculo.patente}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-400 max-w-xs truncate">
                              {orden.descripcion_problema}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono" suppressHydrationWarning>
                            {formatDate(orden.fecha_entrega || orden.fecha_ingreso)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className="text-lg font-black text-green-500">
                              {formatCurrency(orden.total)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {orden.factura ? (
                              <span className={`px-3 py-1 text-xs font-mono font-bold border ${
                                orden.factura.estado_pago === 'pagada'
                                  ? 'bg-green-600/20 text-green-400 border-green-600'
                                  : 'bg-yellow-600/20 text-yellow-400 border-yellow-600'
                              }`}>
                                {orden.factura.estado_pago === 'pagada' ? 'PAGADA' : 'PENDIENTE'}
                              </span>
                            ) : (
                              <span className="text-gray-600 text-xs font-mono">SIN FACTURA</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
        {vehiculos.length === 0 && ordenes.length === 0 && (
          <div className="bg-[#1a1a1a] border border-gray-800 p-16 text-center col-span-3">
            <div className="text-9xl mb-6 opacity-30">P</div>
            <h3 className="text-3xl font-black text-white mb-4 tracking-tight">BIENVENIDO A TU PORTAL</h3>
            <p className="text-lg text-gray-400 mb-8 font-mono">
              Aqui podras ver el estado de tus vehiculos y servicios en tiempo real.
            </p>
            <a
              href="tel:+123456789"
              className="inline-block bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-8 py-4 text-lg font-black tracking-wide transition-all border border-orange-400/50 shadow-xl shadow-orange-500/20"
            >
              CONTACTAR AL TALLER
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
