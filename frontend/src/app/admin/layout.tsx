'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Car,
  Wrench,
  FileText,
  Package,
  ShoppingCart,
  Building2,
  UserCog,
  Bell,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

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
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['all'] },
    { href: '/admin/ordenes', label: 'Órdenes', icon: ClipboardList, roles: ['all'] },
    { href: '/admin/clients', label: 'Clientes', icon: Users, roles: ['all'] },
    { href: '/admin/vehiculos', label: 'Vehículos', icon: Car, roles: ['all'] },
    { href: '/admin/servicios', label: 'Servicios', icon: Wrench, roles: ['all'] },
    { href: '/admin/facturas', label: 'Facturas', icon: FileText, roles: ['all'] },
    { href: '/admin/inventory', label: 'Inventario', icon: Package, roles: ['all'] },
    { href: '/admin/compras', label: 'Compras', icon: ShoppingCart, roles: ['admin', 'supervisor', 'tecnico'] },
    { href: '/admin/proveedores', label: 'Proveedores', icon: Building2, roles: ['admin', 'supervisor', 'tecnico'] },
    { href: '/admin/empleados', label: 'Empleados', icon: UserCog, roles: ['admin', 'supervisor'] },
    { href: '/admin/alertas', label: 'Alertas', icon: Bell, roles: ['admin', 'supervisor', 'tecnico'] },
    { href: '/admin/reportes', label: 'Reportes', icon: BarChart3, roles: ['admin', 'supervisor', 'tecnico'] },
  ];

  const visibleMenuItems = menuItems.filter(item => 
    item.roles.includes('all') || 
    (user?.rol && item.roles.includes(user.rol))
  );

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar Desktop */}
      <aside
        className={`hidden md:flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {sidebarOpen ? (
            <>
              <div>
                <h1 className="text-xl font-bold">Sistema Taller</h1>
                <p className="text-sm text-gray-400">{user?.nombre || 'Usuario'}</p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 hover:bg-gray-700 rounded transition-colors mx-auto"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } ${!sidebarOpen && 'justify-center'}`}
                title={!sidebarOpen ? item.label : ''}
              >
                <Icon size={20} className="flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-4 py-4 border-t border-gray-700 text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors ${
            !sidebarOpen && 'justify-center'
          }`}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {sidebarOpen && <span className="text-sm font-medium">Cerrar Sesión</span>}
        </button>
      </aside>

      {/* Mobile Menu */}
      <div className="md:hidden">
        {/* Mobile Header */}
        <div className="bg-gray-900 text-white p-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
          <div>
            <h1 className="text-lg font-bold">Sistema Taller</h1>
            <p className="text-xs text-gray-400">{user?.nombre || 'Usuario'}</p>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="fixed top-0 left-0 bottom-0 w-64 bg-gray-900 text-white z-50 flex flex-col">
              <div className="p-4 border-b border-gray-700">
                <h1 className="text-xl font-bold">Sistema Taller</h1>
                <p className="text-sm text-gray-400">{user?.nombre || 'Usuario'}</p>
              </div>
              
              <nav className="flex-1 overflow-y-auto py-4">
                {visibleMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                        isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-4 border-t border-gray-700 text-red-400 hover:bg-gray-700"
              >
                <LogOut size={20} />
                <span className="text-sm font-medium">Cerrar Sesión</span>
              </button>
            </aside>
          </>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="md:hidden h-16" /> {/* Spacer for mobile header */}
        {children}
      </main>
    </div>
  );
}
