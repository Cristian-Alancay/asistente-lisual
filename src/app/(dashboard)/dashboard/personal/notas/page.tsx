import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonalNotasList } from "./personal-notas-list";

export default function PersonalNotasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Notas</h1>
        <p className="text-muted-foreground">
          Notas personales compartidas (Cristian Alancay).
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Listado</CardTitle>
          <CardDescription>Creá y editá notas</CardDescription>
        </CardHeader>
        <CardContent>
          <PersonalNotasList />
        </CardContent>
      </Card>
    </div>
  );
}
