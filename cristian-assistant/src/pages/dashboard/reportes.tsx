import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Download } from "lucide-react";
import { useReporteVentas, useReporteOperaciones, useReporteExperiencia } from "@/hooks/use-reportes";
import * as reporteService from "@/services/reportes";
import { ReportesVentasChart } from "@/components/reportes/reportes-ventas-chart";
import { useLocale } from "@/contexts/locale-context";

function ReportesFilters({ desde, hasta, onChange }: { desde: string; hasta: string; onChange: (d: string, h: string) => void }) {
  const [d, setD] = useState(desde);
  const [h, setH] = useState(hasta);

  function apply() { onChange(d, h); }
  function clear() { setD(""); setH(""); onChange("", ""); }
  function setPreset(days: number) {
    const hDate = new Date(); const dDate = new Date(); dDate.setDate(dDate.getDate() - days);
    const ds = dDate.toISOString().slice(0, 10); const hs = hDate.toISOString().slice(0, 10);
    setD(ds); setH(hs); onChange(ds, hs);
  }

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-lg border p-4">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setPreset(7)}>7 días</Button>
        <Button variant="outline" size="sm" onClick={() => setPreset(30)}>30 días</Button>
        <Button variant="outline" size="sm" onClick={() => setPreset(90)}>90 días</Button>
      </div>
      <div><Label htmlFor="desde">Desde</Label><Input id="desde" type="date" value={d} onChange={(e) => setD(e.target.value)} className="mt-1" /></div>
      <div><Label htmlFor="hasta">Hasta</Label><Input id="hasta" type="date" value={h} onChange={(e) => setH(e.target.value)} className="mt-1" /></div>
      <Button onClick={apply}>Aplicar</Button>
      <Button variant="outline" onClick={clear}>Limpiar</Button>
    </div>
  );
}

function ExportCsvButton({ desde, hasta }: { desde?: string; hasta?: string }) {
  async function handleExport() {
    const filtro = desde || hasta ? { fechaDesde: desde, fechaHasta: hasta } : undefined;
    const [ventas, operaciones, experiencia] = await Promise.all([
      reporteService.getReporteVentas(filtro), reporteService.getReporteOperaciones(), reporteService.getReporteExperiencia(),
    ]);
    const rows: string[][] = [
      ["Reporte Assistant Cristian Alancay"], ["Generado", new Date().toLocaleString("es-AR")], [""],
      ["VENTAS"], ["Leads por estado", "Estado", "Cantidad"],
      ...ventas.leadsPorEstado.map((r) => ["", r.estado, String(r.count)]),
      ["Leads por canal", "Canal", "Cantidad"],
      ...ventas.leadsPorCanal.map((r) => ["", r.canal, String(r.count)]),
      ["Presupuestos aceptados", String(ventas.totalPresupuestosAceptados)],
      ["Monto total aceptado", String(ventas.montoTotalAceptado)], [""],
      ["OPERACIONES"], ["Instalaciones próximos 7 días", String(operaciones.instalacionesProximas7Dias)],
      ["Equipos en stock", String(operaciones.equiposEnStock)], [""],
      ["EXPERIENCIA"], ["Solicitudes video pendientes", String(experiencia.solicitudesVideoPendientes)],
      ["Revisiones pendientes", String(experiencia.revisionesPendientes)],
      ["Referencias totales", String(experiencia.referenciasTotal)],
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `reporte-trabajo-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(url);
  }
  return <Button variant="outline" onClick={handleExport}><Download className="mr-2 h-4 w-4" />Exportar CSV</Button>;
}

export default function ReportesPage() {
  const { tp } = useLocale();
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const filtro = desde || hasta ? { fechaDesde: desde || undefined, fechaHasta: hasta || undefined } : undefined;
  const { data: ventas, isLoading: loadV } = useReporteVentas(filtro);
  const { data: operaciones, isLoading: loadO } = useReporteOperaciones();
  const { data: experiencia, isLoading: loadE } = useReporteExperiencia();

  const handleFilterChange = useCallback((d: string, h: string) => { setDesde(d); setHasta(h); }, []);

  const v = ventas ?? { leadsPorEstado: [], leadsPorCanal: [], presupuestosPorEstado: [], totalPresupuestosAceptados: 0, montoTotalAceptado: 0 };
  const o = operaciones ?? { proyectosPorEstado: [], instalacionesProximas7Dias: 0, equiposEnStock: 0 };
  const ex = experiencia ?? { solicitudesVideoPendientes: 0, revisionesPendientes: 0, referenciasTotal: 0 };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold tracking-tight">{tp.reportsTitle}</h1><p className="text-muted-foreground">{tp.reportsSubtitle}</p></div>
        <ExportCsvButton desde={desde} hasta={hasta} />
      </div>
      <ReportesFilters desde={desde} hasta={hasta} onChange={handleFilterChange} />
      {!loadV && v.leadsPorEstado.length > 0 && (
        <ReportesVentasChart
          leadsPorEstado={v.leadsPorEstado}
          leadsPorCanal={v.leadsPorCanal}
          presupuestosPorEstado={v.presupuestosPorEstado}
        />
      )}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loadV ? <Skeleton className="h-64" /> : (
          <Card><CardHeader><CardTitle>Ventas</CardTitle><CardDescription>Leads, presupuestos y conversión</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><p className="text-sm font-medium text-muted-foreground">Leads por estado</p><div className="mt-2 flex flex-wrap gap-1">{v.leadsPorEstado.length === 0 ? <span className="text-sm text-muted-foreground">Sin datos</span> : v.leadsPorEstado.map(({ estado, count }) => <Badge key={estado} variant="secondary" className="text-xs">{estado}: {count}</Badge>)}</div></div>
                <div><p className="text-sm font-medium text-muted-foreground">Leads por canal</p><div className="mt-2 flex flex-wrap gap-1">{v.leadsPorCanal.length === 0 ? <span className="text-sm text-muted-foreground">Sin datos</span> : v.leadsPorCanal.map(({ canal, count }) => <Badge key={canal} variant="outline" className="text-xs">{canal}: {count}</Badge>)}</div></div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Presupuestos aceptados</span><span className="font-semibold">{v.totalPresupuestosAceptados}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Monto total aceptado</span><span className="font-semibold">{new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(v.montoTotalAceptado)}</span></div>
              </div>
            </CardContent></Card>
        )}
        {loadO ? <Skeleton className="h-64" /> : (
          <Card><CardHeader><CardTitle>Operaciones</CardTitle><CardDescription>Proyectos, instalaciones y stock</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div><p className="text-sm font-medium text-muted-foreground">Proyectos por estado</p><div className="mt-2 flex flex-wrap gap-1">{o.proyectosPorEstado.length === 0 ? <span className="text-sm text-muted-foreground">Sin datos</span> : o.proyectosPorEstado.map(({ estado, count }) => <Badge key={estado} variant="secondary" className="text-xs">{estado}: {count}</Badge>)}</div></div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Instalaciones próximos 7 días</span><span className="font-semibold">{o.instalacionesProximas7Dias}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Equipos en stock</span><span className="font-semibold">{o.equiposEnStock}</span></div>
              </div>
              <Link to="/dashboard/operaciones" className="text-sm font-medium text-primary hover:underline">Ir a Operaciones →</Link>
            </CardContent></Card>
        )}
        {loadE ? <Skeleton className="h-64" /> : (
          <Card><CardHeader><CardTitle>Experiencia al Cliente</CardTitle><CardDescription>Solicitudes de video, revisiones y referencias</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Solicitudes de video pendientes</span><span className="font-semibold">{ex.solicitudesVideoPendientes}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Revisiones pendientes</span><span className="font-semibold">{ex.revisionesPendientes}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Referencias totales</span><span className="font-semibold">{ex.referenciasTotal}</span></div>
              </div>
              <Link to="/dashboard/experiencia" className="text-sm font-medium text-primary hover:underline">Ir a Experiencia →</Link>
            </CardContent></Card>
        )}
      </div>
    </div>
  );
}
