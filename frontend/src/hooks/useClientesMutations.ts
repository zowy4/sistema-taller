/**
 * Custom Hook para Mutaciones Optimistas de Clientes
 * 
 * Este hook encapsula toda la lógica de mutaciones con actualizaciones optimistas:
 * - Actualiza la UI instantáneamente (antes de que responda el servidor)
 * - Si el servidor falla, revierte automáticamente los cambios (rollback)
 * - Maneja loading states y errores de forma centralizada
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  Cliente, 
  createCliente, 
  updateCliente, 
  deleteCliente 
} from '@/services/clientes.service';

interface UpdateClienteParams {
  id: number;
  data: Partial<Cliente>;
}

export function useClientesMutations() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // ==========================================
  // MUTACIÓN: CREAR CLIENTE
  // ==========================================
  const createMutation = useMutation({
    mutationFn: (data: Omit<Cliente, 'id_cliente' | 'fecha_registro'>) => {
      if (!token) throw new Error('No token found');
      return createCliente(token, data);
    },

    // onMutate se ejecuta ANTES de enviar al servidor (Optimistic Update)
    onMutate: async (newCliente) => {
      // Cancelar queries en curso para evitar que sobrescriban nuestra actualización optimista
      await queryClient.cancelQueries({ queryKey: ['clientes'] });

      // Guardar el estado anterior por si necesitamos hacer rollback
      const previousClientes = queryClient.getQueryData<Cliente[]>(['clientes']);

      // Actualizar la caché INMEDIATAMENTE con el nuevo cliente (con ID temporal)
      queryClient.setQueryData<Cliente[]>(['clientes'], (old = []) => [
        ...old,
        { 
          ...newCliente, 
          id_cliente: Date.now(), // ID temporal hasta que el servidor responda
          activo: true,
          fecha_registro: new Date().toISOString(),
        } as Cliente,
      ]);

      // Retornar contexto para usar en onError (rollback)
      return { previousClientes };
    },

    // onSuccess se ejecuta cuando el servidor responde OK
    onSuccess: (newCliente) => {
      // Invalidar y refetch para obtener los datos reales del servidor
      // (con el ID correcto, timestamps exactos, etc.)
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      
      // Mostrar mensaje de éxito
      toast.success('Cliente creado correctamente', {
        description: `${newCliente.nombre} ${newCliente.apellido}`,
      });
    },

    // onError se ejecuta si el servidor falla
    onError: (error: Error, _newCliente, context) => {
      // Rollback: restaurar el estado anterior
      if (context?.previousClientes) {
        queryClient.setQueryData(['clientes'], context.previousClientes);
      }

      // Manejar errores de autenticación
      if (error.message === 'UNAUTHORIZED') {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          router.push('/login');
        }
        return;
      }

      // Mostrar error al usuario
      if (error.message === 'FORBIDDEN') {
        toast.error('Sin permisos', {
          description: 'No tienes permisos para crear clientes',
        });
      } else {
        toast.error('Error al crear cliente', {
          description: error.message,
        });
      }
    },
  });

  // ==========================================
  // MUTACIÓN: ACTUALIZAR CLIENTE
  // ==========================================
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: UpdateClienteParams) => {
      if (!token) throw new Error('No token found');
      return updateCliente(token, id, data);
    },

    // Actualización optimista
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['clientes'] });

      const previousClientes = queryClient.getQueryData<Cliente[]>(['clientes']);

      // Actualizar la caché INMEDIATAMENTE
      queryClient.setQueryData<Cliente[]>(['clientes'], (old = []) =>
        old.map((cliente) =>
          cliente.id_cliente === id
            ? { ...cliente, ...data } // Merge de datos antiguos + nuevos
            : cliente
        )
      );

      return { previousClientes };
    },

    onSuccess: (_updatedCliente, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['cliente', variables.id] });
      
      toast.success('Cliente actualizado correctamente');
    },

    onError: (error: Error, _variables, context) => {
      // Rollback
      if (context?.previousClientes) {
        queryClient.setQueryData(['clientes'], context.previousClientes);
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
          description: 'No tienes permisos para editar clientes',
        });
      } else {
        toast.error('Error al actualizar cliente', {
          description: error.message,
        });
      }
    },
  });

  // ==========================================
  // MUTACIÓN: ELIMINAR CLIENTE
  // ==========================================
  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!token) throw new Error('No token found');
      return deleteCliente(token, id);
    },

    // Actualización optimista: eliminar de la UI INMEDIATAMENTE
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['clientes'] });

      const previousClientes = queryClient.getQueryData<Cliente[]>(['clientes']);

      // Eliminar el cliente de la caché (desaparece al instante de la UI)
      queryClient.setQueryData<Cliente[]>(['clientes'], (old = []) =>
        old.filter((cliente) => cliente.id_cliente !== id)
      );

      return { previousClientes };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      
      toast.success('Cliente eliminado correctamente');
    },

    onError: (error: Error, _id, context) => {
      // Rollback: el cliente VUELVE A APARECER en la tabla
      if (context?.previousClientes) {
        queryClient.setQueryData(['clientes'], context.previousClientes);
      }

      if (error.message === 'UNAUTHORIZED') {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          router.push('/login');
        }
        return;
      }

      // Error común: cliente tiene órdenes activas
      if (error.message === 'FORBIDDEN') {
        toast.error('Sin permisos', {
          description: 'No tienes permisos para eliminar clientes',
        });
      } else if (error.message.includes('referencia') || error.message.includes('órdenes')) {
        toast.error('No se puede eliminar', {
          description: 'El cliente tiene órdenes activas',
        });
      } else {
        toast.error('Error al eliminar cliente', {
          description: error.message,
        });
      }
    },
  });

  // Retornar todas las mutaciones para uso en componentes
  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
