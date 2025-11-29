'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 animate-gradient-x relative overflow-hidden">
      {/* Efectos de fondo */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse delay-700"></div>

      {/* Header flotante */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="text-4xl">🔧</div>
              <h1 className="text-2xl font-bold text-white">TallerPro</h1>
            </div>
            <nav className="flex gap-4">
              {!isLoggedIn ? (
                <>
                  <Link 
                    href="/login" 
                    className="px-6 py-3 text-white hover:text-blue-300 transition-colors font-medium"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link 
                    href="/register" 
                    className="bg-white/10 backdrop-blur-lg text-white px-8 py-3 rounded-xl hover:bg-white/20 transition-all font-bold border border-white/30"
                  >
                    Comenzar Ahora
                  </Link>
                </>
              ) : (
                <Link 
                  href="/admin/dashboard" 
                  className="bg-white/10 backdrop-blur-lg text-white px-8 py-3 rounded-xl hover:bg-white/20 transition-all font-bold border border-white/30"
                >
                  Ir al Dashboard
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section con Glassmorphism */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-32">
          {/* Hero principal */}
          <div className="text-center mb-20">
            <div className="mb-8 inline-block">
              <span className="bg-white/10 backdrop-blur-lg text-white px-6 py-2 rounded-full text-sm font-medium border border-white/30">
                ✨ Sistema de Gestión Profesional
              </span>
            </div>
            <h1 className="text-7xl md:text-8xl font-black text-white mb-6 leading-tight">
              TallerPro
            </h1>
            <p className="text-2xl md:text-3xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              La plataforma completa para administrar tu taller mecánico con tecnología de vanguardia
            </p>
            <div className="flex justify-center gap-6">
              <Link 
                href="/register"
                className="bg-white text-blue-900 px-10 py-5 rounded-2xl text-xl font-bold hover:scale-105 transition-all shadow-2xl hover:shadow-white/20"
              >
                Prueba Gratis 30 días
              </Link>
              <Link 
                href="/login"
                className="bg-white/10 backdrop-blur-lg text-white px-10 py-5 rounded-2xl text-xl font-bold hover:bg-white/20 transition-all border-2 border-white/30"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>

          {/* Features con tarjetas glassmorphism */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all">
              <div className="text-6xl mb-6">👥</div>
              <h3 className="text-2xl font-bold text-white mb-4">Gestión de Clientes</h3>
              <p className="text-blue-100 text-lg leading-relaxed">
                Historial completo, datos de contacto y seguimiento personalizado de cada cliente.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all">
              <div className="text-6xl mb-6">🔧</div>
              <h3 className="text-2xl font-bold text-white mb-4">Órdenes de Trabajo</h3>
              <p className="text-blue-100 text-lg leading-relaxed">
                Control total de servicios, reparaciones y estado de cada vehículo en tiempo real.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all">
              <div className="text-6xl mb-6">📊</div>
              <h3 className="text-2xl font-bold text-white mb-4">Reportes Avanzados</h3>
              <p className="text-blue-100 text-lg leading-relaxed">
                Analytics en tiempo real, KPIs y reportes financieros para tomar mejores decisiones.
              </p>
            </div>
          </div>

          {/* Sección de beneficios */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-12 border border-white/20 mb-20">
            <h2 className="text-4xl font-bold text-white text-center mb-12">
              Todo lo que necesitas en un solo lugar
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex items-start gap-4">
                <div className="text-3xl">✅</div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Gestión de Inventario</h4>
                  <p className="text-blue-100">Control de repuestos y productos con alertas automáticas</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-3xl">✅</div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Portal del Cliente</h4>
                  <p className="text-blue-100">Tus clientes pueden ver el estado de sus vehículos 24/7</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-3xl">✅</div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Multi-Usuario</h4>
                  <p className="text-blue-100">Roles para admin, técnicos, recepción y clientes</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-3xl">✅</div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Notificaciones en Tiempo Real</h4>
                  <p className="text-blue-100">Mantén informados a todos sobre cambios importantes</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Final */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-2xl rounded-3xl p-12 border border-white/30">
              <h2 className="text-4xl font-bold text-white mb-4">
                ¿Listo para transformar tu taller?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Únete a cientos de talleres que ya confían en TallerPro
              </p>
              <Link 
                href="/register"
                className="inline-block bg-white text-blue-900 px-12 py-5 rounded-2xl text-xl font-bold hover:scale-105 transition-all shadow-2xl"
              >
                Crear Cuenta Gratis
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <p className="text-blue-200 text-lg mb-4">
              © 2025 TallerPro. Sistema de Gestión de Talleres Mecánicos.
            </p>
            <p className="text-blue-300 text-sm">
              Potenciado por tecnología de última generación
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

