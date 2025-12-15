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
        const raw = localStorage.getItem('token');
        try {
          if (raw) {
            const payload = JSON.parse(atob(raw.split('.')[1]));
            const rol = payload.rol as string | undefined;
            if (rol === 'cliente') {
              router.push('/portal');
            } else if (rol === 'recepcion') {
              router.push('/recepcion');
            } else if (rol === 'admin' || rol === 'supervisor') {
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
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12 overflow-hidden bg-[#0f0f0f]">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1920&q=80')"
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#1a1a1a] to-black"></div>
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)"
        }}
      ></div>
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-[#1a1a1a] border border-gray-800 shadow-2xl shadow-black/50 p-8 sm:p-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 mb-6 shadow-lg shadow-orange-500/30">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">ACCESO AL SISTEMA</h1>
            <p className="text-gray-500 text-sm font-mono uppercase tracking-wide">Gestión Industrial de Taller</p>
          </div>
          {error && (
            <div className="mb-6 p-4 bg-red-600/20 border border-red-600 backdrop-blur-sm">
              <p className="text-red-400 text-center font-mono text-sm">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-gray-400 font-mono mb-2 text-xs uppercase tracking-wide">
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
                className="w-full px-4 py-3 bg-[#2d2d2d] border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all font-mono text-sm"
                placeholder="usuario@taller.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-gray-400 font-mono mb-2 text-xs uppercase tracking-wide">
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
                  className="w-full px-4 py-3 bg-[#2d2d2d] border border-gray-700 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all font-mono text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-500 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-black text-sm tracking-wide uppercase hover:from-orange-700 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-500/30 mt-8 border border-orange-400/50"
            >
              {loading ? (
                <span className="flex items-center justify-center font-mono">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  ACCEDIENDO...
                </span>
              ) : (
                'ACCEDER AL SISTEMA'
              )}
            </button>
            <div className="text-center mt-6">
              <Link
                href="/register"
                className="text-gray-400 hover:text-orange-500 font-mono text-xs uppercase tracking-wide transition-colors"
              >
                ¿Sin cuenta? <span className="text-orange-500 font-bold">REGISTRARSE ?</span>
              </Link>
            </div>
          </form>
          <div className="mt-10 p-6 bg-[#2d2d2d] border border-gray-800">
            <h3 className="text-white font-mono font-bold mb-4 text-center text-xs uppercase tracking-wide">
              ?? Acceso Rápido de Prueba
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-[#1a1a1a] border border-gray-800 p-3">
                <p className="font-mono font-bold text-orange-500 mb-2">ADMIN</p>
                <p className="text-gray-400 font-mono">admin@taller.com</p>
                <p className="text-gray-500 font-mono">password123</p>
              </div>
              <div className="bg-[#1a1a1a] border border-gray-800 p-3">
                <p className="font-mono font-bold text-orange-500 mb-2">TÉCNICO</p>
                <p className="text-gray-400 font-mono">tecnico@taller.com</p>
                <p className="text-gray-500 font-mono">password123</p>
              </div>
              <div className="bg-[#1a1a1a] border border-gray-800 p-3">
                <p className="font-mono font-bold text-orange-500 mb-2">RECEPCIÓN</p>
                <p className="text-gray-400 font-mono">recepcion@taller.com</p>
                <p className="text-gray-500 font-mono">password123</p>
              </div>
              <div className="bg-[#1a1a1a] border border-gray-800 p-3">
                <p className="font-mono font-bold text-orange-500 mb-2">CLIENTE</p>
                <p className="text-gray-400 font-mono">cliente@ejemplo.com</p>
                <p className="text-gray-500 font-mono">password123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
