
import React from 'react';
import Link from 'next/link';

export const metadata = {
	title: 'Admin - Sistema de Taller',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="es">
			<body className="min-h-screen bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<header className="flex items-center justify-between mb-6">
						<h1 className="text-2xl font-bold">Panel de Administración</h1>
																<nav>
																		<Link href="/admin" className="mr-4 text-blue-600 hover:underline">Inicio</Link>
																		<Link href="/admin/reports" className="mr-4 text-blue-600 hover:underline">📊 Reportes</Link>
																	<Link href="/admin/clients" className="mr-4 text-blue-600 hover:underline">Clientes</Link>
																	<Link href="/admin/vehiculos" className="mr-4 text-blue-600 hover:underline">🚗 Vehículos</Link>
																	<Link href="/admin/servicios" className="mr-4 text-blue-600 hover:underline">🛠️ Servicios</Link>
																	<Link href="/admin/ordenes" className="mr-4 text-blue-600 hover:underline">📋 Órdenes</Link>
																	<Link href="/admin/facturas" className="mr-4 text-blue-600 hover:underline">🧾 Facturas</Link>
																	<Link href="/admin/inventory" className="mr-4 text-blue-600 hover:underline">📦 Inventario</Link>
																	<Link href="/admin/empleados" className="text-blue-600 hover:underline">👥 Empleados</Link>
																</nav>
					</header>

					<main>{children}</main>
				</div>
			</body>
		</html>
	);
}
