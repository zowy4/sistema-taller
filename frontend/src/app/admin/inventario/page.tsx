'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InventarioRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/inventory');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">📦</div>
        <p className="text-xl text-gray-600">Redirigiendo al inventario...</p>
      </div>
    </div>
  );
}
