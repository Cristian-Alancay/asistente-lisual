import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen-mobile flex flex-col items-center justify-center bg-background gap-4">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <p className="text-muted-foreground">Pagina no encontrada</p>
      <Link
        to="/dashboard"
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Volver al dashboard
      </Link>
    </div>
  );
}
