'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  nombre?: string;
  apellido?: string;
  rol?: string;
  permissions?: string[];
  _type: 'empleado' | 'cliente';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un token guardado
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      // Decodificar el token para obtener información del usuario
      try {
        const payload = JSON.parse(atob(savedToken.split('.')[1]));
        setUser({
          id: payload.sub,
          email: payload.email,
          rol: payload.rol,
          permissions: payload.permissions || [],
          _type: payload.rol ? 'empleado' : 'cliente',
        });
      } catch (error) {
        console.error('Error decodificando token:', error);
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:3002/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.access_token;
        
        // Decodificar el token para obtener información del usuario
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        const userData: User = {
          id: payload.sub,
          email: payload.email,
          rol: payload.rol,
          permissions: payload.permissions || [],
          _type: payload.rol ? 'empleado' : 'cliente',
        };

        setToken(token);
        setUser(userData);
        localStorage.setItem('token', token);
        return true;
      }
        // Log server response body to help debugging (e.g. 401 reasons)
        try {
          const text = await response.text();
          console.error('Login failed, response:', response.status, text);
        } catch (e) {
          console.error('Login failed, status:', response.status);
        }
        return false;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) || false;
  };

  const hasRole = (role: string): boolean => {
    return user?.rol === role;
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      hasPermission,
      hasRole,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
