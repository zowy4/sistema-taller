'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validación básica
    if (!formData.email.includes('@')) {
      setError('Por favor, introduce un email válido');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const success = await login(formData.email, formData.password);
      
      if (success) {
        // Redirigir según el rol del usuario
        const raw = localStorage.getItem('token');
        try {
          if (raw) {
            const payload = JSON.parse(atob(raw.split('.')[1]));
            const rol = payload.rol as string | undefined;
            if (rol === 'cliente') {
              router.push('/portal');
            } else if (rol === 'admin' || rol === 'supervisor' || rol === 'recepcion') {
              router.push('/admin/dashboard');
            } else if (rol === 'tecnico') {
              router.push('/tecnico');
            } else {
              router.push('/dashboard');
            }
          } else {
            router.push('/dashboard');
          }
        } catch {
          router.push('/dashboard');
        }
      } else {
        setError('Credenciales inválidas');
      }
    } catch (error) {
      setError('Error al iniciar sesión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Fondo con Gradiente Animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 animate-gradient-x"></div>
      
      {/* Círculos decorativos animados */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      {/* Contenedor Principal */}
      <div className="relative z-10 w-full max-w-md">
        {/* Card Glassmorphism */}
        <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 sm:p-12">
          {/* Logo y Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">Portal Corporativo</h1>
            <p className="text-white/80 text-lg">Sistema de Gestión de Taller</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl backdrop-blur-sm">
              <p className="text-white text-center font-medium">{error}</p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-white font-medium mb-3 text-lg">
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 text-lg"
                placeholder="correo@ejemplo.com"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-white font-medium mb-3 text-lg">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-300 text-lg"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 px-6 bg-white text-blue-600 font-bold text-lg rounded-2xl hover:bg-white/90 focus:outline-none focus:ring-4 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] shadow-xl mt-8"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>

            {/* Link a Registro */}
            <div className="text-center mt-6">
              <Link
                href="/register"
                className="text-white/90 hover:text-white font-medium text-lg transition-colors"
              >
                ¿No tienes cuenta? <span className="underline">Regístrate aquí</span>
              </Link>
            </div>
          </form>

          {/* Credenciales de Prueba */}
          <div className="mt-10 p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
            <h3 className="text-white font-semibold mb-4 text-center text-lg">
              🔑 Credenciales de Prueba
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-white/80">
              <div className="bg-white/5 p-3 rounded-xl">
                <p className="font-medium text-white mb-1">👨‍💼 Admin</p>
                <p className="text-xs">admin@taller.com</p>
                <p className="text-xs">password123</p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl">
                <p className="font-medium text-white mb-1">🔧 Técnico</p>
                <p className="text-xs">tecnico@taller.com</p>
                <p className="text-xs">password123</p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl">
                <p className="font-medium text-white mb-1">📋 Recepción</p>
                <p className="text-xs">recepcion@taller.com</p>
                <p className="text-xs">password123</p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl">
                <p className="font-medium text-white mb-1">👤 Cliente</p>
                <p className="text-xs">cliente@ejemplo.com</p>
                <p className="text-xs">password123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
