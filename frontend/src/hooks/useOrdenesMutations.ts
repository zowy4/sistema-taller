/**
 * Custom Hook para Mutaciones Optimistas de Órdenes de Trabajo
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  Orden, 
  createOrden, 
  updateOrden, 
  updateEstadoOrden,
  deleteOrden 
} from '@/services/ordenes.service';

interface UpdateOrdenParams {
  id: number;
  data: Partial<Orden>;
}

interface UpdateEstadoParams {
  id: number;
  estado: string;
}

export function useOrdenesMutations() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // ==========================================
  // MUTACIÓN: CREAR ORDEN
  // ==========================================
  const createMutation = useMutation({
    mutationFn: (data: Partial<Orden>) => {
      if (!token) throw new Error('No token found');
      return createOrden(token, data);
    },

    onMutate: async (newOrden) => {
      await queryClient.cancelQueries({ queryKey: ['ordenes'] });
      await queryClient.cancelQueries({ queryKey: ['alertas-ordenes'] });

      const previousOrdenes = queryClient.getQueryData<Orden[]>(['ordenes']);

      queryClient.setQueryData<Orden[]>(['ordenes'], (old = []) => [
        ...old,
        { 
          ...newOrden, 
          id_orden: Date.now(),
          fecha_ingreso: new Date().toISOString(),
          estado: 'pendiente',
          costo_mano_obra: 0,
          costo_repuestos: 0,
          total: 0,
        } as Orden,
      ]);

      return { previousOrdenes };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordenes'] });
      queryClient.invalidateQueries({ queryKey: ['alertas-ordenes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
      
      toast.success('Orden creada correctamente');
    },

    onError: (error: Error, _newOrden, context) => {
      if (context?.previousOrdenes) {
        queryClient.setQueryData(['ordenes'], context.previousOrdenes);
      }

      if (error.message === 'UNAUTHORIZED') {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          router.push('/login');
        }
        return;
      }

      if (error.message === 'FORBIDDEN') {
        toast.error('Sin permisos', { description: 'No tienes permisos para crear órdenes' });
      } else {
        toast.error('Error al crear orden', { description: error.message });
      }
    },
  });

  // ==========================================
  // MUTACIÓN: ACTUALIZAR ORDEN
  // ==========================================
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: UpdateOrdenParams) => {
      if (!token) throw new Error('No token found');
      return updateOrden(token, id, data);
    },

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['ordenes'] });
      await queryClient.cancelQueries({ queryKey: ['orden', id] });

      const previousOrdenes = queryClient.getQueryData<Orden[]>(['ordenes']);

      queryClient.setQueryData<Orden[]>(['ordenes'], (old = []) =>
        old.map((orden) =>
          orden.id_orden === id ? { ...orden, ...data } : orden
        )
      );

      return { previousOrdenes };
    },

    onSuccess: (_updatedOrden, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ordenes'] });
      queryClient.invalidateQueries({ queryKey: ['orden', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
      
      toast.success('Orden actualizada correctamente');
    },

    onError: (error: Error, _variables, context) => {
      if (context?.previousOrdenes) {
        queryClient.setQueryData(['ordenes'], context.previousOrdenes);
      }

      if (error.message === 'UNAUTHORIZED') {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          router.push('/login');
        }
        return;
      }

      if (error.message === 'FORBIDDEN') {
        toast.error('Sin permisos', { description: 'No tienes permisos para editar órdenes' });
      } else {
        toast.error('Error al actualizar orden', { description: error.message });
      }
    },
  });

  // ==========================================
  // MUTACIÓN: ACTUALIZAR ESTADO
  // ==========================================
  const updateEstadoMutation = useMutation({
    mutationFn: ({ id, estado }: UpdateEstadoParams) => {
      if (!token) throw new Error('No token found');
      return updateEstadoOrden(token, id, estado);
    },

    onMutate: async ({ id, estado }) => {
      await queryClient.cancelQueries({ queryKey: ['ordenes'] });
      await queryClient.cancelQueries({ queryKey: ['alertas-ordenes'] });

      const previousOrdenes = queryClient.getQueryData<Orden[]>(['ordenes']);

      queryClient.setQueryData<Orden[]>(['ordenes'], (old = []) =>
        old.map((orden) =>
          orden.id_orden === id ? { ...orden, estado: estado as Orden['estado'] } : orden
        )
      );

      return { previousOrdenes };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordenes'] });
      queryClient.invalidateQueries({ queryKey: ['alertas-ordenes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
      
      toast.success('Estado actualizado correctamente');
    },

    onError: (error: Error, _variables, context) => {
      if (context?.previousOrdenes) {
        queryClient.setQueryData(['ordenes'], context.previousOrdenes);
      }

      if (error.message === 'UNAUTHORIZED') {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          router.push('/login');
        }
        return;
      }

      toast.error('Error al actualizar estado', { description: error.message });
    },
  });

  // ==========================================
  // MUTACIÓN: ELIMINAR ORDEN
  // ==========================================
  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!token) throw new Error('No token found');
      return deleteOrden(token, id);
    },

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['ordenes'] });
      await queryClient.cancelQueries({ queryKey: ['alertas-ordenes'] });

      const previousOrdenes = queryClient.getQueryData<Orden[]>(['ordenes']);

      queryClient.setQueryData<Orden[]>(['ordenes'], (old = []) =>
        old.filter((orden) => orden.id_orden !== id)
      );

      return { previousOrdenes };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordenes'] });
      queryClient.invalidateQueries({ queryKey: ['alertas-ordenes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
      
      toast.success('Orden eliminada correctamente');
    },

    onError: (error: Error, _id, context) => {
      if (context?.previousOrdenes) {
        queryClient.setQueryData(['ordenes'], context.previousOrdenes);
      }

      if (error.message === 'UNAUTHORIZED') {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          router.push('/login');
        }
        return;
      }

      if (error.message.includes('factura') || error.message.includes('referencia')) {
        toast.error('No se puede eliminar', { description: 'La orden tiene una factura asociada' });
      } else {
        toast.error('Error al eliminar orden', { description: error.message });
      }
    },
  });

  return {
    createMutation,
    updateMutation,
    updateEstadoMutation,
    deleteMutation,
  };
}
