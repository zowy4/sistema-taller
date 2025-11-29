/**
 * Custom Hook para Mutaciones Optimistas de Repuestos
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  Repuesto, 
  createRepuesto, 
  updateRepuesto, 
  ajustarStock,
  deleteRepuesto 
} from '@/services/repuestos.service';

interface UpdateRepuestoParams {
  id: number;
  data: Partial<Repuesto>;
}

interface AjustarStockParams {
  id: number;
  cantidad: number;
  tipo: 'entrada' | 'salida';
}

export function useRepuestosMutations() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // ==========================================
  // MUTACIÓN: CREAR REPUESTO
  // ==========================================
  const createMutation = useMutation({
    mutationFn: (data: Partial<Repuesto>) => {
      if (!token) throw new Error('No token found');
      return createRepuesto(token, data);
    },

    onMutate: async (newRepuesto) => {
      await queryClient.cancelQueries({ queryKey: ['repuestos'] });

      const previousRepuestos = queryClient.getQueryData<Repuesto[]>(['repuestos']);

      queryClient.setQueryData<Repuesto[]>(['repuestos'], (old = []) => [
        ...old,
        { 
          ...newRepuesto, 
          id_repuesto: Date.now(),
          activo: true,
          fecha_actualizacion: new Date().toISOString(),
        } as Repuesto,
      ]);

      return { previousRepuestos };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repuestos'] });
      queryClient.invalidateQueries({ queryKey: ['alertas-stock-bajo'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stock-bajo'] });
      
      toast.success('Repuesto creado correctamente');
    },

    onError: (error: Error, _newRepuesto, context) => {
      if (context?.previousRepuestos) {
        queryClient.setQueryData(['repuestos'], context.previousRepuestos);
      }

      if (error.message === 'UNAUTHORIZED') {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          router.push('/login');
        }
        return;
      }

      if (error.message === 'FORBIDDEN') {
        toast.error('Sin permisos', { description: 'No tienes permisos para crear repuestos' });
      } else {
        toast.error('Error al crear repuesto', { description: error.message });
      }
    },
  });

  // ==========================================
  // MUTACIÓN: ACTUALIZAR REPUESTO
  // ==========================================
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: UpdateRepuestoParams) => {
      if (!token) throw new Error('No token found');
      return updateRepuesto(token, id, data);
    },

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['repuestos'] });
      await queryClient.cancelQueries({ queryKey: ['repuesto', id] });

      const previousRepuestos = queryClient.getQueryData<Repuesto[]>(['repuestos']);

      queryClient.setQueryData<Repuesto[]>(['repuestos'], (old = []) =>
        old.map((repuesto) =>
          repuesto.id_repuesto === id
            ? { ...repuesto, ...data, fecha_actualizacion: new Date().toISOString() }
            : repuesto
        )
      );

      return { previousRepuestos };
    },

    onSuccess: (_updatedRepuesto, variables) => {
      queryClient.invalidateQueries({ queryKey: ['repuestos'] });
      queryClient.invalidateQueries({ queryKey: ['repuesto', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['alertas-stock-bajo'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stock-bajo'] });
      
      toast.success('Repuesto actualizado correctamente');
    },

    onError: (error: Error, _variables, context) => {
      if (context?.previousRepuestos) {
        queryClient.setQueryData(['repuestos'], context.previousRepuestos);
      }

      if (error.message === 'UNAUTHORIZED') {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          router.push('/login');
        }
        return;
      }

      if (error.message === 'FORBIDDEN') {
        toast.error('Sin permisos', { description: 'No tienes permisos para editar repuestos' });
      } else {
        toast.error('Error al actualizar repuesto', { description: error.message });
      }
    },
  });

  // ==========================================
  // MUTACIÓN: AJUSTAR STOCK
  // ==========================================
  const ajustarStockMutation = useMutation({
    mutationFn: ({ id, cantidad, tipo }: AjustarStockParams) => {
      if (!token) throw new Error('No token found');
      return ajustarStock(token, id, cantidad, tipo);
    },

    onMutate: async ({ id, cantidad, tipo }) => {
      await queryClient.cancelQueries({ queryKey: ['repuestos'] });
      await queryClient.cancelQueries({ queryKey: ['alertas-stock-bajo'] });

      const previousRepuestos = queryClient.getQueryData<Repuesto[]>(['repuestos']);

      // Actualización optimista del stock
      queryClient.setQueryData<Repuesto[]>(['repuestos'], (old = []) =>
        old.map((repuesto) => {
          if (repuesto.id_repuesto === id) {
            const nuevoStock = tipo === 'entrada'
              ? repuesto.stock_actual + cantidad
              : repuesto.stock_actual - cantidad;
            
            return {
              ...repuesto,
              stock_actual: Math.max(0, nuevoStock), // No permitir stock negativo
              fecha_actualizacion: new Date().toISOString(),
            };
          }
          return repuesto;
        })
      );

      return { previousRepuestos };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repuestos'] });
      queryClient.invalidateQueries({ queryKey: ['alertas-stock-bajo'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stock-bajo'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
      
      toast.success('Stock ajustado correctamente');
    },

    onError: (error: Error, _variables, context) => {
      if (context?.previousRepuestos) {
        queryClient.setQueryData(['repuestos'], context.previousRepuestos);
      }

      if (error.message === 'UNAUTHORIZED') {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          router.push('/login');
        }
        return;
      }

      if (error.message.includes('stock insuficiente')) {
        toast.error('Stock insuficiente', { description: 'No hay suficiente stock para realizar la operación' });
      } else {
        toast.error('Error al ajustar stock', { description: error.message });
      }
    },
  });

  // ==========================================
  // MUTACIÓN: ELIMINAR REPUESTO
  // ==========================================
  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!token) throw new Error('No token found');
      return deleteRepuesto(token, id);
    },

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['repuestos'] });

      const previousRepuestos = queryClient.getQueryData<Repuesto[]>(['repuestos']);

      queryClient.setQueryData<Repuesto[]>(['repuestos'], (old = []) =>
        old.filter((repuesto) => repuesto.id_repuesto !== id)
      );

      return { previousRepuestos };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repuestos'] });
      queryClient.invalidateQueries({ queryKey: ['alertas-stock-bajo'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stock-bajo'] });
      
      toast.success('Repuesto eliminado correctamente');
    },

    onError: (error: Error, _id, context) => {
      if (context?.previousRepuestos) {
        queryClient.setQueryData(['repuestos'], context.previousRepuestos);
      }

      if (error.message === 'UNAUTHORIZED') {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          router.push('/login');
        }
        return;
      }

      if (error.message.includes('referencia') || error.message.includes('órdenes')) {
        toast.error('No se puede eliminar', { description: 'El repuesto está siendo usado en órdenes' });
      } else {
        toast.error('Error al eliminar repuesto', { description: error.message });
      }
    },
  });

  return {
    createMutation,
    updateMutation,
    ajustarStockMutation,
    deleteMutation,
  };
}
