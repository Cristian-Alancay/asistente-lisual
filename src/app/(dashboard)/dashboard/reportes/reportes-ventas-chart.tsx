"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

type Props = {
  leadsPorEstado: { estado: string; count: number }[];
  leadsPorCanal: { canal: string; count: number }[];
  presupuestosPorEstado: { estado: string; count: number }[];
};

export function ReportesVentasChart({ leadsPorEstado, leadsPorCanal, presupuestosPorEstado }: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-lg border p-4">
        <p className="mb-4 text-sm font-medium">Leads por estado</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={leadsPorEstado}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="estado" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-lg border p-4">
        <p className="mb-4 text-sm font-medium">Leads por canal</p>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={leadsPorCanal} dataKey="count" nameKey="canal" cx="50%" cy="50%" outerRadius={70} label={(props) => {
              const p = props as { name?: string; value?: number };
              return `${p.name ?? ""}: ${p.value ?? ""}`;
            }}>
              {leadsPorCanal.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="md:col-span-2 rounded-lg border p-4">
        <p className="mb-4 text-sm font-medium">Presupuestos por estado</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={presupuestosPorEstado}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="estado" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
