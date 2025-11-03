'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	const { logout } = useAuth();
	const router = useRouter();

	const handleLogout = () => {
		logout();
		router.push('/login');
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
				<header className="bg-white shadow rounded-lg mb-6 p-4">
					<div className="flex items-center justify-between">
						<h1 className="text-2xl font-bold text-gray-800">Panel de Administración</h1>
						<button
							onClick={handleLogout}
							className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
						>
							<span>🚪</span>
							<span>Cerrar Sesión</span>
						</button>
					</div>
					<nav className="mt-4 flex flex-wrap gap-2">
						<Link href="/admin" className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors">Inicio</Link>
						<Link href="/admin/reports" className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors">📊 Reportes</Link>
						<Link href="/admin/clients" className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors">Clientes</Link>
						<Link href="/admin/vehiculos" className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors">🚗 Vehículos</Link>
						<Link href="/admin/servicios" className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors">🛠️ Servicios</Link>
						<Link href="/admin/ordenes" className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors">📋 Órdenes</Link>
						<Link href="/admin/facturas" className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors">🧾 Facturas</Link>
						<Link href="/admin/inventory" className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors">📦 Inventario</Link>
						<Link href="/admin/empleados" className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors">👥 Empleados</Link>
					</nav>
				</header>

				<main>{children}</main>
			</div>
		</div>
	);
}
