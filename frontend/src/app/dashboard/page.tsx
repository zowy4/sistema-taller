'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Usando next/navigation
import { api } from '@/lib/api';
import Loader from '@/components/ui/Loader';
import ErrorAlert from '@/components/ui/ErrorAlert';

// Definimos la "forma" de nuestros datos de cliente
interface Client {
  id_cliente: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
}

export default function DashboardPage() {
  const router = useRouter();

  // Estados
  const [clients, setClients] = useState<Client[]>([]); // Para guardar la lista de clientes
  const [error, setError] = useState<string | null>(null); // Para mostrar errores (ej. 403)
  const [isLoading, setIsLoading] = useState(true); // Para mostrar "Cargando..."
  const [userName, setUserName] = useState<string>(''); // Para mostrar el nombre del usuario

  // Función para cerrar sesión
  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_name'); // Limpiamos también el nombre
    router.push('/login');
  }, [router]);

  // Este useEffect se ejecuta 1 vez cuando la página carga
  useEffect(() => {
    // 1. Leer el access_token de localStorage
  const token = localStorage.getItem('token');
    const storedName = localStorage.getItem('user_name');
    
    setUserName(storedName || 'Usuario');

    // 2. Verificar si el usuario está logueado
    if (!token) {
      // Si no hay token, redirigir a login
      router.push('/login');
      return; // Detener la ejecución
    }

    // 3. Este componente se ejecutará después de que el Dashboard
    // haya verificado que el usuario está logueado.
    // Ahora, llamamos a la API protegida.
    const fetchClients = async () => {
      try {
        // 4. Usar el helper de API (maneja token y 401 automáticamente)
        const data = await api.get<Client[]>('/clientes');
        setClients(data);
        setError(null); // Limpiar errores previos
      } catch (err: unknown) {
        const message = (err as { message?: string })?.message || 'Ocurrió un error desconocido';
        setError(message);
      } finally {
        setIsLoading(false); // Dejar de cargar
      }
    };

    fetchClients(); // Llamar a la función que acabamos de definir
  }, [router, handleLogout]);

  // --- Renderizado ---

  // Mostrar "Cargando..." mientras se verifica el token y se cargan los datos
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <Loader text="Verificando sesión y cargando datos..." />
      </div>
    );
  }

  // Página principal del Dashboard (una vez que todo ha cargado)
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold">Dashboard del Taller</h1>
          <p className="text-lg text-gray-400">Bienvenido, {userName}</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Cerrar Sesión
        </button>
      </header>

      <main>
        <h2 className="text-2xl font-semibold mb-4">Módulo: Lista de Clientes</h2>

        {/* Mostrar el error si existe (ej. Error 403) */}
        {error && (
          <>
            <ErrorAlert message={error} />
            <p className="text-sm text-red-200 mb-6">
              (Si iniciaste sesión como &apos;tecnico&apos;, este error es esperado. Solo los &apos;administradores&apos; pueden ver clientes).
            </p>
          </>
        )}

        {/* Mostrar la tabla SOLO si NO hay error */}
        {!error && (
          <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-lg">
            <table className="min-w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Teléfono</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {clients.map((client) => (
                  <tr key={client.id_cliente} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">{client.id_cliente}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{client.nombre} {client.apellido}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{client.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{client.telefono}</td>
                  </tr>
                ))}
                
                {/* Mensaje si la tabla está vacía (pero no hay error) */}
                {clients.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-400">
                      No se encontraron clientes en la base de datos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}