'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
interface Proveedor {
  id_proveedor: number;
  nombre: string;
  empresa?: string;
}
interface Repuesto {
  id_repuesto: number;
  nombre: string;
  codigo: string;
  stock_actual: number;
  precio_compra: number;
  precio_venta: number;
}
interface RepuestoCompra {
  id_repuesto: number;
  cantidad: number;
  precio_unitario: number;
}
export default function NuevaCompraPage() {
  const router = useRouter();
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idProveedor, setIdProveedor] = useState<number>(0);
  const [estado, setEstado] = useState('completada');
  const [notas, setNotas] = useState('');
  const [repuestosCompra, setRepuestosCompra] = useState<RepuestoCompra[]>([
    { id_repuesto: 0, cantidad: 1, precio_unitario: 0 }
  ]);
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      const [provRes, repRes] = await Promise.all([
        fetch(`${API_URL}/proveedores/activos`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/repuestos`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      if (provRes.status === 401 || repRes.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }
      if (!provRes.ok || !repRes.ok) throw new Error('Error al cargar datos');
      const [provData, repData] = await Promise.all([
        provRes.json(),
        repRes.json()
      ]);
      setProveedores(provData);
      setRepuestos(repData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };
  const addRepuesto = () => {
    setRepuestosCompra([...repuestosCompra, { id_repuesto: 0, cantidad: 1, precio_unitario: 0 }]);
  };
  const removeRepuesto = (index: number) => {
    if (repuestosCompra.length > 1) {
      setRepuestosCompra(repuestosCompra.filter((_, i) => i !== index));
    }
  };
  const updateRepuesto = (index: number, field: keyof RepuestoCompra, value: number) => {
    const updated = [...repuestosCompra];
    updated[index][field] = value;
    setRepuestosCompra(updated);
  };
  const getRepuestoInfo = (id: number) => {
    return repuestos.find(r => r.id_repuesto === id);
  };
  const calculateTotal = () => {
    return repuestosCompra.reduce((sum, item) => {
      return sum + (item.cantidad * item.precio_unitario);
    }, 0);
  };
  const validateForm = () => {
    if (idProveedor === 0) {
      setError('Debe seleccionar un proveedor');
      return false;
    }
    if (repuestosCompra.length === 0) {
      setError('Debe agregar al menos un repuesto');
      return false;
    }
    for (let i = 0; i < repuestosCompra.length; i++) {
      const item = repuestosCompra[i];
      if (item.id_repuesto === 0) {
        setError(`Debe seleccionar un repuesto en la fila ${i + 1}`);
        return false;
      }
      if (item.cantidad <= 0) {
        setError(`La cantidad debe ser mayor a 0 en la fila ${i + 1}`);
        return false;
      }
      if (item.precio_unitario <= 0) {
        setError(`El precio unitario debe ser mayor a 0 en la fila ${i + 1}`);
        return false;
      }
    }
    const ids = repuestosCompra.map(r => r.id_repuesto);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      setError('No puede agregar el mismo repuesto dos veces');
      return false;
    }
    return true;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const total = calculateTotal();
      const body = {
        id_proveedor: idProveedor,
        total,
        estado,
        notas: notas.trim() || undefined,
        repuestos: repuestosCompra
      };
      const res = await fetch(`${API_URL}/compras`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al crear compra');
      }
      alert('Compra registrada exitosamente. El stock se ha actualizado.');
      router.push('/admin/compras');
    } catch (err: any) {
      setError(err.message || 'Error al guardar compra');
    } finally {
      setSaving(false);
    }
  };
  if (loading) return (
    <div className="min-h-screen bg-[#0f0f0f] p-8 flex items-center justify-center">
      <div className="text-gray-400 font-mono uppercase">CARGANDO...</div>
    </div>
  );
  const total = calculateTotal();
  return (
    <div className="min-h-screen bg-[#0f0f0f] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/admin/compras" className="text-gray-400 hover:text-white font-mono uppercase text-sm">
            ← VOLVER
          </Link>
          <h2 className="text-4xl font-bold text-white font-mono uppercase mt-3">NUEVA COMPRA A PROVEEDOR</h2>
        </div>
        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-400 p-4 mb-8 font-mono">{error.toUpperCase()}</div>
        )}
        <form onSubmit={handleSubmit} className="bg-[#1a1a1a] border border-gray-800 p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-mono uppercase text-gray-400 mb-2">
                PROVEEDOR <span className="text-red-400">*</span>
              </label>
              <select
                value={idProveedor}
                onChange={(e) => setIdProveedor(Number(e.target.value))}
                className="w-full px-4 py-3 bg-[#2d2d2d] border border-gray-700 text-white font-mono focus:outline-none focus:border-gray-500"
                required
              >
                <option value={0}>SELECCIONAR PROVEEDOR</option>
                {proveedores.map(p => (
                  <option key={p.id_proveedor} value={p.id_proveedor}>
                    {p.nombre.toUpperCase()} {p.empresa && `- ${p.empresa.toUpperCase()}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-mono uppercase text-gray-400 mb-2">
                ESTADO
              </label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full px-4 py-3 bg-[#2d2d2d] border border-gray-700 text-white font-mono focus:outline-none focus:border-gray-500"
              >
                <option value="completada">COMPLETADA</option>
                <option value="pendiente">PENDIENTE</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-mono uppercase text-gray-400 mb-2">NOTAS</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full px-4 py-3 bg-[#2d2d2d] border border-gray-700 text-white font-mono focus:outline-none focus:border-gray-500"
              rows={3}
              placeholder="INFORMACION ADICIONAL DE LA COMPRA..."
            />
          </div>
          <div className="border-t border-gray-800 pt-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white font-mono uppercase">REPUESTOS</h3>
              <button
                type="button"
                onClick={addRepuesto}
                className="bg-white text-black px-6 py-3 font-mono uppercase font-bold hover:bg-gray-200"
              >
                + AGREGAR REPUESTO
              </button>
            </div>
            <div className="space-y-4">
              {repuestosCompra.map((item, index) => {
                const repInfo = getRepuestoInfo(item.id_repuesto);
                const subtotal = item.cantidad * item.precio_unitario;
                return (
                  <div key={index} className="bg-[#2d2d2d] border border-gray-700 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <span className="font-bold text-white font-mono uppercase">REPUESTO #{index + 1}</span>
                      {repuestosCompra.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRepuesto(index)}
                          className="text-red-400 hover:text-red-300 font-mono uppercase font-bold"
                        >
                          ELIMINAR
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1">
                        <label className="block text-sm font-mono uppercase text-gray-400 mb-2">
                          REPUESTO <span className="text-red-400">*</span>
                        </label>
                        <select
                          value={item.id_repuesto}
                          onChange={(e) => updateRepuesto(index, 'id_repuesto', Number(e.target.value))}
                          className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-600 text-white font-mono focus:outline-none focus:border-gray-500"
                          required
                        >
                          <option value={0}>SELECCIONAR REPUESTO</option>
                          {repuestos.map(r => (
                            <option key={r.id_repuesto} value={r.id_repuesto}>
                              [{r.codigo}] {r.nombre.toUpperCase()}
                            </option>
                          ))}
                        </select>
                        {repInfo && (
                          <p className="text-xs text-gray-500 mt-2 font-mono">
                            CODIGO: {repInfo.codigo} | STOCK ACTUAL: {repInfo.stock_actual} | PRECIO SUGERIDO: ${repInfo.precio_compra?.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-mono uppercase text-gray-400 mb-2">
                          CANTIDAD <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="number"
                          value={item.cantidad}
                          onChange={(e) => updateRepuesto(index, 'cantidad', Number(e.target.value))}
                          className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-600 text-white font-mono focus:outline-none focus:border-gray-500"
                          min={1}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-mono uppercase text-gray-400 mb-2">
                          PRECIO UNITARIO <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="number"
                          value={item.precio_unitario}
                          onChange={(e) => updateRepuesto(index, 'precio_unitario', Number(e.target.value))}
                          className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-600 text-white font-mono focus:outline-none focus:border-gray-500"
                          min={0.01}
                          step={0.01}
                          required
                        />
                      </div>
                    </div>
                    {item.id_repuesto > 0 && item.cantidad > 0 && item.precio_unitario > 0 && (
                      <div className="mt-4 text-right border-t border-gray-600 pt-4">
                        <span className="text-sm font-bold text-white font-mono uppercase">
                          SUBTOTAL: ${subtotal.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <div className="text-right">
              <p className="text-3xl font-bold text-white font-mono uppercase">
                TOTAL: ${total.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="flex gap-4 justify-end pt-4">
            <Link
              href="/admin/compras"
              className="bg-[#2d2d2d] border border-gray-700 text-white px-6 py-3 font-mono uppercase font-bold hover:bg-[#3d3d3d] inline-block"
            >
              CANCELAR
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-white text-black px-6 py-3 font-mono uppercase font-bold hover:bg-gray-200 disabled:opacity-50"
            >
              {saving ? 'GUARDANDO...' : 'REGISTRAR COMPRA'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
