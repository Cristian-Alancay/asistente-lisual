import { useLocation } from "react-router-dom";

export function HeaderContextTitle() {
  const { pathname } = useLocation();
  const isElegir = pathname === "/dashboard/elegir";

  return (
    <span className="hidden truncate text-sm font-medium text-muted-foreground sm:inline">
      {isElegir ? "Elegi un espacio" : "Cristian Assistant"}
    </span>
  );
}
