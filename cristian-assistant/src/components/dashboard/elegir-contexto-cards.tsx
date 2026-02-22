import { useNavigate } from "react-router-dom";
import { Briefcase, User } from "lucide-react";
import { setStoredDashboardContext } from "@/lib/contexto-storage";
import { cn } from "@/lib/utils";

const CONTEXTS = [
  {
    key: "trabajo" as const,
    path: "/dashboard",
    icon: Briefcase,
    title: "Trabajo",
    description: "Gestión comercial, operaciones y planificación",
    avatar: null,
  },
  {
    key: "personal" as const,
    path: "/dashboard/personal",
    icon: User,
    title: "Personal",
    description: "Tareas, calendario y notas privadas",
    avatar: "/avatar-cristian.png",
  },
] as const;

export function ElegirContextoCards() {
  const navigate = useNavigate();

  function goTo(context: "trabajo" | "personal", path: string) {
    setStoredDashboardContext(context);
    navigate(path);
  }

  return (
    <div className="grid w-full max-w-xl mx-auto gap-4 sm:grid-cols-2 sm:gap-5">
      {CONTEXTS.map((ctx, i) => (
        <button
          key={ctx.key}
          type="button"
          onClick={() => goTo(ctx.key, ctx.path)}
          className={cn(
            "elegir-card group relative flex flex-col items-center rounded-2xl px-5 py-7 text-center sm:px-6 sm:py-8",
            "landing-fade-in",
          )}
          style={{ animationDelay: `${0.4 + i * 0.15}s` }}
        >
          {ctx.avatar ? (
            <img
              src={ctx.avatar}
              alt=""
              className="h-16 w-16 rounded-full object-cover ring-2 ring-primary/20 transition-all duration-300 group-hover:ring-primary/50 group-hover:scale-105"
            />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary ring-2 ring-primary/20 transition-all duration-300 group-hover:ring-primary/50 group-hover:bg-primary/15 group-hover:scale-105">
              <ctx.icon className="h-7 w-7" />
            </span>
          )}
          <span className="mt-5 block text-base font-semibold tracking-tight text-foreground sm:text-lg">
            {ctx.title}
          </span>
          <span className="mt-1.5 block text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {ctx.description}
          </span>
        </button>
      ))}
    </div>
  );
}
