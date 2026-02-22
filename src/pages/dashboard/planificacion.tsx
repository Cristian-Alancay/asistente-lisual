import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare, ListTodo, Clock, Users, CalendarPlus } from "lucide-react";
import { useTareasHoy } from "@/hooks/use-tareas";
import { useSeguimientosHoy, useReunionesHoy } from "@/hooks/use-planificacion";
import { TareasDelDia } from "@/components/planificacion/tareas-del-dia";
import { syncReunionToCalendar } from "@/services/gcal";
import { toast } from "sonner";
import { useLocale } from "@/contexts/locale-context";

function PlanificacionStats() {
  const { data: tareas } = useTareasHoy();
  const { data: seguimientos } = useSeguimientosHoy();
  const { data: reuniones } = useReunionesHoy();

  const all = tareas ?? [];
  const completadas = all.filter((t) => t.completada).length;
  const pendientes = all.filter((t) => !t.completada).length;
  const actividadesCount = (seguimientos?.length ?? 0) + (reuniones?.length ?? 0);

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="overflow-hidden">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="rounded-lg bg-primary/10 p-3"><ListTodo className="h-6 w-6 text-primary" /></div>
          <div><p className="text-2xl font-bold">{all.length}</p><p className="text-xs text-muted-foreground">Total tareas</p></div>
        </CardContent>
      </Card>
      <Card className="overflow-hidden">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="rounded-lg bg-amber-500/10 p-3"><Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" /></div>
          <div><p className="text-2xl font-bold">{pendientes}</p><p className="text-xs text-muted-foreground">Pendientes</p></div>
        </CardContent>
      </Card>
      <Card className="overflow-hidden">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="rounded-lg bg-emerald-500/10 p-3"><CheckSquare className="h-6 w-6 text-emerald-600 dark:text-emerald-400" /></div>
          <div><p className="text-2xl font-bold">{completadas}</p><p className="text-xs text-muted-foreground">Completadas</p></div>
        </CardContent>
      </Card>
      <Card className="overflow-hidden">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="rounded-lg bg-violet-500/10 p-3"><Users className="h-6 w-6 text-violet-600 dark:text-violet-400" /></div>
          <div><p className="text-2xl font-bold">{actividadesCount}</p><p className="text-xs text-muted-foreground">Actividades hoy</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

function ActividadesDelDia() {
  const { data: seguimientos } = useSeguimientosHoy();
  const { data: reuniones } = useReunionesHoy();

  const segs = seguimientos ?? [];
  const reuns = reuniones ?? [];

  if (segs.length === 0 && reuns.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">No hay actividades programadas para hoy.</p>;
  }

  return (
    <ul className="space-y-2">
      {segs.map((s) => (
        <li key={s.id} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
          <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">Seguimiento</span>
          <span>Tipo {s.tipo}</span>
          <span className="text-muted-foreground">{s.lead_telefono ? `Tel: ${s.lead_telefono}` : s.lead_email ?? ""}</span>
        </li>
      ))}
      {reuns.map((r) => {
        const lead = Array.isArray(r.leads) ? r.leads[0] : r.leads;
        const nombre = lead?.nombre ?? "Sin nombre";
        return (
          <li key={r.id} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
            <span className="rounded bg-primary/20 px-1.5 py-0.5 text-xs font-medium text-primary">Reunión</span>
            <span>{nombre}</span>
            <span className="text-muted-foreground">
              {new Date(r.fecha_hora).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto h-7 w-7"
              title="Sincronizar con Google Calendar"
              onClick={async () => {
                try {
                  const result = await syncReunionToCalendar(r.id);
                  toast.success("Sincronizado con Google Calendar", { description: result.htmlLink ? "Abrir en Calendar" : undefined });
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Error al sincronizar");
                }
              }}
            >
              <CalendarPlus className="h-4 w-4" />
            </Button>
          </li>
        );
      })}
    </ul>
  );
}

export default function PlanificacionPage() {
  const { tp } = useLocale();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{tp.planningTitle}</h1>
        <p className="text-muted-foreground">{tp.planningSubtitle}</p>
      </div>
      <PlanificacionStats />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tareas del día</CardTitle>
            <CardDescription>Gestiona tus tareas personales</CardDescription>
          </CardHeader>
          <CardContent><TareasDelDia /></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Actividades programadas</CardTitle>
            <CardDescription>Seguimientos y reuniones de hoy</CardDescription>
          </CardHeader>
          <CardContent><ActividadesDelDia /></CardContent>
        </Card>
      </div>
    </div>
  );
}
