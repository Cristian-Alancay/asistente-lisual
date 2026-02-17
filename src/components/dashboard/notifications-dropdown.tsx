"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, FileText, Wrench, ClipboardCheck } from "lucide-react";
import { getNotificaciones, type Notificacion } from "@/lib/actions/notificaciones";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const tipoIcon: Record<Notificacion["tipo"], React.ReactNode> = {
  seguimiento: <Bell className="h-4 w-4" />,
  presupuesto_vencimiento: <FileText className="h-4 w-4" />,
  instalacion: <Wrench className="h-4 w-4" />,
  revision: <ClipboardCheck className="h-4 w-4" />,
};

export function NotificationsDropdown() {
  const [items, setItems] = useState<Notificacion[]>([]);

  useEffect(() => {
    getNotificaciones(10).then(setItems).catch(() => setItems([]));
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notificaciones">
          <Bell className="h-4 w-4" />
          {items.length > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {items.length > 9 ? "9+" : items.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-2 py-2 font-medium text-sm">Alertas</div>
        <div className="max-h-[280px] overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No hay notificaciones
            </div>
          ) : (
            items.map((n) => (
              <DropdownMenuItem key={n.id} asChild>
                <Link
                  href={n.href}
                  className="flex cursor-pointer flex-col items-start gap-0.5 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{tipoIcon[n.tipo]}</span>
                    <span className="font-medium">{n.titulo}</span>
                  </div>
                  {n.descripcion && (
                    <span className="text-xs text-muted-foreground">{n.descripcion}</span>
                  )}
                  {n.fecha && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(n.fecha).toLocaleDateString("es-AR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  )}
                </Link>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
