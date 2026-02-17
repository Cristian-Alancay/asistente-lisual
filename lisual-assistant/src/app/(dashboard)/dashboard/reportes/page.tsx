import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  getReporteVentas,
  getReporteOperaciones,
  getReporteExperiencia,
} from "@/lib/actions/reportes";
import { ReportesFilters } from "./reportes-filters";
import { ReportesVentasChart } from "./reportes-ventas-chart";
import { ExportCsvButton } from "./export-csv-button";

async function ReporteVentasCard({ desde, hasta }: { desde?: string; hasta?: string }) {
  const filtro = desde || hasta ? { fechaDesde: desde, fechaHasta: hasta } : undefined;
  let data;
  try {
    data = await getReporteVentas(filtro);
  } catch {
    data = {
      leadsPorEstado: [],
      leadsPorCanal: [],
      presupuestosPorEstado: [],
      totalPresupuestosAceptados: 0,
      montoTotalAceptado: 0,
    };
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventas</CardTitle>
        <CardDescription>Leads, presupuestos y conversión</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Leads por estado</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {data.leadsPorEstado.length === 0 ? (
                <span className="text-sm text-muted-foreground">Sin datos</span>
              ) : (
                data.leadsPorEstado.map(({ estado, count }) => (
                  <Badge key={estado} variant="secondary" className="text-xs">
                    {estado}: {count}
                  </Badge>
                ))
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Leads por canal</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {data.leadsPorCanal.length === 0 ? (
                <span className="text-sm text-muted-foreground">Sin datos</span>
              ) : (
                data.leadsPorCanal.map(({ canal, count }) => (
                  <Badge key={canal} variant="outline" className="text-xs">
                    {canal}: {count}
                  </Badge>
                ))
              )}
            </div>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Presupuestos por estado</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {data.presupuestosPorEstado.length === 0 ? (
              <span className="text-sm text-muted-foreground">Sin datos</span>
            ) : (
              data.presupuestosPorEstado.map(({ estado, count }) => (
                <Badge key={estado} variant="secondary" className="text-xs">
                  {estado}: {count}
                </Badge>
              ))
            )}
          </div>
        </div>
        <div className="border-t pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Presupuestos aceptados</span>
            <span className="font-semibold">{data.totalPresupuestosAceptados}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Monto total aceptado</span>
            <span className="font-semibold">
              {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(
                data.montoTotalAceptado
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

async function ReporteOperacionesCard() {
  let data;
  try {
    data = await getReporteOperaciones();
  } catch {
    data = {
      proyectosPorEstado: [],
      instalacionesProximas7Dias: 0,
      equiposEnStock: 0,
    };
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Operaciones</CardTitle>
        <CardDescription>Proyectos, instalaciones y stock</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Proyectos por estado</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {data.proyectosPorEstado.length === 0 ? (
              <span className="text-sm text-muted-foreground">Sin datos</span>
            ) : (
              data.proyectosPorEstado.map(({ estado, count }) => (
                <Badge key={estado} variant="secondary" className="text-xs">
                  {estado}: {count}
                </Badge>
              ))
            )}
          </div>
        </div>
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Instalaciones próximos 7 días</span>
            <span className="font-semibold">{data.instalacionesProximas7Dias}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Equipos en stock</span>
            <span className="font-semibold">{data.equiposEnStock}</span>
          </div>
        </div>
        <Link
          href="/dashboard/operaciones"
          className="text-sm font-medium text-primary hover:underline"
        >
          Ir a Operaciones →
        </Link>
      </CardContent>
    </Card>
  );
}

async function ReporteExperienciaCard() {
  let data;
  try {
    data = await getReporteExperiencia();
  } catch {
    data = {
      solicitudesVideoPendientes: 0,
      revisionesPendientes: 0,
      referenciasTotal: 0,
    };
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Experiencia al Cliente</CardTitle>
        <CardDescription>Solicitudes de video, revisiones y referencias</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Solicitudes de video pendientes</span>
            <span className="font-semibold">{data.solicitudesVideoPendientes}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Revisiones pendientes</span>
            <span className="font-semibold">{data.revisionesPendientes}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Referencias totales</span>
            <span className="font-semibold">{data.referenciasTotal}</span>
          </div>
        </div>
        <Link
          href="/dashboard/experiencia"
          className="text-sm font-medium text-primary hover:underline"
        >
          Ir a Experiencia →
        </Link>
      </CardContent>
    </Card>
  );
}

type ReportesPageProps = {
  searchParams: Promise<{ desde?: string; hasta?: string }>;
};

export default async function ReportesPage({ searchParams }: ReportesPageProps) {
  const { desde, hasta } = await searchParams;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reportes y métricas</h1>
          <p className="text-muted-foreground">
            Resumen de ventas, operaciones y experiencia al cliente
          </p>
        </div>
        <ExportCsvButton desde={desde} hasta={hasta} />
      </div>

      <Suspense>
        <ReportesFilters />
      </Suspense>

      <ReportesVentasChartWrapper desde={desde} hasta={hasta} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Suspense fallback={<Skeleton className="h-64" />}>
          <ReporteVentasCard desde={desde} hasta={hasta} />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-64" />}>
          <ReporteOperacionesCard />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-64" />}>
          <ReporteExperienciaCard />
        </Suspense>
      </div>
    </div>
  );
}

async function ReportesVentasChartWrapper({ desde, hasta }: { desde?: string; hasta?: string }) {
  const filtro = desde || hasta ? { fechaDesde: desde, fechaHasta: hasta } : undefined;
  let data;
  try {
    data = await getReporteVentas(filtro);
  } catch {
    data = {
      leadsPorEstado: [],
      leadsPorCanal: [],
      presupuestosPorEstado: [],
      totalPresupuestosAceptados: 0,
      montoTotalAceptado: 0,
    };
  }
  return (
    <ReportesVentasChart
      leadsPorEstado={data.leadsPorEstado}
      leadsPorCanal={data.leadsPorCanal}
      presupuestosPorEstado={data.presupuestosPorEstado}
    />
  );
}
