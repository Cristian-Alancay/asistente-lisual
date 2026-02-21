"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  getReporteVentas,
  getReporteOperaciones,
  getReporteExperiencia,
} from "@/lib/actions/reportes";

type Props = {
  desde?: string;
  hasta?: string;
};

export function ExportCsvButton({ desde, hasta }: Props) {
  async function handleExport() {
    const filtro = desde || hasta ? { fechaDesde: desde, fechaHasta: hasta } : undefined;
    const [ventas, operaciones, experiencia] = await Promise.all([
      getReporteVentas(filtro),
      getReporteOperaciones(),
      getReporteExperiencia(),
    ]);

    const rows: string[][] = [
      ["Reporte Assistant Cristian Alancay", "", "", ""],
      ["Generado", new Date().toLocaleString("es-AR"), "", ""],
      ["", "", "", ""],
      ["VENTAS", "", "", ""],
      ["Leads por estado", "Estado", "Cantidad", ""],
      ...ventas.leadsPorEstado.map((r) => ["", r.estado, String(r.count), ""]),
      ["Leads por canal", "Canal", "Cantidad", ""],
      ...ventas.leadsPorCanal.map((r) => ["", r.canal, String(r.count), ""]),
      ["Presupuestos aceptados", String(ventas.totalPresupuestosAceptados), "", ""],
      ["Monto total aceptado", String(ventas.montoTotalAceptado), "", ""],
      ["", "", "", ""],
      ["OPERACIONES", "", "", ""],
      ["Instalaciones próximos 7 días", String(operaciones.instalacionesProximas7Dias), "", ""],
      ["Equipos en stock", String(operaciones.equiposEnStock), "", ""],
      ["", "", "", ""],
      ["EXPERIENCIA", "", "", ""],
      ["Solicitudes video pendientes", String(experiencia.solicitudesVideoPendientes), "", ""],
      ["Revisiones pendientes", String(experiencia.revisionesPendientes), "", ""],
      ["Referencias totales", String(experiencia.referenciasTotal), "", ""],
    ];

    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte-trabajo-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      Exportar CSV
    </Button>
  );
}
