import { getTareasHoy } from "@/lib/actions/tareas";
import { getSeguimientosHoy, getReunionesHoy } from "@/lib/actions/planificacion";
import { Card, CardContent } from "@/components/ui/card";
import { CheckSquare, ListTodo, Clock, Users } from "lucide-react";

export async function PlanificacionStats() {
  const [tareas, seguimientos, reuniones] = await Promise.all([
    getTareasHoy(),
    getSeguimientosHoy(),
    getReunionesHoy(),
  ]);

  const completadas = tareas.filter((t) => t.completada).length;
  const pendientes = tareas.filter((t) => !t.completada).length;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="overflow-hidden">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="rounded-lg bg-primary/10 p-3">
            <ListTodo className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{tareas.length}</p>
            <p className="text-xs text-muted-foreground">Total tareas</p>
          </div>
        </CardContent>
      </Card>
      <Card className="overflow-hidden">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="rounded-lg bg-amber-500/10 p-3">
            <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{pendientes}</p>
            <p className="text-xs text-muted-foreground">Pendientes</p>
          </div>
        </CardContent>
      </Card>
      <Card className="overflow-hidden">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="rounded-lg bg-emerald-500/10 p-3">
            <CheckSquare className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{completadas}</p>
            <p className="text-xs text-muted-foreground">Completadas</p>
          </div>
        </CardContent>
      </Card>
      <Card className="overflow-hidden">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="rounded-lg bg-violet-500/10 p-3">
            <Users className="h-6 w-6 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <p className="text-2xl font-bold">{reuniones.length + seguimientos.length}</p>
            <p className="text-xs text-muted-foreground">Actividades hoy</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
