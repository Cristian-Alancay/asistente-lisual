import { PersonalCalendarioView } from "./personal-calendario-view";

export default function PersonalCalendarioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Calendario</h1>
        <p className="text-muted-foreground">
          Eventos personales (Cristian Alancay).
        </p>
      </div>
      <PersonalCalendarioView />
    </div>
  );
}
