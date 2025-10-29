'use client';

import { ProtectedRoute } from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="mt-2 text-gray-600">
              Bienvenido, {user?.nombre} {user?.apellido}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Gestión de Empleados */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">👥</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Gestión de Empleados
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Administrar personal
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <button className="text-blue-600 hover:text-blue-500 font-medium">
                    Ver empleados →
                  </button>
                </div>
              </div>
            </div>

            {/* Gestión de Clientes */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">👤</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Gestión de Clientes
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Administrar clientes
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <button className="text-blue-600 hover:text-blue-500 font-medium">
                    Ver clientes →
                  </button>
                </div>
              </div>
            </div>

            {/* Reportes */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">📊</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Reportes y Estadísticas
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Análisis del negocio
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <button className="text-blue-600 hover:text-blue-500 font-medium">
                    Ver reportes →
                  </button>
                </div>
              </div>
            </div>

            {/* Configuración */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">⚙️</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Configuración del Sistema
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Ajustes generales
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <button className="text-blue-600 hover:text-blue-500 font-medium">
                    Configurar →
                  </button>
                </div>
              </div>
            </div>

            {/* Gestión de Roles */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">🔐</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Roles y Permisos
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Administrar acceso
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <button className="text-blue-600 hover:text-blue-500 font-medium">
                    Gestionar →
                  </button>
                </div>
              </div>
            </div>

            {/* Auditoría */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">📋</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Logs de Auditoría
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Historial de acciones
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <button className="text-blue-600 hover:text-blue-500 font-medium">
                    Ver logs →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Información del usuario */}
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información de la Sesión</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Usuario</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Rol</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?.rol}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Tipo de Usuario</dt>
                <dd className="mt-1 text-sm text-gray-900">{user?._type}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Permisos</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {user?.permissions?.length || 0} permisos asignados
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
