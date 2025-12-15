'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: '',
    direccion: '',
    empresa: '', 
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
  const validateForm = () => {
    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      setError('El nombre y apellido son requeridos');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Por favor, introduce un email válido');
      return false;
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (!formData.telefono.trim()) {
      setError('El teléfono es requerido');
      return false;
    }
    if (!formData.direccion.trim()) {
      setError('La dirección es requerida');
      return false;
    }
    return true;
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!validateForm()) {
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) {
        switch (response.status) {
          case 409:
            throw new Error('Este email ya está registrado');
          case 400:
            throw new Error(data.message || 'Datos inválidos. Por favor, verifica la información');
          case 422:
            throw new Error('Por favor, verifica los datos ingresados');
          default:
            throw new Error(data.message || 'Error en el registro');
        }
      }
      toast.success('¡Registro exitoso! Redirigiendo al login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en el registro');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#0f0f0f] relative flex items-center justify-center px-4 py-12 overflow-hidden">
      {}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1920&q=80')"
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f0f]/80 via-[#0f0f0f]/60 to-[#0f0f0f]/90"></div>
      {}
      <div className="relative z-10 w-full max-w-2xl">
        {}
        <div className="bg-[#1a1a1a] border border-gray-800 p-8 sm:p-12">
          {}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-600 to-orange-500 mb-6 border border-orange-400/50">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-4xl font-black text-white mb-3 uppercase tracking-tight">Crear Cuenta</h1>
            <p className="text-gray-400 text-lg font-mono">Sistema de Gestión Automotriz</p>
          </div>
          {}
          {error && (
            <div className="mb-6 p-4 bg-red-600/20 border border-red-600">
              <p className="text-red-500 text-center font-medium">{error}</p>
            </div>
          )}
          {}
          <form onSubmit={handleSubmit} className="space-y-6">
            {}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {}
              <div>
                <label htmlFor="nombre" className="block text-gray-400 font-medium mb-3 uppercase tracking-wide text-sm">
                  Nombre
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3 bg-[#2d2d2d] border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="Tu nombre"
                />
              </div>
              {}
              <div>
                <label htmlFor="apellido" className="block text-gray-400 font-medium mb-3 uppercase tracking-wide text-sm">
                  Apellido
                </label>
                <input
                  id="apellido"
                  name="apellido"
                  type="text"
                  required
                  value={formData.apellido}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3 bg-[#2d2d2d] border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="Tu apellido"
                />
              </div>
            </div>
            {}
            <div>
              <label htmlFor="email" className="block text-gray-400 font-medium mb-3 uppercase tracking-wide text-sm">
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
                className="w-full px-5 py-3 bg-[#2d2d2d] border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all font-mono"
                placeholder="correo@ejemplo.com"
              />
            </div>
            {}
            <div>
              <label htmlFor="password" className="block text-gray-400 font-medium mb-3 uppercase tracking-wide text-sm">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3 bg-[#2d2d2d] border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {}
              <div>
                <label htmlFor="telefono" className="block text-gray-400 font-medium mb-3 uppercase tracking-wide text-sm">
                  Teléfono
                </label>
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  required
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3 bg-[#2d2d2d] border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all font-mono"
                  placeholder="Tu teléfono"
                />
              </div>
              {}
              <div>
                <label htmlFor="empresa" className="block text-gray-400 font-medium mb-3 uppercase tracking-wide text-sm">
                  Empresa <span className="text-gray-500 text-sm">(opcional)</span>
                </label>
                <input
                  id="empresa"
                  name="empresa"
                  type="text"
                  value={formData.empresa}
                  onChange={handleInputChange}
                  className="w-full px-5 py-3 bg-[#2d2d2d] border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  placeholder="Nombre de empresa"
                />
              </div>
            </div>
            {}
            <div>
              <label htmlFor="direccion" className="block text-gray-400 font-medium mb-3 uppercase tracking-wide text-sm">
                Dirección
              </label>
              <input
                id="direccion"
                name="direccion"
                type="text"
                required
                value={formData.direccion}
                onChange={handleInputChange}
                className="w-full px-5 py-3 bg-[#2d2d2d] border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                placeholder="Tu dirección completa"
              />
            </div>
            {}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 px-6 bg-gradient-to-r from-orange-600 to-orange-500 border border-orange-400/50 text-white font-black text-lg hover:from-orange-500 hover:to-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wide mt-8"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registrando...
                </span>
              ) : (
                'Crear Mi Cuenta'
              )}
            </button>
            {}
            <div className="text-center mt-6">
              <Link
                href="/login"
                className="text-gray-400 hover:text-orange-500 font-medium text-lg transition-colors font-mono"
              >
                ¿Ya tienes cuenta? <span className="text-orange-500 underline">Inicia sesión</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
