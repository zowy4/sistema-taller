'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Verificar si hay un token de autenticación
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Sistema de Taller</h1>
            </div>
            <nav className="flex space-x-4">
              {isLoggedIn ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">Bienvenido</span>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('token');
                      setIsLoggedIn(false);
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link 
                    href="/register" 
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            Sistema de Gestión de Taller
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Gestiona clientes, servicios y reparaciones de manera eficiente con nuestro sistema completo de taller mecánico.
          </p>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-500 text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-2">Gestión de Clientes</h3>
              <p className="text-gray-600">
                Administra información completa de tus clientes, historial de servicios y datos de contacto.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-green-500 text-4xl mb-4">🔧</div>
              <h3 className="text-xl font-semibold mb-2">Servicios y Reparaciones</h3>
              <p className="text-gray-600">
                Registra servicios realizados, seguimiento de reparaciones y gestión de inventario.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-purple-500 text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Reportes y Análisis</h3>
              <p className="text-gray-600">
                Genera reportes detallados, análisis de rentabilidad y estadísticas del negocio.
              </p>
            </div>
          </div>

          {/* Call to Action */}
          {!isLoggedIn && (
            <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
              <h3 className="text-2xl font-semibold mb-4">¿Listo para comenzar?</h3>
              <p className="text-gray-600 mb-6">
                Regístrate ahora para acceder a todas las funcionalidades del sistema de taller.
              </p>
              <div className="flex justify-center space-x-4">
                <Link 
                  href="/register" 
                  className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors font-medium"
                >
                  Crear Cuenta
                </Link>
                <Link 
                  href="/login" 
                  className="bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600 transition-colors font-medium"
                >
                  Ya tengo cuenta
                </Link>
              </div>
            </div>
          )}

          {isLoggedIn && (
            <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
              <h3 className="text-2xl font-semibold mb-4">¡Bienvenido al Sistema!</h3>
              <p className="text-gray-600 mb-6">
                Ya estás logueado. Accede a todas las funcionalidades del sistema.
              </p>
              <div className="flex justify-center space-x-4">
                <button className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors font-medium">
                  Ver Clientes
                </button>
                <button className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition-colors font-medium">
                  Nuevo Servicio
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Sistema de Taller. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
