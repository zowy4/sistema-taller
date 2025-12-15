import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Proveedor, CreateProveedorDto } from '@/types';
import { 
  createProveedor, 
  updateProveedor, 
  deleteProveedor,
} from '@/services/proveedores.service';
interface UpdateProveedorParams {
  id: number;
  data: Partial<CreateProveedorDto>;
}
export function useProveedoresMutations() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const createMutation = useMutation({
    mutationFn: (data: CreateProveedorDto) => {
      if (!token) throw new Error('No token found');
      return createProveedor(token, data);
    },
    onMutate: async (newProveedor) => {
      await queryClient.cancelQueries({ queryKey: ['proveedores'] });
      const previousProveedores = queryClient.getQueryData<Proveedor[]>(['proveedores']);
      queryClient.setQueryData<Proveedor[]>(['proveedores'], (old = []) => [
        ...old,
        { 
          ...newProveedor, 
          id_proveedor: Date.now(),
          activo: true,
          _count: { compras: 0, repuestos: 0 },
        } as Proveedor,
      ]);
      return { previousProveedores };
    },
    onSuccess: (newProveedor) => {
      queryClient.invalidateQueries({ queryKey: ['proveedores'] });
      toast.success('Proveedor creado correctamente', {
        description: `${newProveedor.nombre} ${newProveedor.empresa ? `(${newProveedor.empresa})` : ''}`,
      });
    },
    onError: (error: Error, _newProveedor, context) => {
      if (context?.previousProveedores) {
        queryClient.setQueryData(['proveedores'], context.previousProveedores);
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
          description: 'No tienes permisos para crear proveedores',
        });
      } else {
        toast.error('Error al crear proveedor', {
          description: error.message,
        });
      }
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: UpdateProveedorParams) => {
      if (!token) throw new Error('No token found');
      return updateProveedor(token, id, data);
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['proveedores'] });
      await queryClient.cancelQueries({ queryKey: ['proveedor', id] });
      const previousProveedores = queryClient.getQueryData<Proveedor[]>(['proveedores']);
      queryClient.setQueryData<Proveedor[]>(['proveedores'], (old = []) =>
        old.map((proveedor) =>
          proveedor.id_proveedor === id
            ? { ...proveedor, ...data }
            : proveedor
        )
      );
      return { previousProveedores };
    },
    onSuccess: (_updatedProveedor, variables) => {
      queryClient.invalidateQueries({ queryKey: ['proveedores'] });
      queryClient.invalidateQueries({ queryKey: ['proveedor', variables.id] });
      toast.success('Proveedor actualizado correctamente');
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousProveedores) {
        queryClient.setQueryData(['proveedores'], context.previousProveedores);
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
          description: 'No tienes permisos para editar proveedores',
        });
      } else {
        toast.error('Error al actualizar proveedor', {
          description: error.message,
        });
      }
    },
  });
  const toggleEstadoMutation = useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) => {
      if (!token) throw new Error('No token found');
      return updateProveedor(token, id, { activo } as Partial<CreateProveedorDto>);
    },
    onMutate: async ({ id, activo }) => {
      await queryClient.cancelQueries({ queryKey: ['proveedores'] });
      const previousProveedores = queryClient.getQueryData<Proveedor[]>(['proveedores']);
      queryClient.setQueryData<Proveedor[]>(['proveedores'], (old = []) =>
        old.map((proveedor) =>
          proveedor.id_proveedor === id
            ? { ...proveedor, activo }
            : proveedor
        )
      );
      return { previousProveedores };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['proveedores'] });
      const estadoTexto = data.activo ? 'activado' : 'desactivado';
      toast.success(`Proveedor ${estadoTexto}`, {
        description: data.nombre,
      });
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousProveedores) {
        queryClient.setQueryData(['proveedores'], context.previousProveedores);
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
  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!token) throw new Error('No token found');
      return deleteProveedor(token, id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['proveedores'] });
      const previousProveedores = queryClient.getQueryData<Proveedor[]>(['proveedores']);
      queryClient.setQueryData<Proveedor[]>(['proveedores'], (old = []) =>
        old.filter((proveedor) => proveedor.id_proveedor !== id)
      );
      return { previousProveedores };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proveedores'] });
      toast.success('Proveedor eliminado correctamente');
    },
    onError: (error: Error, _id, context) => {
      if (context?.previousProveedores) {
        queryClient.setQueryData(['proveedores'], context.previousProveedores);
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
          description: 'No tienes permisos para eliminar proveedores',
        });
      } else if (error.message.includes('compras asociadas')) {
        toast.error('No se puede eliminar', {
          description: 'El proveedor tiene compras registradas',
        });
      } else {
        toast.error('Error al eliminar proveedor', {
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
