import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getInstalacionesPendientes, getActivos } from "@/lib/actions/operaciones";
import { InstalacionesPendientesTable } from "./instalaciones-pendientes-table";
import { ActivosTable } from "./activos-table";
import { ActivoCreateDialog } from "./activo-create-dialog";

export default function InstalacionesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Instalaciones</h1>
          <p className="text-muted-foreground">
            Control de instalaciones pendientes, programadas y equipos
          </p>
        </div>
        <ActivoCreateDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Instalaciones pendientes</CardTitle>
          <CardDescription>
            Proyectos sin instalación completada o con equipos en distribución
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
            <InstalacionesPendientesTable />
          </Suspense>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Equipos / Activos</CardTitle>
          <CardDescription>
            Cámaras, chips y teleports. Estado: en stock, asignado, instalado o en distribución
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
            <ActivosTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
