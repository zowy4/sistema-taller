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
  const createMutation = useMutation({
    mutationFn: (data: Omit<Cliente, 'id_cliente' | 'fecha_registro'>) => {
      if (!token) throw new Error('No token found');
      return createCliente(token, data);
    },
    onMutate: async (newCliente) => {
      await queryClient.cancelQueries({ queryKey: ['clientes'] });
      const previousClientes = queryClient.getQueryData<Cliente[]>(['clientes']);
      queryClient.setQueryData<Cliente[]>(['clientes'], (old = []) => [
        ...old,
        { 
          ...newCliente, 
          id_cliente: Date.now(), 
          activo: true,
          fecha_registro: new Date().toISOString(),
        } as Cliente,
      ]);
      return { previousClientes };
    },
    onSuccess: (newCliente) => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Cliente creado correctamente', {
        description: `${newCliente.nombre} ${newCliente.apellido}`,
      });
    },
    onError: (error: Error, _newCliente, context) => {
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
          description: 'No tienes permisos para crear clientes',
        });
      } else {
        toast.error('Error al crear cliente', {
          description: error.message,
        });
      }
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: UpdateClienteParams) => {
      if (!token) throw new Error('No token found');
      return updateCliente(token, id, data);
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['clientes'] });
      const previousClientes = queryClient.getQueryData<Cliente[]>(['clientes']);
      queryClient.setQueryData<Cliente[]>(['clientes'], (old = []) =>
        old.map((cliente) =>
          cliente.id_cliente === id
            ? { ...cliente, ...data } 
            : cliente
        )
      );
      return { previousClientes };
    },
    onSuccess: (_updatedCliente, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['cliente', variables.id] });
      toast.success('Cliente actualizado correctamente');
    },
    onError: (error: Error, _variables, context) => {
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
  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!token) throw new Error('No token found');
      return deleteCliente(token, id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['clientes'] });
      const previousClientes = queryClient.getQueryData<Cliente[]>(['clientes']);
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
          description: 'No tienes permisos para eliminar clientes',
        });
      } else if (error.message.includes('referencia') || error.message.includes('ó³rdenes')) {
        toast.error('No se puede eliminar', {
          description: 'El cliente tiene ó³rdenes activas',
        });
      } else {
        toast.error('Error al eliminar cliente', {
          description: error.message,
        });
      }
    },
  });
  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
