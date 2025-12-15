'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchClientes, Cliente } from '@/services/clientes.service';
import { useClientesMutations } from '@/hooks/useClientesMutations';
export default function ClientesPageExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
  });
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const { 
    data: clientes = [], 
    isLoading, 
    isError,
    error 
  } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => fetchClientes(token!),
    enabled: !!token,
    retry: 1,
  });
  const { createMutation, updateMutation, deleteMutation } = useClientesMutations();
  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setSelectedCliente(null);
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      direccion: '',
    });
    setIsModalOpen(true);
  };
  const handleOpenEditModal = (cliente: Cliente) => {
    setIsEditMode(true);
    setSelectedCliente(cliente);
    setFormData({
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      email: cliente.email,
      telefono: cliente.telefono,
      direccion: cliente.direccion || '',
    });
    setIsModalOpen(true);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode && selectedCliente) {
      updateMutation.mutate({
        id: selectedCliente.id_cliente,
        data: formData,
      });
    } else {
      createMutation.mutate({
        ...formData,
        activo: true, 
      });
    }
    setIsModalOpen(false);
  };
  const handleDelete = (cliente: Cliente) => {
    const confirmed = confirm(
      `¿Estó¡s seguro de eliminar a ${cliente.nombre} ${cliente.apellido}?`
    );
    if (confirmed) {
      deleteMutation.mutate(cliente.id_cliente);
    }
  };
  const handleToggleActivo = (cliente: Cliente) => {
    updateMutation.mutate({
      id: cliente.id_cliente,
      data: { activo: !cliente.activo },
    });
  };
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="text-gray-600">Cargando clientes...</div>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="bg-red-100 text-red-800 p-4 rounded">
          {error instanceof Error ? error.message : 'Error al cargar clientes'}
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto">
        {}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">‘¥ Clientes</h1>
            <p className="text-gray-600">{clientes.length} clientes registrados</p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Nuevo Cliente
          </button>
        </div>
        {}
        <div className="bg-white border rounded shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Teló©fono</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id_cliente} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {cliente.nombre} {cliente.apellido}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{cliente.email}</td>
                  <td className="px-4 py-3 text-gray-600">{cliente.telefono}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActivo(cliente)}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        cliente.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                      disabled={updateMutation.isPending}
                    >
                      {cliente.activo ? 'ACTIVO' : 'INACTIVO'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEditModal(cliente)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(cliente)}
                      disabled={deleteMutation.isPending}
                      className="text-red-600 hover:underline text-sm disabled:opacity-50"
                    >
                      {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {clientes.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">No hay clientes registrados</p>
          </div>
        )}
        {}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {isEditMode ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Apellido</label>
                  <input
                    type="text"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Teló©fono</label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Dirección</label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? 'Guardando...'
                      : 'Guardar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
