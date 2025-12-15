import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Factura } from '@/types';
import { 
  createFactura, 
  updateFactura,
  deleteFactura,
} from '@/services/facturas.service';
export function useFacturasMutations() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const createMutation = useMutation({
    mutationFn: (data: Partial<Factura>) => {
      if (!token) throw new Error('No token found');
      return createFactura(token, data);
    },
    onMutate: async (newFactura) => {
      await queryClient.cancelQueries({ queryKey: ['facturas'] });
      const previousFacturas = queryClient.getQueryData<Factura[]>(['facturas']);
      queryClient.setQueryData<Factura[]>(['facturas'], (old = []) => [
        {
          id_factura: Date.now(),
          id_orden: newFactura.id_orden || 0,
          numero_factura: 'TEMP-' + Date.now(),
          fecha_emision: new Date().toISOString(),
          subtotal: newFactura.subtotal || 0,
          impuesto: newFactura.impuesto || 0,
          total: newFactura.total || 0,
          estado_pago: newFactura.estado_pago || 'pendiente',
          metodo_pago: newFactura.metodo_pago,
          notas: newFactura.notas,
        } as Factura,
        ...old,
      ]);
      return { previousFacturas };
    },
    onSuccess: (newFactura) => {
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
      queryClient.invalidateQueries({ queryKey: ['factura', newFactura.id_factura] });
      toast.success('Factura creada correctamente', {
        description: `Total: $${newFactura.total.toFixed(2)}`,
      });
    },
    onError: (error: Error, _newFactura, context) => {
      if (context?.previousFacturas) {
        queryClient.setQueryData(['facturas'], context.previousFacturas);
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
          description: 'No tienes permisos para crear facturas',
        });
      } else {
        toast.error('Error al crear factura', {
          description: error.message,
        });
      }
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Factura> }) => {
      if (!token) throw new Error('No token found');
      return updateFactura(token, id, data);
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['facturas'] });
      const previousFacturas = queryClient.getQueryData<Factura[]>(['facturas']);
      queryClient.setQueryData<Factura[]>(['facturas'], (old = []) =>
        old.map((factura) =>
          factura.id_factura === id
            ? { ...factura, ...data }
            : factura
        )
      );
      return { previousFacturas };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
      queryClient.invalidateQueries({ queryKey: ['factura', data.id_factura] });
      toast.success('Factura actualizada correctamente');
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousFacturas) {
        queryClient.setQueryData(['facturas'], context.previousFacturas);
      }
      if (error.message === 'UNAUTHORIZED') {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          router.push('/login');
        }
        return;
      }
      toast.error('Error al actualizar factura', {
        description: error.message,
      });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!token) throw new Error('No token found');
      return deleteFactura(token, id);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['facturas'] });
      const previousFacturas = queryClient.getQueryData<Factura[]>(['facturas']);
      queryClient.setQueryData<Factura[]>(['facturas'], (old = []) =>
        old.filter((factura) => factura.id_factura !== id)
      );
      return { previousFacturas };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
      toast.success('Factura eliminada correctamente');
    },
    onError: (error: Error, _id, context) => {
      if (context?.previousFacturas) {
        queryClient.setQueryData(['facturas'], context.previousFacturas);
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
          description: 'No tienes permisos para eliminar facturas',
        });
      } else {
        toast.error('Error al eliminar factura', {
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
