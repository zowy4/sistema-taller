import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Bienvenido, Administrador</h1>
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Gestión de Vehículos */}
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <span className="text-4xl mb-2">🚗</span>
          <h2 className="text-xl font-semibold">Gestión de Vehículos</h2>
          <p className="text-sm text-gray-600">Administrar vehículos</p>
          <Link href="/admin/vehiculos" className="mt-2 text-indigo-600 hover:underline">
            Ver vehículos &rarr;
          </Link>
        </div>
        {/* Gestión de Servicios */}
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <span className="text-4xl mb-2">🛠️</span>
          <h2 className="text-xl font-semibold">Gestión de Servicios</h2>
          <p className="text-sm text-gray-600">Administrar servicios y mano de obra</p>
          <Link href="/admin/servicios" className="mt-2 text-indigo-600 hover:underline">
            Ver servicios &rarr;
          </Link>
        </div>
        {/* Órdenes de Trabajo */}
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <span className="text-4xl mb-2">📋</span>
          <h2 className="text-xl font-semibold">Órdenes de Trabajo</h2>
          <p className="text-sm text-gray-600">Gestionar órdenes y POS</p>
          <Link href="/admin/ordenes" className="mt-2 text-indigo-600 hover:underline">
            Ver órdenes &rarr;
          </Link>
        </div>
        {/* Facturas y Cobros */}
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <span className="text-4xl mb-2">🧾</span>
          <h2 className="text-xl font-semibold">Facturas y Cobros</h2>
          <p className="text-sm text-gray-600">Gestionar facturación</p>
          <Link href="/admin/facturas" className="mt-2 text-indigo-600 hover:underline">
            Ver facturas &rarr;
          </Link>
        </div>
        {/* Gestión de Empleados */}
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <span className="text-4xl mb-2">👥</span>
          <h2 className="text-xl font-semibold">Gestión de Empleados</h2>
          <p className="text-sm text-gray-600">Administrar personal</p>
          <Link href="/admin/empleados" className="mt-2 text-indigo-600 hover:underline">
            Ver empleados &rarr;
          </Link>
        </div>
        {/* Gestión de Clientes */}
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <span className="text-4xl mb-2">👤</span>
          <h2 className="text-xl font-semibold">Gestión de Clientes</h2>
          <p className="text-sm text-gray-600">Administrar clientes</p>
          <Link href="/admin/clients" className="mt-2 text-indigo-600 hover:underline">
            Ver clientes &rarr;
          </Link>
        </div>
        {/* Inventario de Repuestos */}
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <span className="text-4xl mb-2">📦</span>
          <h2 className="text-xl font-semibold">Inventario de Repuestos</h2>
          <p className="text-sm text-gray-600">Gestionar stock y piezas</p>
          <Link href="/admin/inventory" className="mt-2 text-indigo-600 hover:underline">
            Ver inventario &rarr;
          </Link>
        </div>
        {/* Reportes y Estadísticas */}
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <span className="text-4xl mb-2">📊</span>
          <h2 className="text-xl font-semibold">Reportes y Estadísticas</h2>
          <p className="text-sm text-gray-600">Análisis del negocio</p>
          <Link href="/admin/reports" className="mt-2 text-indigo-600 hover:underline">
            Ver reportes &rarr;
          </Link>
        </div>
        {/* Configuración del Sistema */}
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <span className="text-4xl mb-2">⚙️</span>
          <h2 className="text-xl font-semibold">Configuración del Sistema</h2>
          <p className="text-sm text-gray-600">Ajustes generales</p>
          <Link href="/admin/settings" className="mt-2 text-indigo-600 hover:underline">
            Ver ajustes &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
