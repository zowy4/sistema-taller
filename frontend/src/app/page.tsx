'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Wrench, Users, Shield, Gauge } from 'lucide-react';
export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);
  return (
    <div className="min-h-screen bg-[#0f0f0f] relative overflow-hidden">
      {}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)
          `
        }}
      ></div>
      {}
      <header className="relative z-10 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Wrench className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">TALLERPRO</h1>
              <span className="text-xs text-gray-500 font-mono ml-2">v2.0</span>
            </div>
            <nav className="flex gap-3">
              {!isLoggedIn ? (
                <>
                  <Link 
                    href="/login" 
                    className="px-5 py-2 text-gray-300 hover:text-white transition-colors font-medium text-sm"
                  >
                    ACCEDER
                  </Link>
                  <Link 
                    href="/register" 
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 hover:from-orange-600 hover:to-orange-700 transition-all font-bold text-sm border border-orange-400/50"
                  >
                    REGISTRARSE
                  </Link>
                </>
              ) : (
                <Link 
                  href="/admin/dashboard" 
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-2 hover:from-orange-600 hover:to-orange-700 transition-all font-bold text-sm border border-orange-400/50"
                >
                  DASHBOARD
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>
      <main className="relative z-10">
        <div 
          className="relative h-[600px] bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1920&q=80')"
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/60"></div>
          <div className="relative max-w-7xl mx-auto px-6 h-full flex items-center">
            <div className="max-w-2xl">
              <div className="mb-6">
                <span className="bg-orange-500/20 text-orange-400 px-4 py-2 text-xs font-mono border border-orange-500/30 inline-block">
                  SISTEMA PROFESIONAL DE GESTIÓN
                </span>
              </div>
              <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
                CONTROL TOTAL<br/>
                <span className="text-orange-500">DEL TALLER</span>
              </h1>
              <p className="text-xl text-gray-300 mb-10 leading-relaxed font-light">
                Plataforma industrial para gestión completa de talleres mecánicos.<br/>
                Órdenes, inventario, facturación y más en tiempo real.
              </p>
              <div className="flex gap-4">
                <Link 
                  href="/register"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-10 py-4 text-lg font-bold hover:from-orange-600 hover:to-orange-700 transition-all border border-orange-400/50 shadow-xl shadow-orange-500/20"
                >
                  COMENZAR AHORA
                </Link>
                <Link 
                  href="/login"
                  className="bg-gray-800 text-white px-10 py-4 text-lg font-bold hover:bg-gray-700 transition-all border border-gray-600"
                >
                  ACCEDER
                </Link>
              </div>
            </div>
          </div>
        </div>
        {}
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4 tracking-tight">
              ACCESO POR ROL
            </h2>
            <p className="text-gray-400 text-lg">
              Cada usuario tiene su espacio de trabajo optimizado
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div 
              className="group relative h-[400px] bg-cover bg-center overflow-hidden border border-gray-800"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80')"
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent group-hover:from-orange-600/90 group-hover:via-orange-600/60 transition-all duration-300"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <Shield className="w-12 h-12 text-orange-500 mb-4 group-hover:text-white transition-colors" strokeWidth={1.5} />
                <h3 className="text-2xl font-bold text-white mb-2">ADMINISTRADOR</h3>
                <p className="text-gray-300 text-sm mb-4 group-hover:text-gray-100">
                  Dashboard completo, reportes, configuración, usuarios y facturación
                </p>
                <Link 
                  href="/login"
                  className="inline-block text-orange-500 group-hover:text-white font-bold text-sm"
                >
                  ACCEDER ?
                </Link>
              </div>
            </div>
            <div 
              className="group relative h-[400px] bg-cover bg-center overflow-hidden border border-gray-800"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80')"
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent group-hover:from-orange-600/90 group-hover:via-orange-600/60 transition-all duration-300"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <Wrench className="w-12 h-12 text-orange-500 mb-4 group-hover:text-white transition-colors" strokeWidth={1.5} />
                <h3 className="text-2xl font-bold text-white mb-2">TÉCNICO</h3>
                <p className="text-gray-300 text-sm mb-4 group-hover:text-gray-100">
                  Órdenes asignadas, actualización de estado, repuestos utilizados
                </p>
                <Link 
                  href="/login"
                  className="inline-block text-orange-500 group-hover:text-white font-bold text-sm"
                >
                  ACCEDER ?
                </Link>
              </div>
            </div>
            <div 
              className="group relative h-[400px] bg-cover bg-center overflow-hidden border border-gray-800"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80')"
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent group-hover:from-orange-600/90 group-hover:via-orange-600/60 transition-all duration-300"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <Users className="w-12 h-12 text-orange-500 mb-4 group-hover:text-white transition-colors" strokeWidth={1.5} />
                <h3 className="text-2xl font-bold text-white mb-2">RECEPCIÓN</h3>
                <p className="text-gray-300 text-sm mb-4 group-hover:text-gray-100">
                  Crear órdenes, atención al cliente, seguimiento de vehículos
                </p>
                <Link 
                  href="/login"
                  className="inline-block text-orange-500 group-hover:text-white font-bold text-sm"
                >
                  ACCEDER ?
                </Link>
              </div>
            </div>
          </div>
        </div>
        {}
        <div className="bg-[#1a1a1a] py-20 border-y border-gray-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-white mb-4 tracking-tight">
                ESPECIFICACIONES TÉCNICAS
              </h2>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-[#2d2d2d] border border-gray-700 p-6">
                <Gauge className="w-8 h-8 text-orange-500 mb-4" strokeWidth={1.5} />
                <h4 className="text-white font-bold mb-2 text-sm">RENDIMIENTO</h4>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Sistema optimizado para operaciones concurrentes
                </p>
              </div>
              <div className="bg-[#2d2d2d] border border-gray-700 p-6">
                <Shield className="w-8 h-8 text-orange-500 mb-4" strokeWidth={1.5} />
                <h4 className="text-white font-bold mb-2 text-sm">SEGURIDAD</h4>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Autenticación JWT y control de roles avanzado
                </p>
              </div>
              <div className="bg-[#2d2d2d] border border-gray-700 p-6">
                <Users className="w-8 h-8 text-orange-500 mb-4" strokeWidth={1.5} />
                <h4 className="text-white font-bold mb-2 text-sm">MULTI-USUARIO</h4>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Acceso simultáneo sin conflictos de datos
                </p>
              </div>
              <div className="bg-[#2d2d2d] border border-gray-700 p-6">
                <Wrench className="w-8 h-8 text-orange-500 mb-4" strokeWidth={1.5} />
                <h4 className="text-white font-bold mb-2 text-sm">TIEMPO REAL</h4>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Actualizaciones instantáneas en todos los módulos
                </p>
              </div>
            </div>
          </div>
        </div>
        {}
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div 
            className="relative h-[300px] bg-cover bg-center overflow-hidden border border-gray-800"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80')"
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-transparent"></div>
            <div className="relative h-full flex items-center px-12">
              <div>
                <h2 className="text-4xl font-black text-white mb-4">
                  OPTIMIZA TU TALLER HOY
                </h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl">
                  Únete a talleres profesionales que confían en TallerPro
                </p>
                <Link 
                  href="/register"
                  className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 text-white px-12 py-4 text-lg font-bold hover:from-orange-600 hover:to-orange-700 transition-all border border-orange-400/50 shadow-xl shadow-orange-500/20"
                >
                  REGISTRARSE GRATIS
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      {}
      <footer className="relative z-10 border-t border-gray-800 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <p className="text-gray-500 text-sm mb-2 font-mono">
              © 2025 TALLERPRO - SISTEMA DE GESTIÓN INDUSTRIAL
            </p>
            <p className="text-gray-600 text-xs">
              Tecnología profesional para talleres mecánicos
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
