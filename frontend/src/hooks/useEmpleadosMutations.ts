/**
 * Hook de mutaciones para Empleados
 * Maneja crear, actualizar, eliminar con estados optimistas
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createEmpleado,
  updateEmpleado,
  deleteEmpleado,
  toggleEmpleadoEstado,
  type Empleado,
  type CreateEmpleadoDto,
  type UpdateEmpleadoDto,
} from '@/services/empleados.service';

export function useEmpleadosMutations() {
  const queryClient = useQueryClient();

  // ==========================================
  // CREAR EMPLEADO
  // ==========================================
  const crearEmpleado = useMutation({
    mutationFn: (data: CreateEmpleadoDto) => createEmpleado(data),
    onMutate: async (newEmpleado) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries({ queryKey: ['empleados'] });

      // Snapshot del estado anterior
      const previousEmpleados = queryClient.getQueryData<Empleado[]>(['empleados']);

      // Optimistic update
      if (previousEmpleados) {
        const optimisticEmpleado: Empleado = {
          id_empleado: Date.now(), // ID temporal
          ...newEmpleado,
          fecha_contratacion: newEmpleado.fecha_contratacion || new Date().toISOString(),
          estado: 'activo',
        };
        queryClient.setQueryData<Empleado[]>(['empleados'], [optimisticEmpleado, ...previousEmpleados]);
      }

      return { previousEmpleados };
    },
    onError: (error, _variables, context) => {
      // Rollback en caso de error
      if (context?.previousEmpleados) {
        queryClient.setQueryData(['empleados'], context.previousEmpleados);
      }
      
      const errorMsg = error instanceof Error ? error.message : 'Error al crear empleado';
      toast.error('Error al crear empleado', {
        description: errorMsg,
      });
    },
    onSuccess: (data) => {
      toast.success('Empleado creado', {
        description: `${data.nombre} ${data.apellido} ha sido registrado correctamente`,
      });
    },
    onSettled: () => {
      // Refetch para sincronizar con el servidor
      queryClient.invalidateQueries({ queryKey: ['empleados'] });
    },
  });

  // ==========================================
  // ACTUALIZAR EMPLEADO
  // ==========================================
  const actualizarEmpleado = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmpleadoDto }) => updateEmpleado(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['empleados'] });

      const previousEmpleados = queryClient.getQueryData<Empleado[]>(['empleados']);

      // Optimistic update
      if (previousEmpleados) {
        queryClient.setQueryData<Empleado[]>(
          ['empleados'],
          previousEmpleados.map((emp) =>
            emp.id_empleado === id ? { ...emp, ...data } : emp
          )
        );
      }

      return { previousEmpleados };
    },
    onError: (error, _variables, context) => {
      if (context?.previousEmpleados) {
        queryClient.setQueryData(['empleados'], context.previousEmpleados);
      }
      
      const errorMsg = error instanceof Error ? error.message : 'Error al actualizar empleado';
      toast.error('Error al actualizar', {
        description: errorMsg,
      });
    },
    onSuccess: (data) => {
      toast.success('Empleado actualizado', {
        description: `Los datos de ${data.nombre} ${data.apellido} han sido actualizados`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['empleados'] });
    },
  });

  // ==========================================
  // ELIMINAR EMPLEADO
  // ==========================================
  const eliminarEmpleado = useMutation({
    mutationFn: (id: number) => deleteEmpleado(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['empleados'] });

      const previousEmpleados = queryClient.getQueryData<Empleado[]>(['empleados']);

      // Optimistic update
      if (previousEmpleados) {
        queryClient.setQueryData<Empleado[]>(
          ['empleados'],
          previousEmpleados.filter((emp) => emp.id_empleado !== id)
        );
      }

      return { previousEmpleados };
    },
    onError: (error, _variables, context) => {
      if (context?.previousEmpleados) {
        queryClient.setQueryData(['empleados'], context.previousEmpleados);
      }
      
      const errorMsg = error instanceof Error ? error.message : 'Error al eliminar empleado';
      toast.error('Error al eliminar', {
        description: errorMsg,
      });
    },
    onSuccess: () => {
      toast.success('Empleado eliminado', {
        description: 'El empleado ha sido eliminado correctamente',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['empleados'] });
    },
  });

  // ==========================================
  // CAMBIAR ESTADO (ACTIVO/INACTIVO)
  // ==========================================
  const toggleEstado = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: 'activo' | 'inactivo' }) =>
      toggleEmpleadoEstado(id, estado),
    onMutate: async ({ id, estado }) => {
      await queryClient.cancelQueries({ queryKey: ['empleados'] });

      const previousEmpleados = queryClient.getQueryData<Empleado[]>(['empleados']);

      // Optimistic update
      if (previousEmpleados) {
        queryClient.setQueryData<Empleado[]>(
          ['empleados'],
          previousEmpleados.map((emp) =>
            emp.id_empleado === id ? { ...emp, estado } : emp
          )
        );
      }

      return { previousEmpleados };
    },
    onError: (error, _variables, context) => {
      if (context?.previousEmpleados) {
        queryClient.setQueryData(['empleados'], context.previousEmpleados);
      }
      
      const errorMsg = error instanceof Error ? error.message : 'Error al cambiar estado';
      toast.error('Error al cambiar estado', {
        description: errorMsg,
      });
    },
    onSuccess: (data) => {
      const estadoTexto = data.estado === 'activo' ? 'activado' : 'desactivado';
      toast.success(`Empleado ${estadoTexto}`, {
        description: `${data.nombre} ${data.apellido} ha sido ${estadoTexto}`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['empleados'] });
    },
  });

  return {
    crearEmpleado,
    actualizarEmpleado,
    eliminarEmpleado,
    toggleEstado,
  };
}
