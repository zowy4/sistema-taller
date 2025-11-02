import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Bienvenido, Administrador</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Gestión de Empleados */}
        <div className="bg-white rounded shadow p-4 flex flex-col items-center">
          <span className="text-4xl mb-2">👥</span>
          <h2 className="text-xl font-semibold">Gestión de Empleados</h2>
          <p className="text-sm text-gray-600">Administrar personal</p>
          <Link href="/admin/employees" className="mt-2 text-indigo-600 hover:underline">
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
