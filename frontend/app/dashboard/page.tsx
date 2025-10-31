'use client';

import { ProtectedRoute } from '../../src/components/ProtectedRoute';
import { useAuth } from '../../src/contexts/AuthContext';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Cerrar Sesión
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-6 bg-white">
              <h2 className="text-xl font-semibold mb-4">Bienvenido</h2>
              <p className="text-gray-600">Has iniciado sesión como:</p>
              <ul className="mt-2 text-gray-800 list-disc list-inside">
                <li>Email: {user?.email}</li>
                <li>Rol: {user?.rol || 'cliente'}</li>
                <li>Tipo: {user?._type}</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
