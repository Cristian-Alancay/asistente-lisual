import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, CalendarCheck, Users } from "lucide-react";
import { SolicitudesVideoTable } from "./solicitudes-video-table";
import { RevisionesTable } from "./revisiones-table";
import { ReferenciasTable } from "./referencias-table";
import { SolicitudVideoDialog } from "./solicitud-video-dialog";
import { RevisionDialog } from "./revision-dialog";
import { ReferenciaDialog } from "./referencia-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExperienciaPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Experiencia al Cliente</h1>
          <p className="text-muted-foreground">
            Solicitudes de video, revisiones periódicas y programa de referencias
          </p>
        </div>
      </div>

      <Tabs defaultValue="solicitudes" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="solicitudes" className="gap-2">
            <Video className="h-4 w-4" />
            Solicitudes de video
          </TabsTrigger>
          <TabsTrigger value="revisiones" className="gap-2">
            <CalendarCheck className="h-4 w-4" />
            Revisiones
          </TabsTrigger>
          <TabsTrigger value="referencias" className="gap-2">
            <Users className="h-4 w-4" />
            Referencias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="solicitudes" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Solicitudes de video</CardTitle>
                <CardDescription>Clientes que solicitan grabaciones específicas</CardDescription>
              </div>
              <SolicitudVideoDialog />
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-32" />}>
                <SolicitudesVideoTable />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revisiones" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Revisiones periódicas</CardTitle>
                <CardDescription>Semana 1, mes 1, trimestral, semestral</CardDescription>
              </div>
              <RevisionDialog />
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-32" />}>
                <RevisionesTable />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referencias" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Programa de referencias</CardTitle>
                <CardDescription>Leads referidos por clientes con incentivos</CardDescription>
              </div>
              <ReferenciaDialog />
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-32" />}>
                <ReferenciasTable />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
