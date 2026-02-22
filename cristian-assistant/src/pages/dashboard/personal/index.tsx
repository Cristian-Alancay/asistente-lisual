import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Calendar, StickyNote, Bell, ChevronRight } from "lucide-react";
import { useProximosPersonales } from "@/hooks/use-personal";
import { usePersonalConfig } from "@/hooks/use-config-personal";
import { useLocale } from "@/contexts/locale-context";

function ProximosBlock() {
  const { data: config } = usePersonalConfig();
  const recordatoriosActivos = config?.recordatorios_activos !== "false";
  const { data } = useProximosPersonales();

  if (!recordatoriosActivos) return null;

  const tareasPendientes = data?.tareasPendientes ?? [];
  const eventosProximos = data?.eventosProximos ?? [];
  const tieneAlgo = tareasPendientes.length > 0 || eventosProximos.length > 0;

  if (!tieneAlgo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Bell className="h-4 w-4" />Recordatorios</CardTitle>
          <CardDescription>No hay tareas pendientes ni eventos en los próximos 7 días.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><Bell className="h-4 w-4" />Recordatorios</CardTitle>
        <CardDescription>Tareas pendientes y próximos eventos (7 días).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {tareasPendientes.length > 0 && (
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground"><ClipboardList className="h-3.5 w-3.5" />Tareas pendientes ({tareasPendientes.length})</p>
            <ul className="space-y-1.5">
              {tareasPendientes.slice(0, 5).map((t) => (
                <li key={t.id} className="flex items-center gap-2 text-sm">
                  <span className="flex-1 truncate">{t.titulo}</span>
                  {t.fecha && <span className="shrink-0 text-xs text-muted-foreground">{new Date(t.fecha + "T12:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "short" })}</span>}
                </li>
              ))}
            </ul>
            <Link to="/dashboard/personal/tareas" className="mt-2 inline-flex items-center text-xs font-medium text-primary hover:underline">
              {tareasPendientes.length > 5 ? "Ver todas" : "Ver tareas"}<ChevronRight className="ml-0.5 h-3 w-3" />
            </Link>
          </div>
        )}
        {eventosProximos.length > 0 && (
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground"><Calendar className="h-3.5 w-3.5" />Próximos eventos ({eventosProximos.length})</p>
            <ul className="space-y-1.5">
              {eventosProximos.map((e) => (
                <li key={e.id} className="flex items-center gap-2 text-sm">
                  <span className="flex-1 truncate">{e.titulo}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{new Date(e.fecha_inicio).toLocaleDateString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                </li>
              ))}
            </ul>
            <Link to="/dashboard/personal/calendario" className="mt-2 inline-flex items-center text-xs font-medium text-primary hover:underline">
              Ver calendario<ChevronRight className="ml-0.5 h-3 w-3" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function PersonalPage() {
  const { tp } = useLocale();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{tp.personalTitle}</h1>
        <p className="text-muted-foreground">{tp.personalSubtitle}</p>
      </div>
      <ProximosBlock />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="transition-colors hover:bg-accent/50">
          <Link to="/dashboard/personal/tareas" className="block">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Tareas</CardTitle><ClipboardList className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><CardDescription>Gestioná tus tareas personales.</CardDescription><span className="mt-2 inline-flex items-center text-sm font-medium text-primary">Ir a Tareas &gt;</span></CardContent>
          </Link>
        </Card>
        <Card className="transition-colors hover:bg-accent/50">
          <Link to="/dashboard/personal/calendario" className="block">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Calendario</CardTitle><Calendar className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><CardDescription>Eventos y fechas personales.</CardDescription><span className="mt-2 inline-flex items-center text-sm font-medium text-primary">Ir a Calendario &gt;</span></CardContent>
          </Link>
        </Card>
        <Card className="transition-colors hover:bg-accent/50">
          <Link to="/dashboard/personal/notas" className="block">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Notas</CardTitle><StickyNote className="h-4 w-4 text-muted-foreground" /></CardHeader>
            <CardContent><CardDescription>Notas y recordatorios.</CardDescription><span className="mt-2 inline-flex items-center text-sm font-medium text-primary">Ir a Notas &gt;</span></CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
