import { Suspense } from "react";
import { getDashboardStats, getLeadsNegociacion, getSeguimientosDelDia } from "@/lib/actions/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

async function StatsCards() {
  let stats;
  try {
    stats = await getDashboardStats();
  } catch {
    stats = {
      leadsActivos: 0,
      presupuestosPendientes: 0,
      clientesActivos: 0,
      instalacionesProgramadas: 0,
    };
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Leads activos</CardTitle>
          <Badge variant="secondary">Ventas</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.leadsActivos}</div>
          <p className="text-xs text-muted-foreground">En prospecto y negociación</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Presupuestos pendientes</CardTitle>
          <Badge variant="outline">Ventas</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.presupuestosPendientes}</div>
          <p className="text-xs text-muted-foreground">Enviados sin respuesta</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Instalaciones programadas</CardTitle>
          <Badge variant="secondary">Operaciones</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.instalacionesProgramadas}</div>
          <p className="text-xs text-muted-foreground">Próximos 7 días</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Clientes activos</CardTitle>
          <Badge variant="default">Total</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.clientesActivos}</div>
          <p className="text-xs text-muted-foreground">Con servicio activo</p>
        </CardContent>
      </Card>
    </div>
  );
}

async function DashboardLeadsNegociacion() {
  let leads: Awaited<ReturnType<typeof getLeadsNegociacion>> = [];
  try {
    leads = await getLeadsNegociacion();
  } catch {
    leads = [];
  }
  if (leads.length === 0) {
    return (
      <p className="text-sm text-muted-foreground mb-4">
        No hay leads en negociación con presupuesto enviado.
      </p>
    );
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
      <Link href="/dashboard/leads" className="text-sm font-medium text-primary hover:underline">
        Ver todos los leads →
      </Link>
    </div>
  );
}

async function DashboardSeguimientosDia() {
  let segs: Awaited<ReturnType<typeof getSeguimientosDelDia>> = [];
  try {
    segs = await getSeguimientosDelDia();
  } catch {
    segs = [];
  }
  if (segs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay seguimientos programados para hoy.
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {segs.map((s) => (
        <li key={s.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
          <span>Seguimiento {s.tipo}</span>
          <span className="text-muted-foreground">
            {s.lead_telefono ? `Tel: ${s.lead_telefono}` : s.lead_email ?? "-"}
          </span>
        </li>
      ))}
    </ul>
  );
}

type DashboardPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { error } = await searchParams;

  return (
    <div className="space-y-6">
      {error === "forbidden" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          No tienes permiso para acceder a esa sección. Solo los administradores pueden ver Configuración.
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Vista general de ventas, operaciones y experiencia al cliente
        </p>
      </div>

      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        }
      >
        <StatsCards />
      </Suspense>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leads en negociación</CardTitle>
            <CardDescription>Leads con presupuesto enviado pendiente de respuesta</CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardLeadsNegociacion />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Seguimientos del día</CardTitle>
            <CardDescription>Tareas automáticas programadas para hoy</CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardSeguimientosDia />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
