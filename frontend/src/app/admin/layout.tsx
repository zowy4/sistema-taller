'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  const isRecepcion = user?.rol === 'recepcion';
  const menuItems = [
    { href: '/admin/dashboard', label: 'DASHBOARD', shortLabel: 'DS', roles: ['all'] },
    { href: '/admin/ordenes', label: 'ÓRDENES', shortLabel: 'OR', roles: ['all'] },
    { href: '/admin/clients', label: 'CLIENTES', shortLabel: 'CL', roles: ['all'] },
    { href: '/admin/vehiculos', label: 'VEHÍCULOS', shortLabel: 'VH', roles: ['all'] },
    { href: '/admin/servicios', label: 'SERVICIOS', shortLabel: 'SV', roles: ['all'] },
    { href: '/admin/facturas', label: 'FACTURAS', shortLabel: 'FC', roles: ['all'] },
    { href: '/admin/inventory', label: 'INVENTARIO', shortLabel: 'IN', roles: ['all'] },
    { href: '/admin/compras', label: 'COMPRAS', shortLabel: 'CP', roles: ['admin', 'supervisor', 'tecnico'] },
    { href: '/admin/proveedores', label: 'PROVEEDORES', shortLabel: 'PR', roles: ['admin', 'supervisor', 'tecnico'] },
    { href: '/admin/empleados', label: 'EMPLEADOS', shortLabel: 'EM', roles: ['admin', 'supervisor'] },
    { href: '/admin/alertas', label: 'ALERTAS', shortLabel: 'AL', roles: ['admin', 'supervisor', 'tecnico'] },
    { href: '/admin/reportes', label: 'REPORTES', shortLabel: 'RP', roles: ['admin', 'supervisor', 'tecnico'] },
  ];
  const visibleMenuItems = menuItems.filter(item => 
    item.roles.includes('all') || 
    (user?.rol && item.roles.includes(user.rol))
  );
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex">
      {}
      <aside
        className={`hidden md:flex flex-col bg-[#0a0a0a] text-white transition-all duration-300 border-r border-[#1a1a1a] ${
          sidebarOpen ? 'w-64' : 'w-16'
        }`}
      >
        {}
        <div className="p-4 border-b border-[#1a1a1a]">
          {sidebarOpen ? (
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-baseline gap-1 mb-1">
                  <div className="w-1 h-6 bg-orange-500"></div>
                  <h1 className="text-base font-black tracking-tighter text-white uppercase" style={{ fontFamily: 'monospace' }}>
                    SISTEMA
                  </h1>
                </div>
                <p className="text-[10px] text-gray-600 font-mono tracking-wider uppercase pl-2">
                  {user?.nombre || 'OPERADOR'} / {user?.rol?.toUpperCase() || 'USER'}
                </p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-600 hover:text-orange-500 transition-colors text-xs"
              >
                ←
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 hover:text-orange-500 transition-colors text-xs w-full text-center"
            >
              →
            </button>
          )}
        </div>
        {}
        <nav className="flex-1 overflow-y-auto py-2">
          {visibleMenuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center px-4 py-3 transition-all group ${
                  isActive
                    ? 'bg-[#1a1a1a] text-orange-500'
                    : 'text-gray-500 hover:text-white hover:bg-[#111111]'
                }`}
                title={!sidebarOpen ? item.label : ''}
              >
                {}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-orange-500"></div>
                )}
                {sidebarOpen ? (
                  <span className="text-xs font-bold tracking-wider uppercase font-mono">
                    {item.label}
                  </span>
                ) : (
                  <span className="text-xs font-black tracking-tighter font-mono mx-auto">
                    {item.shortLabel}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        {}
        {sidebarOpen && (
          <div className="px-4 py-3 border-t border-[#1a1a1a] bg-[#0a0a0a]">
            <div className="flex items-center gap-2 text-[10px]">
              <div className="w-1 h-1 bg-green-500 rounded-full"></div>
              <span className="text-gray-600 font-mono uppercase tracking-wider">ONLINE</span>
              <span className="text-gray-800 ml-auto font-mono">v2.1.0</span>
            </div>
          </div>
        )}
        {}
        <button
          onClick={handleLogout}
          className={`flex items-center px-4 py-4 border-t border-[#1a1a1a] text-red-500 hover:bg-[#1a1a1a] transition-colors ${
            !sidebarOpen && 'justify-center'
          }`}
        >
          {sidebarOpen ? (
            <span className="text-xs font-bold tracking-wider uppercase font-mono">SALIR</span>
          ) : (
            <span className="text-xs font-black font-mono">X</span>
          )}
        </button>
      </aside>
      {}
      <div className="md:hidden">
        {}
        <div className="bg-[#0a0a0a] text-white p-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50 border-b border-[#1a1a1a]">
          <div className="flex items-baseline gap-1">
            <div className="w-1 h-5 bg-orange-500"></div>
            <h1 className="text-sm font-black tracking-tighter uppercase font-mono">SISTEMA</h1>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-500 hover:text-orange-500 transition-colors"
          >
            {mobileMenuOpen ? '•' : 'â‰¡'}
          </button>
        </div>
        {}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-90 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="fixed top-0 left-0 bottom-0 w-64 bg-[#0a0a0a] text-white z-50 flex flex-col border-r border-[#1a1a1a]">
              <div className="p-4 border-b border-[#1a1a1a]">
                <div className="flex items-baseline gap-1 mb-1">
                  <div className="w-1 h-6 bg-orange-500"></div>
                  <h1 className="text-base font-black tracking-tighter uppercase font-mono">SISTEMA</h1>
                </div>
                <p className="text-[10px] text-gray-600 font-mono tracking-wider uppercase pl-2">
                  {user?.nombre || 'OPERADOR'} / {user?.rol?.toUpperCase() || 'USER'}
                </p>
              </div>
              <nav className="flex-1 overflow-y-auto py-2">
                {visibleMenuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`relative flex items-center px-4 py-3 transition-all ${
                        isActive 
                          ? 'bg-[#1a1a1a] text-orange-500' 
                          : 'text-gray-500 hover:text-white hover:bg-[#111111]'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-orange-500"></div>
                      )}
                      <span className="text-xs font-bold tracking-wider uppercase font-mono">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="px-4 py-3 border-t border-[#1a1a1a]">
                <div className="flex items-center gap-2 text-[10px]">
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600 font-mono uppercase tracking-wider">ONLINE</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-4 border-t border-[#1a1a1a] text-red-500 hover:bg-[#1a1a1a]"
              >
                <span className="text-xs font-bold tracking-wider uppercase font-mono">SALIR</span>
              </button>
            </aside>
          </>
        )}
      </div>
      {}
      <main className="flex-1 overflow-auto bg-[#0f0f0f]">
        <div className="md:hidden h-16" /> {}
        {children}
      </main>
    </div>
  );
}
