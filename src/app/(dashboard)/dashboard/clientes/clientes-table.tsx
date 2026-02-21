"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

type ClienteRow = {
  id: string;
  lead_id: string;
  id_lisual_pro: string | null;
  id_empresa: string | null;
  leads: { nombre: string; empresa: string | null } | null;
};

export function ClientesTable() {
  const [clientes, setClientes] = useState<ClienteRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/clientes", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => (Array.isArray(data) ? data : []))
      .then(setClientes)
      .catch(() => setClientes([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (clientes.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No hay clientes aún. Los clientes se crean al convertir un lead (presupuesto aceptado / pago).
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Empresa</TableHead>
          <TableHead className="hidden sm:table-cell">ID Pro</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clientes.map((c) => {
          const lead = Array.isArray(c.leads) ? c.leads[0] : c.leads;
          return (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{lead?.nombre ?? "—"}</TableCell>
              <TableCell>{lead?.empresa ?? "—"}</TableCell>
              <TableCell className="hidden sm:table-cell">
                {c.id_lisual_pro ? (
                  <Badge variant="outline">{c.id_lisual_pro}</Badge>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/dashboard/operaciones?cliente=${c.id}`}>
                    Ver proyectos
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
