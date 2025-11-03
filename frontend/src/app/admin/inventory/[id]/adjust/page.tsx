"use client";

import { use, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import Loader from '@/components/ui/Loader';
import ErrorAlert from '@/components/ui/ErrorAlert';

interface Repuesto {
  id_repuesto: number;
  nombre: string;
  descripcion?: string | null;
  unidad_medida: string;
  cantidad_existente: number;
  precio_unitario: number;
  nivel_minimo_alerta: number;
}

type TipoMovimiento = 'entrada' | 'salida';

export default function AdjustStockPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repuesto, setRepuesto] = useState<Repuesto | null>(null);

  const [tipoMovimiento, setTipoMovimiento] = useState<TipoMovimiento>('entrada');
  const [cantidad, setCantidad] = useState<number>(1);
  const [motivo, setMotivo] = useState<string>('');

  const fetchRepuestoData = useCallback(async () => {
    try {
      const data = await api.get<Repuesto>(`/repuestos/${id}`);
      setRepuesto(data);
      setError(null);
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Error al cargar el repuesto';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRepuestoData();
  }, [fetchRepuestoData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cantidad <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }

    if (tipoMovimiento === 'salida' && repuesto && cantidad > repuesto.cantidad_existente) {
      if (!confirm(`⚠️ ADVERTENCIA: Estás intentando retirar ${cantidad} unidades, pero solo hay ${repuesto.cantidad_existente} en stock. Esto dejará el stock en negativo (${repuesto.cantidad_existente - cantidad}). ¿Continuar de todos modos?`)) {
        return;
      }
    }

    setSaving(true);
    setError(null);

    try {
      // Cantidad positiva para entradas, negativa para salidas
      const cantidadAjuste = tipoMovimiento === 'entrada' ? cantidad : -cantidad;

      const updatedRepuesto = await api.patch<Repuesto>(
        `/repuestos/${id}/ajustar-stock`,
        { cantidad: cantidadAjuste }
      );
      
      alert(`✅ Stock ajustado exitosamente\n\n` +
            `Stock anterior: ${repuesto?.cantidad_existente}\n` +
            `${tipoMovimiento === 'entrada' ? 'Entrada' : 'Salida'}: ${cantidad}\n` +
            `Stock nuevo: ${updatedRepuesto.cantidad_existente}`);
      
      router.push('/admin/inventory');
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Error al ajustar el stock';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const calcularStockFinal = () => {
    if (!repuesto) return 0;
    return tipoMovimiento === 'entrada' 
      ? repuesto.cantidad_existente + cantidad 
      : repuesto.cantidad_existente - cantidad;
  };

  const stockFinal = calcularStockFinal();
  const quedaBajoMinimo = repuesto ? stockFinal <= repuesto.nivel_minimo_alerta : false;
  const quedaEnCero = stockFinal === 0;
  const quedaNegativo = stockFinal < 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <Loader text="Cargando repuesto..." />
      </div>
    );
  }

  if (error && !repuesto) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-2xl mx-auto">
          <Link href="/admin/inventory" className="text-blue-600 hover:underline text-sm">
            ← Volver al inventario
          </Link>
          <div className="mt-4">
            <ErrorAlert message={error} onClose={() => setError(null)} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/admin/inventory" className="text-blue-600 hover:underline text-sm">
            ← Volver al inventario
          </Link>
          <h2 className="text-2xl font-semibold mt-2">
            📦 Ajustar Stock de Inventario
          </h2>
        </div>

        {/* Tarjeta de información del repuesto */}
        {repuesto && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-lg mb-2">{repuesto.nombre}</h3>
            {repuesto.descripcion && (
              <p className="text-sm text-gray-700 mb-3">{repuesto.descripcion}</p>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Stock actual:</span>
                <p className="font-bold text-lg">
                  {repuesto.cantidad_existente} {repuesto.unidad_medida}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Stock mínimo:</span>
                <p className="font-semibold">
                  {repuesto.nivel_minimo_alerta} {repuesto.unidad_medida}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Precio unitario:</span>
                <p className="font-semibold">${repuesto.precio_unitario.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-gray-600">Estado:</span>
                <p className={`font-semibold ${
                  repuesto.cantidad_existente === 0 ? 'text-red-600' :
                  repuesto.cantidad_existente <= repuesto.nivel_minimo_alerta ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {repuesto.cantidad_existente === 0 ? '❌ Sin stock' :
                   repuesto.cantidad_existente <= repuesto.nivel_minimo_alerta ? '⚠️ Stock bajo' :
                   '✅ Stock OK'}
                </p>
              </div>
            </div>
          </div>
        )}

        <ErrorAlert message={error} onClose={() => setError(null)} />

        {/* Formulario de ajuste */}
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg shadow">
          <div className="space-y-5">
            {/* Tipo de movimiento */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Tipo de Movimiento <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setTipoMovimiento('entrada')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    tipoMovimiento === 'entrada'
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ➕ Entrada (Agregar)
                </button>
                <button
                  type="button"
                  onClick={() => setTipoMovimiento('salida')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    tipoMovimiento === 'salida'
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ➖ Salida (Retirar)
                </button>
              </div>
            </div>

            {/* Cantidad */}
            <div>
              <label htmlFor="cantidad" className="block text-sm font-medium mb-1">
                Cantidad <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="cantidad"
                required
                min="1"
                step="1"
                value={cantidad}
                onChange={(e) => setCantidad(parseInt(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Motivo (opcional) */}
            <div>
              <label htmlFor="motivo" className="block text-sm font-medium mb-1">
                Motivo (opcional)
              </label>
              <textarea
                id="motivo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Compra a proveedor, Uso en orden #1234, Inventario físico, etc."
              />
            </div>

            {/* Preview del cambio */}
            <div className={`p-4 rounded-lg border-2 ${
              quedaNegativo ? 'bg-red-50 border-red-300' :
              quedaEnCero ? 'bg-orange-50 border-orange-300' :
              quedaBajoMinimo ? 'bg-yellow-50 border-yellow-300' :
              'bg-blue-50 border-blue-300'
            }`}>
              <h4 className="font-semibold mb-2">Vista Previa del Cambio:</h4>
              <div className="flex items-center justify-between text-lg">
                <div>
                  <span className="text-gray-600">Stock actual:</span>
                  <span className="font-bold ml-2">{repuesto?.cantidad_existente}</span>
                </div>
                <div className="text-2xl">
                  {tipoMovimiento === 'entrada' ? '➕' : '➖'}
                </div>
                <div>
                  <span className="text-gray-600">Cantidad:</span>
                  <span className="font-bold ml-2">{cantidad}</span>
                </div>
                <div className="text-2xl">=</div>
                <div>
                  <span className="text-gray-600">Stock final:</span>
                  <span className={`font-bold ml-2 text-xl ${
                    quedaNegativo ? 'text-red-600' :
                    quedaEnCero ? 'text-orange-600' :
                    quedaBajoMinimo ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {stockFinal}
                  </span>
                </div>
              </div>

              {/* Alertas */}
              {quedaNegativo && (
                <div className="mt-3 bg-red-100 text-red-800 p-2 rounded text-sm">
                  ⛔ <strong>ADVERTENCIA:</strong> El stock quedará en negativo. Verifica la cantidad.
                </div>
              )}
              {quedaEnCero && !quedaNegativo && (
                <div className="mt-3 bg-orange-100 text-orange-800 p-2 rounded text-sm">
                  ⚠️ <strong>ATENCIÓN:</strong> El stock quedará en CERO.
                </div>
              )}
              {quedaBajoMinimo && !quedaEnCero && !quedaNegativo && (
                <div className="mt-3 bg-yellow-100 text-yellow-800 p-2 rounded text-sm">
                  ⚠️ <strong>Alerta:</strong> El stock quedará por debajo del nivel mínimo ({repuesto?.nivel_minimo_alerta}).
                </div>
              )}
            </div>

            {/* Ejemplos de uso */}
            <div className="bg-gray-100 p-3 rounded text-xs text-gray-700">
              <strong>💡 Ejemplos de uso:</strong>
              <ul className="mt-1 ml-4 space-y-1">
                <li>• <strong>Entrada:</strong> Compra de 50 unidades al proveedor</li>
                <li>• <strong>Salida:</strong> Uso de 3 unidades en reparación de orden #1234</li>
                <li>• <strong>Entrada:</strong> Devolución de 2 unidades de cliente</li>
                <li>• <strong>Salida:</strong> Ajuste por inventario físico</li>
              </ul>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={saving || cantidad <= 0}
              className={`px-6 py-2 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                tipoMovimiento === 'entrada'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {saving ? '🔄 Procesando...' : `✅ Confirmar ${tipoMovimiento === 'entrada' ? 'Entrada' : 'Salida'}`}
            </button>
            <Link
              href="/admin/inventory"
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition-colors inline-block"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
