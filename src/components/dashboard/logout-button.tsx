"use client";

import { useTransition } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

type LogoutButtonProps = {
  variant?: "dropdown" | "sidebar";
  className?: string;
  children?: React.ReactNode;
};

/** Botón para cerrar sesión. Usa la server action signOut. */
export function LogoutButton({
  variant = "dropdown",
  className,
  children,
}: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(() => signOut());
  }

  if (variant === "sidebar") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        title="Cerrar sesión"
        className={cn(
          "flex w-full items-center gap-2 rounded-md p-2 text-sm outline-hidden transition-colors",
          "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
          "focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
          "group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2",
          "group-data-[collapsible=icon]:[&>span]:hidden",
          "[&>svg]:size-4 [&>svg]:shrink-0 [&>span]:truncate",
          className
        )}
      >
        {isPending ? (
          <Loader2 className="animate-spin" />
        ) : (
          <LogOut className="shrink-0" />
        )}
        <span>{children ?? "Cerrar sesión"}</span>
      </button>
    );
  }

  // variant === "dropdown" - para usar dentro de DropdownMenuItem
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "flex w-full items-center gap-2 text-left text-sm outline-hidden",
        "text-destructive focus:bg-destructive/10 focus:text-destructive",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
    >
      {isPending ? (
        <Loader2 className="animate-spin" />
      ) : (
        <LogOut />
      )}
      {children ?? "Cerrar sesión"}
    </button>
  );
}
