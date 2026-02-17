import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getOperacionesStats } from "@/lib/actions/operaciones";
import { ProyectosTable } from "./proyectos-table";
import { ProyectoCreateDialog } from "./proyecto-create-dialog";
import Link from "next/link";

async function StatsCards() {
  let stats;
  try {
    stats = await getOperacionesStats();
  } catch {
    stats = {
      instalacionesProximos7Dias: 0,
      instalacionesPendientes: 0,
      equiposEnDistribucion: 0,
    };
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Próximas 7 días</CardTitle>
          <Badge variant="secondary">Instalaciones</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.instalacionesProximos7Dias}</div>
          <p className="text-xs text-muted-foreground">Programadas</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          <Badge variant="outline">Instalaciones</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.instalacionesPendientes}</div>
          <p className="text-xs text-muted-foreground">Por completar</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Equipos en distribución</CardTitle>
          <Badge variant="secondary">Stock</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.equiposEnDistribucion}</div>
          <p className="text-xs text-muted-foreground">En tránsito</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OperacionesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Operaciones</h1>
          <p className="text-muted-foreground">
            Estado de servicio, proyectos y asignación de equipos
          </p>
        </div>
        <ProyectoCreateDialog />
      </div>

      <Suspense fallback={<Skeleton className="h-24" />}>
        <StatsCards />
      </Suspense>

      <Card>
        <CardHeader>
          <CardTitle>Proyectos</CardTitle>
          <CardDescription>
            Proyectos de instalación por cliente.{" "}
            <Link href="/dashboard/instalaciones" className="text-primary hover:underline">
              Ver instalaciones pendientes
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            }
          >
            <ProyectosTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
