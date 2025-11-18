import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Bienvenido, Administrador</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Compras */}
        <div className="bg-white rounded shadow p-4 flex flex-col items-center hover:shadow-lg transition-shadow">
          <span className="text-4xl mb-2">🛒</span>
          <h2 className="text-xl font-semibold">Compras</h2>
          <p className="text-sm text-gray-600 text-center">Registrar compras a proveedores</p>
          <Link href="/admin/compras" className="mt-2 text-indigo-600 hover:underline">
            Ver compras &rarr;
          </Link>
        </div>
        {/* Proveedores */}
        <div className="bg-white rounded shadow p-4 flex flex-col items-center hover:shadow-lg transition-shadow">
          <span className="text-4xl mb-2">🏢</span>
          <h2 className="text-xl font-semibold">Proveedores</h2>
          <p className="text-sm text-gray-600 text-center">Gestionar proveedores</p>
          <Link href="/admin/proveedores" className="mt-2 text-indigo-600 hover:underline">
            Ver proveedores &rarr;
          </Link>
        </div>
        {/* Órdenes de Trabajo */}
        <div className="bg-white rounded shadow p-4 flex flex-col items-center hover:shadow-lg transition-shadow">
          <span className="text-4xl mb-2">📋</span>
          <h2 className="text-xl font-semibold">Órdenes de Trabajo</h2>
          <p className="text-sm text-gray-600 text-center">Gestionar órdenes y salidas</p>
          <Link href="/admin/ordenes" className="mt-2 text-indigo-600 hover:underline">
            Ver órdenes &rarr;
          </Link>
        </div>
        {/* Alertas */}
        <div className="bg-white rounded shadow p-4 flex flex-col items-center hover:shadow-lg transition-shadow">
          <span className="text-4xl mb-2">🔔</span>
          <h2 className="text-xl font-semibold">Alertas</h2>
          <p className="text-sm text-gray-600 text-center">Stock bajo y notificaciones</p>
          <Link href="/admin/alertas" className="mt-2 text-indigo-600 hover:underline">
            Ver alertas &rarr;
          </Link>
        </div>
        {/* Reportes */}
        <div className="bg-white rounded shadow p-4 flex flex-col items-center hover:shadow-lg transition-shadow">
          <span className="text-4xl mb-2">📊</span>
          <h2 className="text-xl font-semibold">Reportes</h2>
          <p className="text-sm text-gray-600 text-center">Análisis y estadísticas</p>
          <Link href="/admin/reportes" className="mt-2 text-indigo-600 hover:underline">
            Ver reportes &rarr;
          </Link>
        </div>
        {/* Inventario de Repuestos */}
        <div className="bg-white rounded shadow p-4 flex flex-col items-center hover:shadow-lg transition-shadow">
          <span className="text-4xl mb-2">📦</span>
          <h2 className="text-xl font-semibold">Inventario</h2>
          <p className="text-sm text-gray-600 text-center">Stock y repuestos</p>
          <Link href="/admin/inventory" className="mt-2 text-indigo-600 hover:underline">
            Ver inventario &rarr;
          </Link>
        </div>
        {/* Gestión de Clientes */}
        <div className="bg-white rounded shadow p-4 flex flex-col items-center hover:shadow-lg transition-shadow">
          <span className="text-4xl mb-2">👤</span>
          <h2 className="text-xl font-semibold">Clientes</h2>
          <p className="text-sm text-gray-600 text-center">Administrar clientes</p>
          <Link href="/admin/clients" className="mt-2 text-indigo-600 hover:underline">
            Ver clientes &rarr;
          </Link>
        </div>
        {/* Gestión de Vehículos */}
        <div className="bg-white rounded shadow p-4 flex flex-col items-center hover:shadow-lg transition-shadow">
          <span className="text-4xl mb-2">🚗</span>
          <h2 className="text-xl font-semibold">Vehículos</h2>
          <p className="text-sm text-gray-600 text-center">Administrar vehículos</p>
          <Link href="/admin/vehiculos" className="mt-2 text-indigo-600 hover:underline">
            Ver vehículos &rarr;
          </Link>
        </div>
        {/* Gestión de Servicios */}
        <div className="bg-white rounded shadow p-4 flex flex-col items-center hover:shadow-lg transition-shadow">
          <span className="text-4xl mb-2">🛠️</span>
          <h2 className="text-xl font-semibold">Servicios</h2>
          <p className="text-sm text-gray-600 text-center">Servicios y mano de obra</p>
          <Link href="/admin/servicios" className="mt-2 text-indigo-600 hover:underline">
            Ver servicios &rarr;
          </Link>
        </div>
        {/* Facturas y Cobros */}
        <div className="bg-white rounded shadow p-4 flex flex-col items-center hover:shadow-lg transition-shadow">
          <span className="text-4xl mb-2">🧾</span>
          <h2 className="text-xl font-semibold">Facturas</h2>
          <p className="text-sm text-gray-600 text-center">Facturación y cobros</p>
          <Link href="/admin/facturas" className="mt-2 text-indigo-600 hover:underline">
            Ver facturas &rarr;
          </Link>
        </div>
        {/* Gestión de Empleados */}
        <div className="bg-white rounded shadow p-4 flex flex-col items-center hover:shadow-lg transition-shadow">
          <span className="text-4xl mb-2">👥</span>
          <h2 className="text-xl font-semibold">Empleados</h2>
          <p className="text-sm text-gray-600 text-center">Administrar personal</p>
          <Link href="/admin/empleados" className="mt-2 text-indigo-600 hover:underline">
            Ver empleados &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
