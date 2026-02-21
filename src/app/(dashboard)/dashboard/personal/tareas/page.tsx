import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonalTareasList } from "./personal-tareas-list";

export default function PersonalTareasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tareas</h1>
        <p className="text-muted-foreground">
          Tareas personales compartidas (Cristian Alancay).
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Listado</CardTitle>
          <CardDescription>Agregá tareas y marcálas como completadas</CardDescription>
        </CardHeader>
        <CardContent>
          <PersonalTareasList />
        </CardContent>
      </Card>
    </div>
  );
}
