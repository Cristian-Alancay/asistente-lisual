import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, FileText, Wrench, ClipboardCheck, ChevronRight } from "lucide-react";
import { useDashboardStats, useLeadsNegociacion } from "@/hooks/use-dashboard";
import { useSeguimientosHoy } from "@/hooks/use-planificacion";
import { useResumenAlertasProactivas } from "@/hooks/use-notificaciones";
import { useLocale } from "@/contexts/locale-context";

function StatsCards() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32" />)}
      </div>
    );
  }

  const s = stats ?? { leadsActivos: 0, presupuestosPendientes: 0, clientesActivos: 0, instalacionesProgramadas: 0 };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Leads activos</CardTitle>
          <Badge variant="secondary">Ventas</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{s.leadsActivos}</div>
          <p className="text-xs text-muted-foreground">En prospecto y negociación</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Presupuestos pendientes</CardTitle>
          <Badge variant="outline">Ventas</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{s.presupuestosPendientes}</div>
          <p className="text-xs text-muted-foreground">Enviados sin respuesta</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Instalaciones programadas</CardTitle>
          <Badge variant="secondary">Operaciones</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{s.instalacionesProgramadas}</div>
          <p className="text-xs text-muted-foreground">Próximos 7 días</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Clientes activos</CardTitle>
          <Badge variant="default">Total</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{s.clientesActivos}</div>
          <p className="text-xs text-muted-foreground">Con servicio activo</p>
        </CardContent>
      </Card>
    </div>
  );
}

function AlertasDelDia() {
  const { data: resumen, isLoading } = useResumenAlertasProactivas();

  if (isLoading) return <Skeleton className="h-48" />;

  const r = resumen ?? { total: 0, seguimientos: 0, seguimientosHoy: 0, presupuestosVencen: 0, presupuestosVencenHoy: 0, instalaciones: 0, revisiones: 0 };

  if (r.total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Bell className="h-4 w-4" />Alertas del día</CardTitle>
          <CardDescription>Resumen de seguimientos, presupuestos e instalaciones</CardDescription>
        </CardHeader>
        <CardContent><p className="text-sm text-muted-foreground">No hay alertas pendientes.</p></CardContent>
      </Card>
    );
  }

  const items: { label: string; count: number; href: string; icon: React.ReactNode; urgent?: boolean }[] = [
    { label: "Seguimientos hoy", count: r.seguimientosHoy, href: "/dashboard/planificacion", icon: <Bell className="h-4 w-4" />, urgent: r.seguimientosHoy > 0 },
    { label: "Presupuestos vencen hoy", count: r.presupuestosVencenHoy, href: "/dashboard/presupuestos", icon: <FileText className="h-4 w-4" />, urgent: r.presupuestosVencenHoy > 0 },
    { label: "Presupuestos por vencer (7 días)", count: r.presupuestosVencen - r.presupuestosVencenHoy, href: "/dashboard/presupuestos", icon: <FileText className="h-4 w-4" /> },
    { label: "Instalaciones (7 días)", count: r.instalaciones, href: "/dashboard/operaciones", icon: <Wrench className="h-4 w-4" /> },
    { label: "Revisiones (7 días)", count: r.revisiones, href: "/dashboard/experiencia", icon: <ClipboardCheck className="h-4 w-4" /> },
  ].filter((i) => i.count > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-4 w-4" />Alertas del día<Badge variant="secondary" className="ml-1">{r.total}</Badge>
        </CardTitle>
        <CardDescription>Resumen de seguimientos, presupuestos e instalaciones</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.label}>
              <Link to={item.href} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{item.icon}</span>
                  <span className={item.urgent ? "font-medium" : undefined}>{item.label}</span>
                  <Badge variant={item.urgent ? "default" : "outline"} className="text-xs">{item.count}</Badge>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function BannerUrgente() {
  const { data: resumen } = useResumenAlertasProactivas();
  if (!resumen) return null;
  const urgente = (resumen.seguimientosHoy ?? 0) > 0 || (resumen.presupuestosVencenHoy ?? 0) > 0;
  if (!urgente) return null;

  const partes: string[] = [];
  if (resumen.seguimientosHoy > 0) partes.push(`${resumen.seguimientosHoy} seguimiento(s) hoy`);
  if (resumen.presupuestosVencenHoy > 0) partes.push(`${resumen.presupuestosVencenHoy} presupuesto(s) vencen hoy`);

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
      <span className="font-medium">Atención: </span>
      {partes.join(" · ")}
      <span className="ml-2">
        <Link to="/dashboard/planificacion" className="underline hover:no-underline">Planificación</Link>
        {" · "}
        <Link to="/dashboard/presupuestos" className="underline hover:no-underline">Presupuestos</Link>
      </span>
    </div>
  );
}

function LeadsNegociacion() {
  const { data: leads } = useLeadsNegociacion();
  if (!leads || leads.length === 0) {
    return <p className="text-sm text-muted-foreground mb-4">No hay leads en negociación con presupuesto enviado.</p>;
  }
  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {leads.slice(0, 5).map((l) => (
          <li key={l.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
            <span className="font-medium">{l.nombre}</span>
            <span className="text-muted-foreground">{l.empresa || "-"}</span>
          </li>
        ))}
      </ul>
      <Link to="/dashboard/leads" className="text-sm font-medium text-primary hover:underline">Ver todos los leads →</Link>
    </div>
  );
}

function SeguimientosDia() {
  const { data: segs } = useSeguimientosHoy();
  if (!segs || segs.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay seguimientos programados para hoy.</p>;
  }
  return (
    <ul className="space-y-2">
      {segs.map((s) => (
        <li key={s.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
          <span>Seguimiento {s.tipo}</span>
          <span className="text-muted-foreground">{s.lead_telefono ? `Tel: ${s.lead_telefono}` : s.lead_email ?? "-"}</span>
        </li>
      ))}
    </ul>
  );
}

export default function DashboardPage() {
  const { tp } = useLocale();
  const [searchParams] = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="space-y-6">
      {error === "forbidden" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          No tienes permiso para acceder a esa sección. Solo los administradores pueden ver Configuración.
        </div>
      )}
      <BannerUrgente />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{tp.dashboardTitle}</h1>
        <p className="text-muted-foreground">{tp.dashboardSubtitle}</p>
      </div>
      <StatsCards />
      <AlertasDelDia />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leads en negociación</CardTitle>
            <CardDescription>Leads con presupuesto enviado pendiente de respuesta</CardDescription>
          </CardHeader>
          <CardContent><LeadsNegociacion /></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Seguimientos del día</CardTitle>
            <CardDescription>Tareas automáticas programadas para hoy</CardDescription>
          </CardHeader>
          <CardContent><SeguimientosDia /></CardContent>
        </Card>
      </div>
    </div>
  );
}
