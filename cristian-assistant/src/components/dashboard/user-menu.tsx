import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, Loader2, Settings, Sun, Moon, Monitor } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/components/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function getInitials(name: string | null, email: string | null): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "?";
}

const THEME_OPTIONS = [
  { value: "light" as const, label: "Claro", icon: Sun },
  { value: "dark" as const, label: "Oscuro", icon: Moon },
  { value: "system" as const, label: "Sistema", icon: Monitor },
];

export function UserMenu() {
  const { profile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { pathname } = useLocation();
  const [isPending, setIsPending] = useState(false);

  async function handleSignOut(e: Event) {
    e.preventDefault();
    toast.success("Sesión cerrada", { description: "Redirigiendo..." });
    setIsPending(true);
    await signOut();
    setIsPending(false);
  }

  if (!profile) return null;

  const displayName = profile.full_name?.trim() || profile.email || "Usuario";
  const initials = getInitials(profile.full_name, profile.email);
  const firstName = displayName.split(/\s+/)[0];
  const isPersonal = pathname.startsWith("/dashboard/personal");
  const settingsPath = isPersonal ? "/dashboard/personal/configuracion" : "/dashboard/configuracion";

  const currentTheme = THEME_OPTIONS.find((t) => t.value === theme) ?? THEME_OPTIONS[2];
  const ThemeIcon = currentTheme.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 gap-2 rounded-full px-1.5 sm:h-auto sm:px-2 sm:py-1.5"
          aria-label="Menú de cuenta"
        >
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
              "bg-primary/10 text-primary font-semibold text-xs",
              "ring-1 ring-primary/20 transition-all duration-200",
              "group-hover:ring-primary/40"
            )}
          >
            {initials}
          </div>
          <span className="hidden max-w-[120px] truncate text-sm font-medium sm:inline">
            {firstName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64" forceMount>
        <div className="flex items-center gap-3 px-3 py-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              "bg-primary/10 text-primary font-semibold text-sm",
              "ring-1 ring-primary/20"
            )}
          >
            {initials}
          </div>
          <div className="flex min-w-0 flex-col">
            <p className="truncate text-sm font-medium">{displayName}</p>
            {profile.email && (
              <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />

        {/* Theme sub-menu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2">
            <ThemeIcon className="h-4 w-4" />
            Tema: {currentTheme.label}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {THEME_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={cn("gap-2", theme === opt.value && "bg-accent")}
              >
                <opt.icon className="h-4 w-4" />
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Configuración */}
        {profile.role === "admin" && (
          <DropdownMenuItem asChild>
            <Link to={settingsPath} className="cursor-pointer gap-2">
              <Settings className="h-4 w-4" />
              Configuración
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={handleSignOut}
          disabled={isPending}
          variant="destructive"
          className="cursor-pointer gap-2 focus:bg-destructive/10 focus:text-destructive"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
