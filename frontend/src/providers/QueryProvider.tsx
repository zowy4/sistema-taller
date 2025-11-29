'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

/**
 * Proveedor de React Query (Tanstack Query)
 * 
 * Configuración global para el manejo de data fetching:
 * - staleTime: 60s - Los datos se consideran frescos durante 1 minuto
 * - refetchOnWindowFocus: false - No recargar al cambiar de pestaña
 * - retry: 1 - Reintentar solo una vez en caso de error
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Los datos son "frescos" durante 60 segundos
            staleTime: 60 * 1000,
            
            // No recargar automáticamente al volver a la ventana
            refetchOnWindowFocus: false,
            
            // Reintentar solo una vez si falla
            retry: 1,
            
            // Tiempo máximo de espera: 10 segundos
            // @ts-ignore - Next.js usa una versión diferente de tipos
            gcTime: 5 * 60 * 1000, // 5 minutos en caché
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
