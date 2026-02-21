"use client";

import { useTransition } from "react";
import Link from "next/link";
import { LogOut, Loader2, Settings } from "lucide-react";
import { toast } from "sonner";
import { signOut } from "@/lib/actions/auth";
import type { Profile } from "@/types/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type UserMenuProps = {
  profile: Profile | null;
};

function getInitials(name: string | null, email: string | null): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (email) {
    return email.slice(0, 2).toUpperCase();
  }
  return "?";
}

export function UserMenu({ profile }: UserMenuProps) {
  const [isPending, startTransition] = useTransition();

  function handleSignOut(e: Event) {
    e.preventDefault();
    toast.success("Sesión cerrada", { description: "Cerrando sesión…" });
    startTransition(() => signOut());
  }

  if (!profile) return null;

  const displayName = profile.full_name?.trim() || profile.email || "Usuario";
  const initials = getInitials(profile.full_name, profile.email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full p-0 sm:h-auto sm:min-w-[140px] sm:justify-start sm:gap-2 sm:px-3 sm:py-2"
          aria-label="Menú de cuenta"
        >
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
              "bg-primary/10 text-primary font-medium text-sm"
            )}
          >
            {initials}
          </div>
          <span className="hidden truncate text-sm sm:inline">
            {displayName.length > 18 ? `${displayName.slice(0, 16)}…` : displayName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64" forceMount>
        <div className="flex flex-col gap-2 px-2 py-3">
          <p className="text-sm font-medium leading-none">{displayName}</p>
          {profile.email && (
            <p className="text-xs text-muted-foreground truncate">
              {profile.email}
            </p>
          )}
        </div>
        <DropdownMenuSeparator />
        {profile.role === "admin" && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/configuracion" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem
          onSelect={handleSignOut}
          disabled={isPending}
          variant="destructive"
          className="cursor-pointer focus:bg-destructive/10 focus:text-destructive"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
