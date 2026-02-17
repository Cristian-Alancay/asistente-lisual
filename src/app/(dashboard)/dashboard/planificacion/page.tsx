import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlanificacionStats } from "./planificacion-stats";
import { TareasDelDia } from "./tareas-del-dia";

export default function PlanificacionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Planificación</h1>
        <p className="text-muted-foreground">Tareas diarias y actividades del día</p>
      </div>
      <PlanificacionStats />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tareas del día</CardTitle>
            <CardDescription>Gestiona tus tareas personales</CardDescription>
          </CardHeader>
          <CardContent>
            <TareasDelDia />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Actividades programadas</CardTitle>
            <CardDescription>Seguimientos y reuniones de hoy</CardDescription>
          </CardHeader>
          <CardContent>
            <ActividadesDelDia />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function ActividadesDelDia() {
  const [seguimientos, reuniones] = await Promise.all([
    import("@/lib/actions/planificacion").then((m) => m.getSeguimientosHoy()),
    import("@/lib/actions/planificacion").then((m) => m.getReunionesHoy()),
  ]);

  if (seguimientos.length === 0 && reuniones.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        No hay actividades programadas para hoy.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {seguimientos.map((s) => (
        <li
          key={s.id}
          className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
        >
          <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
            Seguimiento
          </span>
          <span>Tipo {s.tipo}</span>
          <span className="text-muted-foreground">
            {s.lead_telefono ? `Tel: ${s.lead_telefono}` : s.lead_email ?? ""}
          </span>
        </li>
      ))}
      {reuniones.map((r) => {
        const lead = Array.isArray(r.leads) ? r.leads[0] : r.leads;
        const nombre = lead?.nombre ?? "Sin nombre";
        return (
          <li
            key={r.id}
            className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
          >
            <span className="rounded bg-primary/20 px-1.5 py-0.5 text-xs font-medium text-primary">
              Reunión
            </span>
            <span>{nombre}</span>
            <span className="text-muted-foreground">
              {new Date(r.fecha_hora).toLocaleTimeString("es-AR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
