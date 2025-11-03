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
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const headers = { Authorization: `Bearer ${token}` } as HeadersInit;

        const [kpisRes, ventasRes, stockRes] = await Promise.all([
          fetch("http://localhost:3002/stats/kpis", { headers }),
          fetch("http://localhost:3002/stats/ventas-semana", { headers }),
          fetch("http://localhost:3002/stats/stock-bajo", { headers }),
        ]);

        if (kpisRes.status === 401 || ventasRes.status === 401 || stockRes.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (!kpisRes.ok || !ventasRes.ok || !stockRes.ok) {
          throw new Error("No se pudieron cargar las estadísticas");
        }

        const kpisData: Kpis = await kpisRes.json();
        const ventasData: VentasSemana = await ventasRes.json();
        const stockData: RepuestoBajo[] = await stockRes.json();

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

      {loading && <p className="py-8 text-center">Cargando estadísticas...</p>}
      {error && (
        <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>
      )}

      {!loading && !error && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded border">
              <div className="text-sm text-gray-500">Ventas de hoy</div>
              <div className="text-2xl font-semibold text-green-700">
                {formatCurrency(kpis?.ventasHoy || 0)}
              </div>
            </div>
            <div className="p-4 rounded border">
              <div className="text-sm text-gray-500">Facturas pendientes</div>
              <div className="text-2xl font-semibold text-yellow-700">
                {kpis?.facturasPendientes ?? 0}
              </div>
            </div>
            <div className="p-4 rounded border">
              <div className="text-sm text-gray-500">Órdenes en proceso</div>
              <div className="text-2xl font-semibold text-blue-700">
                {kpis?.ordenesEnProceso ?? 0}
              </div>
            </div>
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
