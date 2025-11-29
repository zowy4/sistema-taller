/**
 * Custom Hook para Mutaciones Optimistas de Repuestos (Inventario)
 * 
 * Este hook es especial porque maneja la funcionalidad más crítica del taller:
 * el ajuste de stock en tiempo real.
 * 
 * 🔥 AJUSTE DE STOCK OPTIMISTA:
 * Cuando un técnico añade o quita piezas del inventario, la UI se actualiza
 * INSTANTÁNEAMENTE sin esperar al servidor. Si el servidor falla, se revierte
 * automáticamente. Esto es crucial para mantener un flujo de trabajo rápido.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Repuesto, CreateRepuestoDto } from '@/types';
import { 
  createRepuesto, 
  updateRepuesto, 
  deleteRepuesto,
  ajustarStock,
  AjusteStockDto,
} from '@/services/repuestos.service';

interface UpdateRepuestoParams {
  id: number;
  data: Partial<CreateRepuestoDto>;
}

interface AjustarStockParams {
  id: number;
  ajuste: AjusteStockDto;
}

export function useRepuestosMutations() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // ==========================================
  // MUTACIÓN: CREAR REPUESTO
  // ==========================================
  const createMutation = useMutation({
    mutationFn: (data: CreateRepuestoDto) => {
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

    onSuccess: (newRepuesto) => {
      queryClient.invalidateQueries({ queryKey: ['repuestos'] });
      queryClient.invalidateQueries({ queryKey: ['stock-bajo'] });
      
      toast.success('Repuesto creado correctamente', {
        description: `${newRepuesto.nombre} - ${newRepuesto.codigo}`,
      });
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
        toast.error('Sin permisos', {
          description: 'No tienes permisos para crear repuestos',
        });
      } else {
        toast.error('Error al crear repuesto', {
          description: error.message,
        });
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
      queryClient.invalidateQueries({ queryKey: ['stock-bajo'] });
      
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
        toast.error('Sin permisos', {
          description: 'No tienes permisos para editar repuestos',
        });
      } else {
        toast.error('Error al actualizar repuesto', {
          description: error.message,
        });
      }
    },
  });

  // ==========================================
  // 🔥 MUTACIÓN CRÍTICA: AJUSTAR STOCK
  // ==========================================
  const ajustarStockMutation = useMutation({
    mutationFn: ({ id, ajuste }: AjustarStockParams) => {
      if (!token) throw new Error('No token found');
      return ajustarStock(token, id, ajuste);
    },

    onMutate: async ({ id, ajuste }) => {
      await queryClient.cancelQueries({ queryKey: ['repuestos'] });

      const previousRepuestos = queryClient.getQueryData<Repuesto[]>(['repuestos']);

      // 🎯 ACTUALIZACIÓN OPTIMISTA DEL STOCK
      queryClient.setQueryData<Repuesto[]>(['repuestos'], (old = []) =>
        old.map((repuesto) => {
          if (repuesto.id_repuesto === id) {
            const nuevoStock = repuesto.stock_actual + ajuste.cantidad;
            return {
              ...repuesto,
              stock_actual: Math.max(0, nuevoStock),
              fecha_actualizacion: new Date().toISOString(),
            };
          }
          return repuesto;
        })
      );

      return { previousRepuestos };
    },

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['repuestos'] });
      queryClient.invalidateQueries({ queryKey: ['repuesto', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['stock-bajo'] });
      
      const tipo = variables.ajuste.cantidad > 0 ? 'Entrada' : 'Salida';
      const cantidad = Math.abs(variables.ajuste.cantidad);
      
      toast.success(`${tipo} de stock registrada`, {
        description: `${data.nombre}: ${cantidad} unidad${cantidad !== 1 ? 'es' : ''} (Stock: ${data.stock_actual})`,
      });
    },

    onError: (error: Error, variables, context) => {
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

      if (error.message.includes('insuficiente')) {
        toast.error('Stock insuficiente', {
          description: 'No hay suficientes unidades para realizar la salida',
        });
      } else if (error.message === 'FORBIDDEN') {
        toast.error('Sin permisos', {
          description: 'No tienes permisos para ajustar stock',
        });
      } else {
        toast.error('Error al ajustar stock', {
          description: error.message,
        });
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
      queryClient.invalidateQueries({ queryKey: ['stock-bajo'] });
      
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

      if (error.message === 'FORBIDDEN') {
        toast.error('Sin permisos', {
          description: 'No tienes permisos para eliminar repuestos',
        });
      } else if (error.message.includes('en uso')) {
        toast.error('No se puede eliminar', {
          description: 'El repuesto está siendo usado en órdenes activas',
        });
      } else {
        toast.error('Error al eliminar repuesto', {
          description: error.message,
        });
      }
    },
  });

  return {
    createMutation,
    updateMutation,
    ajustarStockMutation, // 🔥 La estrella del show
    deleteMutation,
  };
}
