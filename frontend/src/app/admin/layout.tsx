'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	const { logout, user } = useAuth();
	const router = useRouter();

	const handleLogout = () => {
		logout();
		router.push('/login');
	};

	// Determinar qué enlaces mostrar según el rol
	const isRecepcion = user?.rol === 'recepcion';
	const isAdmin = user?.rol === 'admin';
	const isSupervisor = user?.rol === 'supervisor';

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
				<header className="bg-white shadow rounded-lg mb-6 p-4">
					<div className="flex items-center justify-between">
						<h1 className="text-2xl font-bold text-gray-800">
							{isRecepcion ? 'Panel de Recepción' : 'Panel de Administración'}
						</h1>
						<button
							onClick={handleLogout}
							className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
						>
							<span>🚪</span>
							<span>Cerrar Sesión</span>
						</button>
					</div>
					<nav className="mt-4 flex flex-wrap gap-2">
						<Link href="/admin/dashboard" className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors">🏠 Dashboard</Link>
						<Link href="/admin/ordenes" className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors">📋 Órdenes</Link>
						<Link href="/admin/clients" className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors">👤 Clientes</Link>
						<Link href="/admin/vehiculos" className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors">🚗 Vehículos</Link>
						<Link href="/admin/servicios" className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors">🛠️ Servicios</Link>
						<Link href="/admin/facturas" className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors">🧾 Facturas</Link>
						<Link href="/admin/inventory" className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors">📦 Inventario</Link>
						
						{/* Solo para admin y supervisor */}
						{!isRecepcion && (
							<>
								<Link href="/admin/compras" className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors">🛒 Compras</Link>
								<Link href="/admin/proveedores" className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors">🏢 Proveedores</Link>
								<Link href="/admin/empleados" className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors">👥 Empleados</Link>
								<Link href="/admin/alertas" className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors">🔔 Alertas</Link>
								<Link href="/admin/reportes" className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors">📊 Reportes</Link>
							</>
						)}
					</nav>
				</header>

				<main>{children}</main>
			</div>
		</div>
	);
}
