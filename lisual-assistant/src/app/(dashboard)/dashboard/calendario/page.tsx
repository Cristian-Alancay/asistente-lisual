import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarioView } from "./calendario-view";

export default function CalendarioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Calendario</h1>
        <p className="text-muted-foreground">
          Reuniones, instalaciones, seguimientos y revisiones
        </p>
      </div>
      <CalendarioView />
    </div>
  );
}
