import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Calendar, StickyNote } from "lucide-react";
import { ProximosBlock } from "./proximos-block";

export default function PersonalPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Cristian Alancay</h1>
        <p className="text-muted-foreground">
          Espacio personal: tareas, calendario y notas compartidos.
        </p>
      </div>
      <ProximosBlock />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="transition-colors hover:bg-accent/50">
          <Link href="/dashboard/personal/tareas" className="block">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tareas</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Gestioná tus tareas personales.
              </CardDescription>
              <span className="mt-2 inline-flex items-center text-sm font-medium text-primary">
                Ir a Tareas &gt;
              </span>
            </CardContent>
          </Link>
        </Card>
        <Card className="transition-colors hover:bg-accent/50">
          <Link href="/dashboard/personal/calendario" className="block">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calendario</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Eventos y fechas personales.
              </CardDescription>
              <span className="mt-2 inline-flex items-center text-sm font-medium text-primary">
                Ir a Calendario &gt;
              </span>
            </CardContent>
          </Link>
        </Card>
        <Card className="transition-colors hover:bg-accent/50">
          <Link href="/dashboard/personal/notas" className="block">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notas</CardTitle>
              <StickyNote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription>
                Notas y recordatorios.
              </CardDescription>
              <span className="mt-2 inline-flex items-center text-sm font-medium text-primary">
                Ir a Notas &gt;
              </span>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
