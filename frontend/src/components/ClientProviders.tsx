"use client";

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryProvider } from '@/providers/QueryProvider';
import { Toaster } from 'sonner';

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
        <Toaster 
          position="top-right"
          expand={false}
          richColors
          closeButton
          duration={4000}
        />
      </AuthProvider>
    </QueryProvider>
  );
}

export default ClientProviders;
