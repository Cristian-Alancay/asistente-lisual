"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createReferencia } from "@/lib/actions/experiencia";
import { useClientes } from "@/lib/hooks/use-clientes";
import { useLeads } from "@/lib/hooks/use-leads";
import { Plus } from "lucide-react";

export function ReferenciaDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clienteReferidorId, setClienteReferidorId] = useState("");
  const [leadReferidoId, setLeadReferidoId] = useState("");
  const router = useRouter();
  const clientes = useClientes();
  const leads = useLeads();

  // Leads que no son clientes aún (simplificado: todos los leads, excluyendo los que ya son clientes)
  const leadIdsClientes = new Set(clientes.map((c) => c.lead_id));
  const leadsNoClientes = leads.filter((l) => !leadIdsClientes.has(l.id));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const incentivo_ofrecido = (form.elements.namedItem("incentivo_ofrecido") as HTMLInputElement)?.value;

    if (!clienteReferidorId || !leadReferidoId) {
      setError("Cliente referidor y lead referido son requeridos");
      setLoading(false);
      return;
    }

    try {
      await createReferencia({
        cliente_referidor_id: clienteReferidorId,
        lead_referido_id: leadReferidoId,
        incentivo_ofrecido: incentivo_ofrecido || undefined,
      });
      setOpen(false);
      setClienteReferidorId("");
      setLeadReferidoId("");
      router.refresh();
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear referencia");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva referencia
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva referencia</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="cliente_referidor_id">Cliente referidor *</Label>
            <Select value={clienteReferidorId} onValueChange={setClienteReferidorId}>
              <SelectTrigger id="cliente_referidor_id">
                <SelectValue placeholder="Cliente que refiere" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((c) => {
                  const lead = Array.isArray(c.leads) ? c.leads[0] : c.leads;
                  const label = lead ? `${lead.nombre}${lead.empresa ? ` (${lead.empresa})` : ""}` : c.id;
                  return (
                    <SelectItem key={c.id} value={c.id}>
                      {label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lead_referido_id">Lead referido *</Label>
            <Select value={leadReferidoId} onValueChange={setLeadReferidoId}>
              <SelectTrigger id="lead_referido_id">
                <SelectValue placeholder="Lead que fue referido" />
              </SelectTrigger>
              <SelectContent>
                {leadsNoClientes.length === 0 ? (
                  <SelectItem value="_empty" disabled>
                    No hay leads disponibles (todos son clientes)
                  </SelectItem>
                ) : (
                  leadsNoClientes.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.nombre} {l.empresa ? `(${l.empresa})` : ""} - {l.email}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="incentivo_ofrecido">Incentivo ofrecido</Label>
            <Input id="incentivo_ofrecido" name="incentivo_ofrecido" placeholder="Ej: 10% descuento próxima factura" />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || leadsNoClientes.length === 0}>
              {loading ? "Creando..." : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
