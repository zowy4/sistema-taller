/**
 * Custom Hook para Mutaciones Optimistas de Servicios
 * 
 * Maneja la "magia" de las actualizaciones instantáneas:
 * - Actualiza la UI inmediatamente (antes de que responda el servidor)
 * - Si el servidor falla, revierte automáticamente los cambios (rollback)
 * - Maneja loading states y errores de forma centralizada
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  Servicio, 
  CreateServicioDto,
  createServicio, 
  updateServicio, 
  deleteServicio 
} from '@/services/servicios.service';

interface UpdateServicioParams {
  id: number;
  data: Partial<CreateServicioDto>;
}

export function useServiciosMutations() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // ==========================================
  // MUTACIÓN: CREAR SERVICIO
  // ==========================================
  const createMutation = useMutation({
    mutationFn: (data: CreateServicioDto) => {
      if (!token) throw new Error('No token found');
      return createServicio(token, data);
    },

    onMutate: async (newServicio) => {
      await queryClient.cancelQueries({ queryKey: ['servicios'] });

      const previousServicios = queryClient.getQueryData<Servicio[]>(['servicios']);

      queryClient.setQueryData<Servicio[]>(['servicios'], (old = []) => [
        ...old,
        { 
          ...newServicio, 
          id_servicio: Date.now(),
          activo: newServicio.activo ?? true,
        } as Servicio,
      ]);

      return { previousServicios };
    },

    onSuccess: (newServicio) => {
      queryClient.invalidateQueries({ queryKey: ['servicios'] });
      
      toast.success('Servicio creado correctamente', {
        description: newServicio.nombre,
      });
    },

    onError: (error: Error, _newServicio, context) => {
      if (context?.previousServicios) {
        queryClient.setQueryData(['servicios'], context.previousServicios);
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
          description: 'No tienes permisos para crear servicios',
        });
      } else {
        toast.error('Error al crear servicio', {
          description: error.message,
        });
      }
    },
  });

  // ==========================================
  // MUTACIÓN: ACTUALIZAR SERVICIO
  // ==========================================
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: UpdateServicioParams) => {
      if (!token) throw new Error('No token found');
      return updateServicio(token, id, data);
    },

    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['servicios'] });
      await queryClient.cancelQueries({ queryKey: ['servicio', id] });

      const previousServicios = queryClient.getQueryData<Servicio[]>(['servicios']);

      queryClient.setQueryData<Servicio[]>(['servicios'], (old = []) =>
        old.map((servicio) =>
          servicio.id_servicio === id
            ? { ...servicio, ...data }
            : servicio
        )
      );

      return { previousServicios };
    },

    onSuccess: (_updatedServicio, variables) => {
      queryClient.invalidateQueries({ queryKey: ['servicios'] });
      queryClient.invalidateQueries({ queryKey: ['servicio', variables.id] });
      
      toast.success('Servicio actualizado correctamente');
    },

    onError: (error: Error, _variables, context) => {
      if (context?.previousServicios) {
        queryClient.setQueryData(['servicios'], context.previousServicios);
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
          description: 'No tienes permisos para editar servicios',
        });
      } else {
        toast.error('Error al actualizar servicio', {
          description: error.message,
        });
      }
    },
  });

  // ==========================================
  // MUTACIÓN: TOGGLE ESTADO (ACTIVO/INACTIVO)
  // ==========================================
  const toggleEstadoMutation = useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) => {
      if (!token) throw new Error('No token found');
      return updateServicio(token, id, { activo });
    },

    onMutate: async ({ id, activo }) => {
      await queryClient.cancelQueries({ queryKey: ['servicios'] });

      const previousServicios = queryClient.getQueryData<Servicio[]>(['servicios']);

      queryClient.setQueryData<Servicio[]>(['servicios'], (old = []) =>
        old.map((servicio) =>
          servicio.id_servicio === id
            ? { ...servicio, activo }
            : servicio
        )
      );

      return { previousServicios };
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['servicios'] });
      
      const estadoTexto = data.activo ? 'activado' : 'desactivado';
      toast.success(`Servicio ${estadoTexto}`, {
        description: data.nombre,
      });
    },

    onError: (error: Error, _variables, context) => {
      if (context?.previousServicios) {
        queryClient.setQueryData(['servicios'], context.previousServicios);
      }

      if (error.message === 'UNAUTHORIZED') {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          router.push('/login');
        }
        return;
      }

      toast.error('Error al cambiar estado', {
        description: error.message,
      });
    },
  });

  // ==========================================
  // MUTACIÓN: ELIMINAR SERVICIO
  // ==========================================
  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!token) throw new Error('No token found');
      return deleteServicio(token, id);
    },

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['servicios'] });

      const previousServicios = queryClient.getQueryData<Servicio[]>(['servicios']);

      queryClient.setQueryData<Servicio[]>(['servicios'], (old = []) =>
        old.filter((servicio) => servicio.id_servicio !== id)
      );

      return { previousServicios };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicios'] });
      
      toast.success('Servicio eliminado correctamente');
    },

    onError: (error: Error, _id, context) => {
      if (context?.previousServicios) {
        queryClient.setQueryData(['servicios'], context.previousServicios);
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
          description: 'No tienes permisos para eliminar servicios',
        });
      } else if (error.message.includes('en uso') || error.message.includes('órdenes')) {
        toast.error('No se puede eliminar', {
          description: 'El servicio está en uso en órdenes activas',
        });
      } else {
        toast.error('Error al eliminar servicio', {
          description: error.message,
        });
      }
    },
  });

  return {
    createMutation,
    updateMutation,
    toggleEstadoMutation,
    deleteMutation,
  };
}
