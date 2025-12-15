import Link from 'next/link';
export default function AdminPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Bienvenido, Administrador</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded shadow p-4 flex flex-col items-center hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold">COMPRAS</h2>
          <p className="text-sm text-gray-600 text-center">Registrar compras a proveedores</p>
          <Link href="/admin/compras" className="mt-2 text-indigo-600 hover:underline">
            Ver compras
          </Link>
        </div>
        <div className="bg-white rounded shadow p-4 flex flex-col items-center hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold">PROVEEDORES</h2>
          <p className="text-sm text-gray-600 text-center">Gestionar proveedores</p>
          <Link href="/admin/proveedores" className="mt-2 text-indigo-600 hover:underline">
            Ver proveedores
          </Link>
        </div>
        <div className="bg-white rounded shadow p-4 flex flex-col items-center hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold">ÓRDENES DE TRABAJO</h2>
          <p className="text-sm text-gray-600 text-center">Gestionar órdenes y salidas</p>
          <Link href="/admin/ordenes" className="mt-2 text-indigo-600 hover:underline">
            Ver órdenes
          </Link>
        </div>
        <div className="bg-white rounded shadow p-4 flex flex-col items-center hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold">ALERTAS</h2>
          <p className="text-sm text-gray-600 text-center">Stock bajo y notificaciones</p>
          <Link href="/admin/alertas" className="mt-2 text-indigo-600 hover:underline">
            Ver alertas
          </Link>
        </div>
        <div className="bg-white rounded shadow p-4 flex flex-col items-center hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold">REPORTES</h2>
          <p className="text-sm text-gray-600 text-center">Análisis y estadísticas</p>
          <Link href="/admin/reportes" className="mt-2 text-indigo-600 hover:underline">
            Ver reportes
          </Link>
        </div>
        <div className="bg-white rounded shadow p-4 flex flex-col items-center hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold">INVENTARIO</h2>
          <p className="text-sm text-gray-600 text-center">Stock y repuestos</p>
          <Link href="/admin/inventory" className="mt-2 text-indigo-600 hover:underline">
            Ver inventario
          </Link>
        </div>
        <div className="bg-white rounded shadow p-4 flex flex-col items-center hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold">CLIENTES</h2>
          <p className="text-sm text-gray-600 text-center">Administrar clientes</p>
          <Link href="/admin/clients" className="mt-2 text-indigo-600 hover:underline">
            Ver clientes
          </Link>
        </div>
        <div className="bg-white rounded shadow p-4 flex flex-col items-center hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold">VEHÍCULOS</h2>
          <p className="text-sm text-gray-600 text-center">Administrar vehículos</p>
          <Link href="/admin/vehiculos" className="mt-2 text-indigo-600 hover:underline">
            Ver vehículos
          </Link>
        </div>
        <div className="bg-white rounded shadow p-4 flex flex-col items-center hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold">SERVICIOS</h2>
          <p className="text-sm text-gray-600 text-center">Servicios y mano de obra</p>
          <Link href="/admin/servicios" className="mt-2 text-indigo-600 hover:underline">
            Ver servicios
          </Link>
        </div>
        <div className="bg-white rounded shadow p-4 flex flex-col items-center hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold">FACTURAS</h2>
          <p className="text-sm text-gray-600 text-center">Facturación y cobros</p>
          <Link href="/admin/facturas" className="mt-2 text-indigo-600 hover:underline">
            Ver facturas
          </Link>
        </div>
        <div className="bg-white rounded shadow p-4 flex flex-col items-center hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold">EMPLEADOS</h2>
          <p className="text-sm text-gray-600 text-center">Administrar personal</p>
          <Link href="/admin/empleados" className="mt-2 text-indigo-600 hover:underline">
            Ver empleados
          </Link>
        </div>
      </div>
    </div>
  );
}
