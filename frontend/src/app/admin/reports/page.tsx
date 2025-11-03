"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { api } from "@/lib/api";
import ErrorAlert from "@/components/ui/ErrorAlert";
import StatsCard from "@/components/ui/StatsCard";
import Loader from "@/components/ui/Loader";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type Kpis = {
  ventasHoy: number;
  facturasPendientes: number;
  ordenesEnProceso: number;
};

type VentasSemana = {
  labels: string[];
  data: number[];
};

type RepuestoBajo = {
  id_repuesto: number;
  nombre: string;
  descripcion: string | null;
  unidad_medida: string;
  cantidad_existente: number;
  precio_unitario: number;
  nivel_minimo_alerta: number;
};

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "USD" }).format(
    n || 0
  );

export default function ReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [ventasSemana, setVentasSemana] = useState<VentasSemana | null>(null);
  const [stockBajo, setStockBajo] = useState<RepuestoBajo[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        // Use the centralized API helper (handles 401 and base URL)
        const [kpisData, ventasData, stockData] = await Promise.all([
          api.get<Kpis>("/stats/kpis"),
          api.get<VentasSemana>("/stats/ventas-semana"),
          api.get<RepuestoBajo[]>("/stats/stock-bajo"),
        ]);

        setKpis(kpisData);
        setVentasSemana(ventasData);
        setStockBajo(stockData);
        setError(null);
      } catch (e: any) {
        setError(e?.message || "Error al cargar reportes");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Reportes y Estadísticas</h2>
          <p className="text-gray-600 text-sm mt-1">Resumen del negocio y alertas</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-3 py-2 rounded-md border hover:bg-gray-50"
        >
          ↻ Actualizar
        </button>
      </div>

      {loading && <Loader text="Cargando estadísticas..." />}
      <ErrorAlert message={error} onClose={() => setError(null)} />

      {!loading && !error && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <StatsCard title="Ventas de hoy" value={formatCurrency(kpis?.ventasHoy || 0)} valueClassName="text-green-700" />
            <StatsCard title="Facturas pendientes" value={kpis?.facturasPendientes ?? 0} valueClassName="text-yellow-700" />
            <StatsCard title="Órdenes en proceso" value={kpis?.ordenesEnProceso ?? 0} valueClassName="text-blue-700" />
          </div>

          {/* Ventas últimos 7 días */}
          <div className="bg-gray-50 rounded p-4 mb-6">
            <h3 className="font-semibold mb-3">Ventas últimos 7 días</h3>
            {ventasSemana && (
              <Line
                data={{
                  labels: ventasSemana.labels,
                  datasets: [
                    {
                      label: "Ventas (USD)",
                      data: ventasSemana.data,
                      borderColor: "#2563eb",
                      backgroundColor: "rgba(37, 99, 235, 0.2)",
                      tension: 0.25,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: "top" as const },
                    title: { display: false, text: "" },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) =>
                          typeof value === "number" ? formatCurrency(value) : `${value}`,
                      },
                    },
                  },
                }}
              />
            )}
          </div>

          {/* Stock bajo */}
          <div className="bg-gray-50 rounded p-4">
            <h3 className="font-semibold mb-3">Alerta de stock bajo</h3>
            {stockBajo.length === 0 ? (
              <p className="text-gray-600">No hay repuestos en nivel crítico. ✔️</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-left">Repuesto</th>
                      <th className="px-4 py-2 text-left">Stock</th>
                      <th className="px-4 py-2 text-left">Mínimo</th>
                      <th className="px-4 py-2 text-left">Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockBajo.map((r) => (
                      <tr key={r.id_repuesto} className="border-t">
                        <td className="px-4 py-2">{r.nombre}</td>
                        <td className="px-4 py-2">{r.cantidad_existente}</td>
                        <td className="px-4 py-2">{r.nivel_minimo_alerta}</td>
                        <td className="px-4 py-2">{formatCurrency(r.precio_unitario)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
