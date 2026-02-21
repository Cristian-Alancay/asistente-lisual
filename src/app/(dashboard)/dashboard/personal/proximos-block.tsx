import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getProximosPersonales } from "@/lib/actions/personal";
import { getPersonalConfig } from "@/lib/actions/config-personal";
import type { PersonalConfig } from "@/lib/config-personal-defaults";
import { ClipboardList, Calendar, Bell, ChevronRight } from "lucide-react";

export async function ProximosBlock() {
  const config: Partial<PersonalConfig> = await getPersonalConfig().catch(() => ({}));
  const recordatoriosActivos = config.recordatorios_activos !== "false";
  if (!recordatoriosActivos) return null;

  let data;
  try {
    data = await getProximosPersonales();
  } catch {
    data = { tareasPendientes: [], eventosProximos: [] };
  }

  const { tareasPendientes, eventosProximos } = data;
  const tieneAlgo = tareasPendientes.length > 0 || eventosProximos.length > 0;

  if (!tieneAlgo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" />
            Recordatorios
          </CardTitle>
          <CardDescription>
            No hay tareas pendientes ni eventos en los próximos 7 días.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-4 w-4" />
          Recordatorios
        </CardTitle>
        <CardDescription>
          Tareas pendientes y próximos eventos (7 días).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {tareasPendientes.length > 0 && (
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <ClipboardList className="h-3.5 w-3.5" />
              Tareas pendientes ({tareasPendientes.length})
            </p>
            <ul className="space-y-1.5">
              {tareasPendientes.slice(0, 5).map((t) => (
                <li key={t.id} className="flex items-center gap-2 text-sm">
                  <span className="flex-1 truncate">{t.titulo}</span>
                  {t.fecha && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {new Date(t.fecha + "T12:00:00").toLocaleDateString("es-AR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard/personal/tareas"
              className="mt-2 inline-flex items-center text-xs font-medium text-primary hover:underline"
            >
              {tareasPendientes.length > 5 ? "Ver todas" : "Ver tareas"}
              <ChevronRight className="ml-0.5 h-3 w-3" />
            </Link>
          </div>
        )}
        {eventosProximos.length > 0 && (
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Próximos eventos ({eventosProximos.length})
            </p>
            <ul className="space-y-1.5">
              {eventosProximos.map((e) => (
                <li key={e.id} className="flex items-center gap-2 text-sm">
                  <span className="flex-1 truncate">{e.titulo}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(e.fecha_inicio).toLocaleDateString("es-AR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard/personal/calendario"
              className="mt-2 inline-flex items-center text-xs font-medium text-primary hover:underline"
            >
              Ver calendario
              <ChevronRight className="ml-0.5 h-3 w-3" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
