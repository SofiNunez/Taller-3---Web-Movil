// src/pages/dashboard/index.tsx
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { setDate, setStatus, resetFilters } from "../../store/slices/filtersSlice";

import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar,
  PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
  });
}

export default function Dashboard() {
  const dispatch = useDispatch();
  const filters = useSelector((state: RootState) => state.filters);
  const [stats, setStats] = useState<any>(null);

  // FETCH
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.selectedDate) params.append("date", filters.selectedDate);
    if (filters.status) params.append("status", filters.status);

    const url = "/api/dashboard/stats" + (params.toString() ? "?" + params.toString() : "");

    fetch(url)
      .then((res) => res.json())
      .then((data) => setStats(JSON.parse(JSON.stringify(data))));
  }, [filters]);

  if (!stats)
    return <p className="text-white text-center mt-10">Cargando dashboard...</p>;

  const statusData = [
    { name: "Pendiente", value: stats.pending },
    { name: "Completado", value: stats.completed },
    { name: "Cancelado", value: stats.cancelled },
    { name: "En Proceso", value: stats.processing },
  ];

  const colors = ["#fbbf24", "#22c55e", "#ef4444", "#3b82f6"];

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">📊 Dashboard de Pedidos</h1>

      {/* FILTROS */}
      <div className="flex gap-6 mb-10 items-end bg-neutral-800 p-5 rounded-xl shadow-lg border border-neutral-700">
        
        {/* Fecha */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm opacity-80">Fecha</label>
          <input
            type="date"
            value={filters.selectedDate ?? ""}   // <--- CONTROLADO
            className="p-2 bg-neutral-700 text-white rounded focus:ring focus:ring-blue-500"
            onChange={(e) => dispatch(setDate(e.target.value))}
          />
        </div>

        {/* Estado */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm opacity-80">Estado</label>
          <select
            value={filters.status ?? ""}          // <--- CONTROLADO
            className="p-2 bg-neutral-700 text-white rounded"
            onChange={(e) => dispatch(setStatus(e.target.value))}
          >
            <option value="">Todos</option>
            <option value="pending">Pendiente</option>
            <option value="completed">Completado</option>
            <option value="cancelled">Cancelado</option>
            <option value="processing">Procesando</option>
          </select>
        </div>

        <button
          onClick={() => dispatch(resetFilters())}
          className="ml-auto bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg transition font-semibold"
        >
          Resetear
        </button>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        <Card title="Total pedidos" value={stats.totalOrders} />
        <Card title="Total ganancia" value={`$${stats.totalRevenue}`} />
        <Card title="Promedio por pedido" value={`$${stats.avgOrderValue.toFixed(0)}`} />
        <Card title="Órdenes del día" value={stats.ordersPerDay[0]?.count || 0} />
      </div>

      <div className="space-y-16">
        
        <Section title="Órdenes por día">
          <ChartBlock>
            <LineChart data={stats.ordersPerDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey={(d) => formatDate(d.date)} stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip contentStyle={{ background: "#222", color: "white" }} />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} />
            </LineChart>
          </ChartBlock>
        </Section>

        <Section title="Ingresos por día">
          <ChartBlock>
            <LineChart data={stats.revenuePerDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey={(d) => formatDate(d.date)} stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip contentStyle={{ background: "#222", color: "white" }} />
              <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={3} />
            </LineChart>
          </ChartBlock>
        </Section>

        <Section title="Valor promedio de pedido">
          <ChartBlock>
            <LineChart data={stats.avgPerDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey={(d) => formatDate(d.date)} stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip contentStyle={{ background: "#222", color: "white" }} />
              <Line type="monotone" dataKey="avg" stroke="#a855f7" strokeWidth={3} />
            </LineChart>
          </ChartBlock>
        </Section>

        <Section title="Top productos">
          <ChartBlock>
            <BarChart data={stats.topProducts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip contentStyle={{ background: "#222", color: "white" }} />
              <Bar dataKey="qty" fill="#f97316" />
            </BarChart>
          </ChartBlock>
        </Section>

        <Section title="Estado de pedidos">
          <ChartBlock>
            <PieChart>
              <Pie
                data={statusData}
                outerRadius={120}
                label={{ fill: "white" }}
                dataKey="value"
              >
                {statusData.map((_, i) => (
                  <Cell key={i} fill={colors[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#222", color: "white" }} />
            </PieChart>
          </ChartBlock>
        </Section>

      </div>
    </div>
  );
}

/* ----------------------------- COMPONENTS ----------------------------- */

function Card({ title, value }: any) {
  return (
    <div className="p-5 bg-neutral-800 rounded-xl shadow-lg border border-neutral-700">
      <h3 className="text-sm opacity-70">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

function Section({ title, children }: any) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function ChartBlock({ children }: any) {
  return (
    <div className="bg-neutral-800 p-6 rounded-xl shadow-lg border border-neutral-700">
      <ResponsiveContainer width="100%" height={300}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}
