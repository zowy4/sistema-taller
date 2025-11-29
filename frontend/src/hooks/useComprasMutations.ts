/**
 * Custom Hook para Mutaciones Optimistas de Compras
 * 
 * Maneja las operaciones de compras con actualizaciones instantáneas.
 * Nota: Las compras actualizan automáticamente el inventario en el backend.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Compra, CreateCompraDto } from '@/types';
import { 
  createCompra, 
  updateCompraEstado,
  deleteCompra,
} from '@/services/compras.service';

interface UpdateCompraEstadoParams {
  id: number;
  estado: 'pendiente' | 'completada' | 'cancelada';
}

export function useComprasMutations() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // ==========================================
  // MUTACIÓN: CREAR COMPRA
  // ==========================================
  const createMutation = useMutation({
    mutationFn: (data: CreateCompraDto) => {
      if (!token) throw new Error('No token found');
      return createCompra(token, data);
    },

    onMutate: async (newCompra) => {
      await queryClient.cancelQueries({ queryKey: ['compras'] });

      const previousCompras = queryClient.getQueryData<Compra[]>(['compras']);

      // Calcular total
      const total = newCompra.repuestos.reduce(
        (sum, r) => sum + (r.cantidad * r.precio_unitario),
        0
      );

      queryClient.setQueryData<Compra[]>(['compras'], (old = []) => [
        {
          id_compra: Date.now(),
          id_proveedor: newCompra.id_proveedor,
          fecha_compra: newCompra.fecha_compra,
          total,
          estado: 'pendiente' as const,
          notas: newCompra.notas,
          proveedor: {
            nombre: 'Cargando...',
          },
          compras_repuestos: newCompra.repuestos.map(r => ({
            id_repuesto: r.id_repuesto,
            cantidad: r.cantidad,
            precio_unitario: r.precio_unitario,
            subtotal: r.cantidad * r.precio_unitario,
          })),
        } as Compra,
        ...old,
      ]);

      return { previousCompras };
    },

    onSuccess: (newCompra) => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      queryClient.invalidateQueries({ queryKey: ['repuestos'] }); // Actualiza inventario
      
      toast.success('Compra registrada correctamente', {
        description: `Total: $${newCompra.total.toFixed(2)}`,
      });
    },

    onError: (error: Error, _newCompra, context) => {
      if (context?.previousCompras) {
        queryClient.setQueryData(['compras'], context.previousCompras);
      }

      if (error.message === 'UNAUTHORIZED') {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          router.push('/login');
        }
        return;
      }

      if (error.message === 'FORBIDDEN') {
        toast.error('Sin permisos', {
          description: 'No tienes permisos para crear compras',
        });
      } else {
        toast.error('Error al crear compra', {
          description: error.message,
        });
      }
    },
  });

  // ==========================================
  // MUTACIÓN: ACTUALIZAR ESTADO
  // ==========================================
  const updateEstadoMutation = useMutation({
    mutationFn: ({ id, estado }: UpdateCompraEstadoParams) => {
      if (!token) throw new Error('No token found');
      return updateCompraEstado(token, id, estado);
    },

    onMutate: async ({ id, estado }) => {
      await queryClient.cancelQueries({ queryKey: ['compras'] });

      const previousCompras = queryClient.getQueryData<Compra[]>(['compras']);

      queryClient.setQueryData<Compra[]>(['compras'], (old = []) =>
        old.map((compra) =>
          compra.id_compra === id
            ? { ...compra, estado }
            : compra
        )
      );

      return { previousCompras };
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      
      const estadoTexto = {
        pendiente: 'marcada como pendiente',
        completada: 'completada',
        cancelada: 'cancelada',
      }[data.estado];

      toast.success(`Compra ${estadoTexto}`, {
        description: `Total: $${data.total.toFixed(2)}`,
      });
    },

    onError: (error: Error, _variables, context) => {
      if (context?.previousCompras) {
        queryClient.setQueryData(['compras'], context.previousCompras);
      }

      if (error.message === 'UNAUTHORIZED') {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          router.push('/login');
        }
        return;
      }

      toast.error('Error al actualizar estado', {
        description: error.message,
      });
    },
  });

  // ==========================================
  // MUTACIÓN: ELIMINAR COMPRA
  // ==========================================
  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!token) throw new Error('No token found');
      return deleteCompra(token, id);
    },

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['compras'] });

      const previousCompras = queryClient.getQueryData<Compra[]>(['compras']);

      queryClient.setQueryData<Compra[]>(['compras'], (old = []) =>
        old.filter((compra) => compra.id_compra !== id)
      );

      return { previousCompras };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      
      toast.success('Compra eliminada correctamente');
    },

    onError: (error: Error, _id, context) => {
      if (context?.previousCompras) {
        queryClient.setQueryData(['compras'], context.previousCompras);
      }

      if (error.message === 'UNAUTHORIZED') {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          router.push('/login');
        }
        return;
      }

      if (error.message === 'FORBIDDEN') {
        toast.error('Sin permisos', {
          description: 'No tienes permisos para eliminar compras',
        });
      } else if (error.message.includes('procesada')) {
        toast.error('No se puede eliminar', {
          description: 'La compra ya fue procesada',
        });
      } else {
        toast.error('Error al eliminar compra', {
          description: error.message,
        });
      }
    },
  });

  return {
    createMutation,
    updateEstadoMutation,
    deleteMutation,
  };
}
