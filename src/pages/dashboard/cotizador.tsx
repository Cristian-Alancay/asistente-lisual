import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuotePreview } from "@/components/cotizador/quote-preview";
import { PresupuestoForm } from "@/components/forms/presupuesto-form";
import { useLeads } from "@/hooks/use-leads";
import {
  usePresupuestos,
  useCreatePresupuesto,
  useProximoNumero,
  useUpdatePresupuesto,
  useUpdatePresupuestoEstado,
  useDeletePresupuesto,
} from "@/hooks/use-presupuestos";
import { useAuth } from "@/contexts/auth-context";
import { generatePresupuestoPDF, downloadPresupuestoPDF } from "@/lib/pdf/presupuesto-pdf";
import { useSendEmail, useEmailLog } from "@/hooks/use-email";
import type { PresupuestoFormData } from "@/lib/validations/presupuesto";
import {
  CAMERAS,
  LICENSES,
  PLANS,
  QUOTE_DEFAULTS,
  IVA_PCT,
  calcQuoteTotals,
} from "@/lib/config/lisual-products";
import type { CameraOption, LicenseOption, PlanOption } from "@/lib/config/lisual-products";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Printer, Save, Calculator, MoreHorizontal, Pencil, Download,
  Trash2, FileText, ChevronDown, ChevronUp, Search, X, Eye,
  Clock, ArrowRight, ExternalLink, Mail, CheckCircle2, AlertTriangle,
  Send,
} from "lucide-react";

function addDays(iso: string, days: number) {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const estadoVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  borrador: "secondary", enviado: "default", aceptado: "outline", rechazado: "destructive", vencido: "destructive",
};
const estadoLabels: Record<string, string> = {
  borrador: "Borrador", enviado: "Enviado", aceptado: "Aceptado", rechazado: "Rechazado", vencido: "Vencido",
};

export default function CotizadorPage() {
  const [searchParams] = useSearchParams();
  const preselectedLeadId = searchParams.get("lead_id") ?? "";

  const queryClient = useQueryClient();
  const { canEdit } = useAuth();
  const { data: leadsData } = useLeads();
  const { data: presupuestos, isLoading: loadingPres } = usePresupuestos();
  const createPresupuesto = useCreatePresupuesto();
  const updatePresupuesto = useUpdatePresupuesto();
  const updateEstado = useUpdatePresupuestoEstado();
  const deletePresupuesto = useDeletePresupuesto();

  const sendEmailMutation = useSendEmail();

  const [leadId, setLeadId] = useState(preselectedLeadId);
  const [camIdx, setCamIdx] = useState(3);
  const [licIdx, setLicIdx] = useState(1);
  const [planIdx, setPlanIdx] = useState(1);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(true);
  const [includeIva, setIncludeIva] = useState(false);
  const [discountPct, setDiscountPct] = useState(0);
  const [version, setVersion] = useState(1);
  const [tableSearch, setTableSearch] = useState("");
  const [tableFilter, setTableFilter] = useState<"all" | "lead">("all");
  const [viewingId, setViewingId] = useState<string | null>(null);

  const camera: CameraOption = CAMERAS[camIdx];
  const license: LicenseOption = LICENSES[licIdx];
  const plan: PlanOption = PLANS[planIdx];

  const leads = useMemo(
    () => (leadsData ?? []).map((l) => ({
      id: l.id, codigo: l.codigo, nombre: l.nombre, empresa: l.empresa,
      email: l.email, telefono: l.telefono,
    })),
    [leadsData],
  );

  const selectedLead = useMemo(
    () => leads.find((l) => l.id === leadId) ?? null,
    [leads, leadId],
  );

  const { data: proximoNumero } = useProximoNumero(
    selectedLead?.nombre,
    selectedLead?.empresa ?? undefined,
  );

  const today = new Date().toISOString().slice(0, 10);
  const vigencia = addDays(today, QUOTE_DEFAULTS.validityDays);
  const numero = proximoNumero ?? "";
  const totals = calcQuoteTotals(camera, license, plan, { includeIva, discountPct });

  const leadPresCount = useMemo(() => {
    if (!leadId || !presupuestos) return 0;
    return presupuestos.filter((p) => p.lead_id === leadId).length;
  }, [presupuestos, leadId]);

  const filteredPresupuestos = useMemo(() => {
    if (!presupuestos) return [];
    let result = presupuestos;

    if (tableFilter === "lead" && leadId) {
      result = result.filter((p) => p.lead_id === leadId);
    }

    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase();
      result = result.filter((p) => {
        const lead = Array.isArray(p.leads) ? p.leads[0] : p.leads;
        const nombre = lead?.nombre ?? "";
        return (
          p.numero.toLowerCase().includes(q) ||
          nombre.toLowerCase().includes(q) ||
          (lead?.codigo ?? "").toLowerCase().includes(q) ||
          p.estado.toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [presupuestos, tableFilter, leadId, tableSearch]);

  async function handleGenerar() {
    if (!leadId) { toast.error("Seleccioná un lead primero"); return; }
    if (!numero) { toast.error("Esperá a que se genere el número"); return; }

    setSaving(true);
    try {
      const items = [
        { descripcion: `Equipamiento: ${camera.label}`, cantidad: camera.quantity, precio_unitario: camera.totalPrice / camera.quantity },
        { descripcion: `${license.name} — Anual (hasta ${license.maxCams} cams)`, cantidad: 1, precio_unitario: license.price },
        ...(totals.planYearlyCost > 0
          ? [{ descripcion: `${plan.name} — Suscripción Anual (${camera.quantity} cams x 12 meses)`, cantidad: 1, precio_unitario: totals.planYearlyCost }]
          : []),
      ];

      await createPresupuesto.mutateAsync({
        lead_id: leadId, numero, fecha_emision: today, vigencia_hasta: vigencia,
        moneda: "USD", estado: "borrador", items,
        subtotal_override: totals.afterDiscount, impuestos_override: totals.ivaAmount, total_override: totals.globalTotal,
      });
      toast.success("Presupuesto generado", { description: numero });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("409") || msg.includes("duplicate") || msg.includes("conflict")) {
        toast.error("Ese número ya existe. Refrescando...");
        await queryClient.invalidateQueries({ queryKey: ["presupuestos"] });
      } else {
        toast.error(msg || "Error al generar presupuesto");
      }
    } finally {
      setSaving(false);
    }
  }

  const leadOptions = useMemo(
    () => (leadsData ?? []).map((l) => ({ id: l.id, codigo: l.codigo, nombre: l.nombre, empresa: l.empresa })),
    [leadsData],
  );

  const editingPresupuesto = editingId ? presupuestos?.find((p) => p.id === editingId) : null;
  const viewingPresupuesto = viewingId ? presupuestos?.find((p) => p.id === viewingId) ?? null : null;

  const clientHistory = useMemo(() => {
    if (!viewingPresupuesto || !presupuestos) return [];
    return presupuestos
      .filter((p) => p.lead_id === viewingPresupuesto.lead_id && p.id !== viewingPresupuesto.id)
      .sort((a, b) => new Date(b.fecha_emision).getTime() - new Date(a.fecha_emision).getTime());
  }, [viewingPresupuesto, presupuestos]);

  async function handleUpdatePres(data: PresupuestoFormData) {
    if (!editingId) return;
    try {
      await updatePresupuesto.mutateAsync({ id: editingId, form: data });
      toast.success("Presupuesto actualizado");
      setEditingId(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al actualizar");
    }
  }

  async function handleEstado(id: string, estado: PresupuestoFormData["estado"]) {
    await updateEstado.mutateAsync({ id, estado });
    toast.success(`Estado → ${estadoLabels[estado] ?? estado}`);
  }

  async function handleDeletePres(id: string) {
    if (confirm("¿Eliminar este presupuesto?")) {
      await deletePresupuesto.mutateAsync(id);
      toast.success("Presupuesto eliminado");
    }
  }

  async function handleSendEmail(presupuesto: {
    id: string; numero: string; fecha_emision: string; vigencia_hasta: string;
    moneda: string; subtotal: string | number; impuestos: string | number;
    total: string | number; estado: string;
    items: { descripcion: string; cantidad: number; precio_unitario: number }[];
    leads: { nombre: string; empresa?: string | null; email?: string | null } | { nombre: string; empresa?: string | null; email?: string | null }[] | null;
  }) {
    const ld = Array.isArray(presupuesto.leads) ? presupuesto.leads[0] : presupuesto.leads;
    if (!ld?.email) {
      toast.error("Este lead no tiene email registrado");
      return;
    }

    const pdfDoc = generatePresupuestoPDF({
      numero: presupuesto.numero, fecha_emision: presupuesto.fecha_emision,
      vigencia_hasta: presupuesto.vigencia_hasta, moneda: presupuesto.moneda,
      subtotal: Number(presupuesto.subtotal), impuestos: Number(presupuesto.impuestos),
      total: Number(presupuesto.total), estado: presupuesto.estado,
      items: presupuesto.items,
      lead: { nombre: ld.nombre, empresa: ld.empresa, email: ld.email },
    });
    const pdfBase64 = pdfDoc.output("datauristring").split(",")[1];

    await sendEmailMutation.mutateAsync({
      type: "presupuesto",
      to: ld.email,
      data: {
        clientName: ld.nombre,
        empresa: ld.empresa ?? undefined,
        numero: presupuesto.numero,
        fechaEmision: presupuesto.fecha_emision,
        vigenciaHasta: presupuesto.vigencia_hasta,
        moneda: presupuesto.moneda,
        items: presupuesto.items,
        subtotal: Number(presupuesto.subtotal),
        impuestos: Number(presupuesto.impuestos),
        total: Number(presupuesto.total),
      },
      attachments: [{ filename: `cotizacion-${presupuesto.numero}.pdf`, content: pdfBase64 }],
      presupuesto_id: presupuesto.id,
    });

    if (presupuesto.estado === "borrador") {
      await handleEstado(presupuesto.id, "enviado");
    }
  }

  return (
    <div className="space-y-6">
      {/* ═══ CONTROLS ═══ */}
      <div className="no-print space-y-4">
        {/* Title row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calculator className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Cotizador NOMOS</h1>
              <p className="text-xs text-muted-foreground">Generador de presupuestos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleGenerar} disabled={saving || !leadId} size="sm" className="gap-1.5">
              <Save className="h-3.5 w-3.5" />
              {saving ? "Generando..." : "Generar"}
            </Button>
            <Button variant="outline" onClick={() => window.print()} size="sm" className="gap-1.5">
              <Printer className="h-3.5 w-3.5" />
              PDF
            </Button>
            <Button
              variant="outline" size="sm" className="gap-1.5"
              disabled={!selectedLead?.email || sendEmailMutation.isPending}
              title={!selectedLead?.email ? "El lead no tiene email" : "Enviar cotización por email"}
              onClick={async () => {
                if (!leadId || !presupuestos) return;
                const latest = presupuestos.find((p) => p.lead_id === leadId);
                if (!latest) { toast.error("Generá un presupuesto primero"); return; }
                await handleSendEmail({
                  ...latest,
                  items: (latest.items as { descripcion: string; cantidad: number; precio_unitario: number }[]) ?? [],
                });
              }}
            >
              <Mail className="h-3.5 w-3.5" />
              {sendEmailMutation.isPending ? "Enviando..." : "Email"}
            </Button>
          </div>
        </div>

        {/* Configuration panel */}
        <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          {/* Row 1: Lead + existing quotes badge */}
          <div className="border-b border-border/30 p-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1 block">
                  Cliente / Lead
                </label>
                <Select value={leadId} onValueChange={(v) => { setLeadId(v); setVersion(1); }}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Seleccioná un lead..." />
                  </SelectTrigger>
                  <SelectContent>
                    {leads.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        <span className="font-mono text-[10px] text-primary/70 mr-1.5">{l.codigo}</span>
                        <span className="font-medium">{l.nombre}</span>
                        {l.empresa && <span className="text-muted-foreground ml-1">— {l.empresa}</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {leadId && leadPresCount > 0 && (
                <button
                  onClick={() => { setShowTable(true); setTableFilter("lead"); }}
                  className="flex flex-col items-center gap-0.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-center transition-colors hover:bg-amber-500/20"
                >
                  <span className="text-lg font-bold tabular-nums text-amber-600">{leadPresCount}</span>
                  <span className="text-[9px] font-medium uppercase tracking-wider text-amber-600/80">
                    existentes
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Products */}
          <div className="grid grid-cols-3 divide-x divide-border/30 border-b border-border/30">
            <div className="p-3">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1 block">Cámaras</label>
              <Select value={String(camIdx)} onValueChange={(v) => setCamIdx(Number(v))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CAMERAS.map((c, i) => (
                    <SelectItem key={c.quantity} value={String(i)}>
                      {c.label} — {c.totalPrice.toLocaleString("es-AR")} USD
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="p-3">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1 block">Licencia Anual</label>
              <Select value={String(licIdx)} onValueChange={(v) => setLicIdx(Number(v))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LICENSES.map((l, i) => (
                    <SelectItem key={l.key} value={String(i)}>
                      {l.name} ({l.maxCams} cams) — {l.price.toLocaleString("es-AR")} USD
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="p-3">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1 block">Plan Suscripción</label>
              <Select value={String(planIdx)} onValueChange={(v) => setPlanIdx(Number(v))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLANS.map((p, i) => (
                    <SelectItem key={p.key} value={String(i)}>
                      {p.name} {p.monthlyPerCam > 0 ? `(${p.monthlyPerCam} USD/mes)` : "(gratis)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3: Options (IVA, Discount, Version) */}
          <div className="flex items-center divide-x divide-border/30 border-b border-border/30">
            <label className="flex items-center gap-2 px-4 py-2.5 cursor-pointer hover:bg-accent/30 transition-colors flex-1">
              <Checkbox checked={includeIva} onCheckedChange={(v) => setIncludeIva(v === true)} />
              <span className="text-xs font-medium">IVA {IVA_PCT}%</span>
            </label>

            <div className="flex items-center gap-2 px-4 py-2.5 flex-1">
              <span className="text-xs font-medium text-muted-foreground">Dto.</span>
              <Input
                type="number" min={0} max={100} step={1}
                value={discountPct || ""}
                onChange={(e) => setDiscountPct(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
                placeholder="0" className="h-7 w-14 text-center text-xs tabular-nums"
              />
              <span className="text-xs text-muted-foreground">%</span>
              {discountPct > 0 && (
                <span className="text-[10px] text-red-500 font-semibold">
                  −{totals.discountAmount.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 px-4 py-2.5">
              <span className="text-xs font-medium text-muted-foreground">Ver.</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" disabled={version <= 1} onClick={() => setVersion((v) => Math.max(1, v - 1))}>−</Button>
              <span className="w-6 text-center font-bold tabular-nums text-xs">v{version}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setVersion((v) => v + 1)}>+</Button>
            </div>
          </div>

          {/* Row 4: Totals strip */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 bg-primary/5 px-4 py-2.5 text-xs">
            {(discountPct > 0 || includeIva) && (
              <>
                <div>
                  <span className="text-muted-foreground">Subtotal</span>{" "}
                  <span className="font-semibold tabular-nums">
                    {totals.subtotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <span className="text-muted-foreground/30 hidden sm:inline">|</span>
              </>
            )}
            {discountPct > 0 && (
              <>
                <div className="text-red-500">
                  Dto. {discountPct}%{" "}
                  <span className="font-semibold tabular-nums">
                    −{totals.discountAmount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <span className="text-muted-foreground/30 hidden sm:inline">|</span>
              </>
            )}
            {includeIva && (
              <>
                <div>
                  <span className="text-muted-foreground">IVA</span>{" "}
                  <span className="font-semibold tabular-nums">
                    {totals.ivaAmount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <span className="text-muted-foreground/30 hidden sm:inline">|</span>
              </>
            )}
            <div>
              <span className="text-muted-foreground">Total</span>{" "}
              <strong className="text-sm tabular-nums">
                U$D {totals.globalTotal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </strong>
            </div>
            <span className="text-muted-foreground/30 hidden sm:inline">|</span>
            <div>
              <span className="text-muted-foreground">Mensual</span>{" "}
              <span className="font-semibold tabular-nums">{totals.monthlyAvg.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
            </div>
            <span className="text-muted-foreground/30 hidden sm:inline">|</span>
            <div>
              <span className="text-muted-foreground">Día/cam</span>{" "}
              <span className="font-semibold tabular-nums text-green-600">{totals.dailyPerCam.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ PRESUPUESTOS TABLE ═══ */}
      <div className="no-print">
        <button
          onClick={() => setShowTable((v) => !v)}
          className="flex w-full items-center justify-between rounded-t-xl border border-border/50 bg-card/50 px-4 py-3 text-left backdrop-blur-sm transition-colors hover:bg-accent/30"
        >
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Presupuestos</span>
            {presupuestos && presupuestos.length > 0 && (
              <Badge variant="secondary" className="text-[10px]">{presupuestos.length}</Badge>
            )}
            {tableFilter === "lead" && leadId && (
              <Badge variant="outline" className="text-[10px] gap-1">
                <Eye className="h-3 w-3" />
                Solo {selectedLead?.nombre}
                <button onClick={(e) => { e.stopPropagation(); setTableFilter("all"); }} className="ml-1 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
          {showTable ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        {showTable && (
          <div className="rounded-b-xl border border-t-0 border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
            {/* Search bar */}
            <div className="flex items-center gap-2 border-b border-border/20 px-4 py-2">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Buscar por número, cliente, estado..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
              />
              {tableSearch && (
                <button onClick={() => setTableSearch("")} className="text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <div className="flex items-center gap-1 border-l border-border/30 pl-2">
                <button
                  onClick={() => setTableFilter("all")}
                  className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${tableFilter === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Todos
                </button>
                {leadId && (
                  <button
                    onClick={() => setTableFilter("lead")}
                    className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${tableFilter === "lead" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Lead actual
                  </button>
                )}
              </div>
            </div>

            {loadingPres ? (
              <div className="space-y-2 p-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : filteredPresupuestos.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">
                {tableSearch || tableFilter === "lead" ? "Sin resultados" : "No hay presupuestos aún"}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border/30">
                      <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground/70">Número</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground/70">Lead</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground/70">Emisión</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground/70">Vigencia</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground/70 text-right">Total</TableHead>
                      <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground/70 text-center">Estado</TableHead>
                      <TableHead className="w-[36px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPresupuestos.map((p) => {
                      const lead = Array.isArray(p.leads) ? p.leads[0] : p.leads;
                      const nombre = lead?.nombre ?? "—";
                      const isCurrentLead = p.lead_id === leadId;
                      return (
                        <TableRow
                          key={p.id}
                          onClick={() => setViewingId(p.id)}
                          className={`border-border/20 transition-colors cursor-pointer ${isCurrentLead ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-accent/30"}`}
                        >
                          <TableCell className="py-2.5 font-mono text-[11px] font-medium">
                            <div className="flex items-center gap-1.5">
                              {isCurrentLead && <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                              <span className="truncate max-w-[200px]">{p.numero}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-2.5 text-sm">
                            {lead?.codigo && <span className="font-mono text-[10px] text-primary/60 mr-1.5">{lead.codigo}</span>}
                            {nombre}
                          </TableCell>
                          <TableCell className="py-2.5 text-muted-foreground text-xs tabular-nums">
                            {new Date(p.fecha_emision).toLocaleDateString("es-AR")}
                          </TableCell>
                          <TableCell className="py-2.5 text-muted-foreground text-xs tabular-nums">
                            {new Date(p.vigencia_hasta).toLocaleDateString("es-AR")}
                          </TableCell>
                          <TableCell className="py-2.5 text-right font-semibold tabular-nums text-xs">
                            {p.moneda === "USD" ? "U$D" : "$"} {Number(p.total).toLocaleString("es-AR")}
                          </TableCell>
                          <TableCell className="py-2.5 text-center">
                            <Badge variant={estadoVariant[p.estado] ?? "secondary"} className="text-[10px]">
                              {estadoLabels[p.estado] ?? p.estado}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2.5">
                            {canEdit && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 opacity-50 hover:opacity-100">
                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setEditingId(p.id)}>
                                    <Pencil className="mr-2 h-3.5 w-3.5" />Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    const ld = Array.isArray(p.leads) ? p.leads[0] : p.leads;
                                    downloadPresupuestoPDF({
                                      numero: p.numero, fecha_emision: p.fecha_emision, vigencia_hasta: p.vigencia_hasta,
                                      moneda: p.moneda, subtotal: Number(p.subtotal), impuestos: Number(p.impuestos),
                                      total: Number(p.total), estado: p.estado,
                                      items: (p.items as { descripcion: string; cantidad: number; precio_unitario: number }[]) ?? [],
                                      lead: ld ? { nombre: ld.nombre, empresa: ld.empresa, email: ld.email } : null,
                                    });
                                  }}>
                                    <Download className="mr-2 h-3.5 w-3.5" />Exportar PDF
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    disabled={sendEmailMutation.isPending}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSendEmail({
                                        ...p,
                                        items: (p.items as { descripcion: string; cantidad: number; precio_unitario: number }[]) ?? [],
                                      });
                                    }}
                                  >
                                    <Mail className="mr-2 h-3.5 w-3.5" />
                                    {p.estado !== "borrador" ? "Reenviar por email" : "Enviar por email"}
                                  </DropdownMenuItem>
                                  {p.estado === "borrador" && (
                                    <DropdownMenuItem onClick={() => handleEstado(p.id, "enviado")}>Marcar Enviado</DropdownMenuItem>
                                  )}
                                  {p.estado === "enviado" && (
                                    <>
                                      <DropdownMenuItem onClick={() => handleEstado(p.id, "aceptado")}>Marcar Aceptado</DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleEstado(p.id, "rechazado")}>Marcar Rechazado</DropdownMenuItem>
                                    </>
                                  )}
                                  <DropdownMenuItem className="text-destructive" onClick={() => handleDeletePres(p.id)}>
                                    <Trash2 className="mr-2 h-3.5 w-3.5" />Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══ A4 PREVIEW ═══ */}
      <QuotePreview
        lead={selectedLead} camera={camera} license={license} plan={plan}
        fechaEmision={today} vigenciaHasta={vigencia} numero={numero}
        includeIva={includeIva} discountPct={discountPct} version={version}
      />

      {/* ═══ DETAIL DIALOG ═══ */}
      <Dialog open={!!viewingId} onOpenChange={(open) => { if (!open) setViewingId(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          {viewingPresupuesto && (() => {
            const vLead = Array.isArray(viewingPresupuesto.leads) ? viewingPresupuesto.leads[0] : viewingPresupuesto.leads;
            const vItems = (viewingPresupuesto.items as { descripcion: string; cantidad: number; precio_unitario: number }[]) ?? [];
            const vNombre = vLead?.nombre ?? "—";
            const vEmpresa = vLead?.empresa;
            return (
              <>
                {/* Header */}
                <div className="border-b border-border/30 bg-muted/30 px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <p className="font-mono text-xs text-muted-foreground truncate">{viewingPresupuesto.numero}</p>
                      <h2 className="text-lg font-bold tracking-tight">{vNombre}</h2>
                      {vEmpresa && <p className="text-sm text-muted-foreground">{vEmpresa}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={estadoVariant[viewingPresupuesto.estado] ?? "secondary"}>
                        {estadoLabels[viewingPresupuesto.estado] ?? viewingPresupuesto.estado}
                      </Badge>
                      <span className="text-xl font-bold tabular-nums">
                        {viewingPresupuesto.moneda === "USD" ? "U$D" : "$"} {Number(viewingPresupuesto.total).toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Emisión: {new Date(viewingPresupuesto.fecha_emision).toLocaleDateString("es-AR")}</span>
                    <span>Vigencia: {new Date(viewingPresupuesto.vigencia_hasta).toLocaleDateString("es-AR")}</span>
                  </div>
                </div>

                {/* Items */}
                <div className="px-6 py-4 space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                    Detalle de la cotización
                  </h3>
                  <div className="rounded-lg border border-border/40 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/40">
                          <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Concepto</th>
                          <th className="px-3 py-2 text-center text-[10px] uppercase tracking-wider text-muted-foreground font-semibold w-16">Cant.</th>
                          <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-muted-foreground font-semibold w-24">P. Unit.</th>
                          <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-muted-foreground font-semibold w-28">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vItems.map((item, idx) => (
                          <tr key={idx} className="border-t border-border/20">
                            <td className="px-3 py-2.5 text-sm">{item.descripcion}</td>
                            <td className="px-3 py-2.5 text-center tabular-nums text-muted-foreground">{item.cantidad}</td>
                            <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                              {Number(item.precio_unitario).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-3 py-2.5 text-right tabular-nums font-medium">
                              {(item.cantidad * item.precio_unitario).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        {Number(viewingPresupuesto.impuestos) > 0 && (
                          <tr className="border-t border-border/30">
                            <td colSpan={3} className="px-3 py-2 text-right text-xs text-muted-foreground">Subtotal</td>
                            <td className="px-3 py-2 text-right tabular-nums text-sm">
                              {Number(viewingPresupuesto.subtotal).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        )}
                        {Number(viewingPresupuesto.impuestos) > 0 && (
                          <tr className="border-t border-border/20">
                            <td colSpan={3} className="px-3 py-2 text-right text-xs text-muted-foreground">IVA</td>
                            <td className="px-3 py-2 text-right tabular-nums text-sm">
                              {Number(viewingPresupuesto.impuestos).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        )}
                        <tr className="border-t border-border/40 bg-muted/30">
                          <td colSpan={3} className="px-3 py-2.5 text-right font-semibold text-sm">Total</td>
                          <td className="px-3 py-2.5 text-right tabular-nums font-bold text-sm">
                            {viewingPresupuesto.moneda === "USD" ? "U$D" : "$"} {Number(viewingPresupuesto.total).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="outline" size="sm" className="gap-1.5"
                      onClick={() => {
                        downloadPresupuestoPDF({
                          numero: viewingPresupuesto.numero, fecha_emision: viewingPresupuesto.fecha_emision,
                          vigencia_hasta: viewingPresupuesto.vigencia_hasta, moneda: viewingPresupuesto.moneda,
                          subtotal: Number(viewingPresupuesto.subtotal), impuestos: Number(viewingPresupuesto.impuestos),
                          total: Number(viewingPresupuesto.total), estado: viewingPresupuesto.estado, items: vItems,
                          lead: vLead ? { nombre: vLead.nombre, empresa: vLead.empresa, email: vLead.email } : null,
                        });
                      }}
                    >
                      <Download className="h-3.5 w-3.5" />Exportar PDF
                    </Button>
                    <Button
                      size="sm" className="gap-1.5"
                      disabled={!vLead?.email || sendEmailMutation.isPending}
                      onClick={() => handleSendEmail({ ...viewingPresupuesto, items: vItems })}
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {sendEmailMutation.isPending ? "Enviando..." : vLead?.email ? "Enviar por email" : "Sin email"}
                    </Button>
                    {canEdit && (
                      <Button
                        variant="outline" size="sm" className="gap-1.5"
                        onClick={() => { setViewingId(null); setEditingId(viewingPresupuesto.id); }}
                      >
                        <Pencil className="h-3.5 w-3.5" />Editar
                      </Button>
                    )}
                  </div>
                </div>

                {/* Email Log */}
                <EmailLogSection presupuestoId={viewingPresupuesto.id} />

                {/* Client History */}
                {clientHistory.length > 0 && (
                  <div className="border-t border-border/30 px-6 py-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                        Historial de cotizaciones — {vNombre}
                      </h3>
                      <Badge variant="secondary" className="text-[9px]">{clientHistory.length}</Badge>
                    </div>

                    <div className="space-y-0">
                      {clientHistory.map((hp, hIdx) => {
                        const hItems = (hp.items as { descripcion: string; cantidad: number; precio_unitario: number }[]) ?? [];
                        const diff = hIdx < clientHistory.length - 1
                          ? Number(hp.total) - Number(clientHistory[hIdx + 1].total)
                          : 0;
                        return (
                          <div key={hp.id} className="group relative flex gap-3">
                            {/* Timeline line */}
                            <div className="flex flex-col items-center">
                              <div className={`mt-1.5 h-2.5 w-2.5 rounded-full border-2 shrink-0 ${
                                hp.estado === "aceptado" ? "border-green-500 bg-green-500/20"
                                  : hp.estado === "rechazado" ? "border-red-500 bg-red-500/20"
                                  : "border-muted-foreground/40 bg-muted"
                              }`} />
                              {hIdx < clientHistory.length - 1 && (
                                <div className="w-px flex-1 bg-border/40" />
                              )}
                            </div>

                            {/* Content */}
                            <div
                              className="flex-1 pb-4 cursor-pointer"
                              onClick={() => setViewingId(hp.id)}
                            >
                              <div className="rounded-lg border border-border/30 bg-card/30 p-3 transition-colors hover:bg-accent/30">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="font-mono text-[10px] text-muted-foreground truncate">{hp.numero}</span>
                                    <Badge variant={estadoVariant[hp.estado] ?? "secondary"} className="text-[9px] shrink-0">
                                      {estadoLabels[hp.estado] ?? hp.estado}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="font-semibold tabular-nums text-sm">
                                      {hp.moneda === "USD" ? "U$D" : "$"} {Number(hp.total).toLocaleString("es-AR")}
                                    </span>
                                    {diff !== 0 && (
                                      <span className={`text-[10px] font-medium tabular-nums ${diff > 0 ? "text-green-600" : "text-red-500"}`}>
                                        {diff > 0 ? "+" : ""}{diff.toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                                      </span>
                                    )}
                                    <ExternalLink className="h-3 w-3 text-muted-foreground/40 group-hover:text-muted-foreground" />
                                  </div>
                                </div>
                                <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                                  <span>{new Date(hp.fecha_emision).toLocaleDateString("es-AR")}</span>
                                  <ArrowRight className="h-3 w-3" />
                                  <span>{new Date(hp.vigencia_hasta).toLocaleDateString("es-AR")}</span>
                                </div>
                                {hItems.length > 0 && (
                                  <div className="mt-2 space-y-0.5">
                                    {hItems.slice(0, 3).map((it, itIdx) => (
                                      <div key={itIdx} className="flex items-center justify-between text-[11px]">
                                        <span className="text-muted-foreground truncate max-w-[300px]">{it.descripcion}</span>
                                        <span className="tabular-nums text-muted-foreground/70 shrink-0 ml-2">
                                          {(it.cantidad * it.precio_unitario).toLocaleString("es-AR", { maximumFractionDigits: 0 })}
                                        </span>
                                      </div>
                                    ))}
                                    {hItems.length > 3 && (
                                      <span className="text-[10px] text-muted-foreground/50">+{hItems.length - 3} más</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ═══ EDIT DIALOG ═══ */}
      <Dialog open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Editar presupuesto</DialogTitle></DialogHeader>
          {editingPresupuesto && (
            <PresupuestoForm
              leads={leadOptions} isEditing
              defaultValues={{
                lead_id: editingPresupuesto.lead_id, numero: editingPresupuesto.numero,
                fecha_emision: editingPresupuesto.fecha_emision, vigencia_hasta: editingPresupuesto.vigencia_hasta,
                items: (editingPresupuesto.items as { descripcion: string; cantidad: number; precio_unitario: number }[]) ?? [{ descripcion: "", cantidad: 1, precio_unitario: 0 }],
                moneda: editingPresupuesto.moneda, estado: editingPresupuesto.estado,
              }}
              onSubmit={handleUpdatePres} onCancel={() => setEditingId(null)} submitLabel="Guardar"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EmailLogSection({ presupuestoId }: { presupuestoId: string }) {
  const { data: emailLog, isLoading } = useEmailLog(presupuestoId);

  if (isLoading) {
    return (
      <div className="border-t border-border/30 px-6 py-4">
        <Skeleton className="h-6 w-40 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!emailLog || emailLog.length === 0) return null;

  const estadoConfig: Record<string, { icon: typeof Mail; color: string; label: string }> = {
    enviado: { icon: CheckCircle2, color: "text-green-600", label: "Enviado" },
    error: { icon: AlertTriangle, color: "text-red-500", label: "Error" },
    rebotado: { icon: AlertTriangle, color: "text-amber-500", label: "Rebotado" },
  };

  return (
    <div className="border-t border-border/30 px-6 py-4 space-y-3">
      <div className="flex items-center gap-2">
        <Send className="h-3.5 w-3.5 text-muted-foreground" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
          Historial de envíos
        </h3>
        <Badge variant="secondary" className="text-[9px]">{emailLog.length}</Badge>
      </div>

      <div className="space-y-1.5">
        {emailLog.map((entry) => {
          const cfg = estadoConfig[entry.estado] ?? estadoConfig.enviado;
          const Icon = cfg.icon;
          return (
            <div
              key={entry.id}
              className="flex items-center gap-3 rounded-lg border border-border/30 bg-card/30 px-3 py-2 text-sm"
            >
              <Icon className={`h-4 w-4 shrink-0 ${cfg.color}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium truncate">{entry.destinatario}</span>
                  <Badge
                    variant={entry.estado === "enviado" ? "outline" : "destructive"}
                    className="text-[9px] shrink-0"
                  >
                    {cfg.label}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                  {entry.asunto}
                </p>
                {entry.error_detail && (
                  <p className="text-[10px] text-red-500 mt-0.5 truncate">{entry.error_detail}</p>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                {new Date(entry.created_at).toLocaleDateString("es-AR", {
                  day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
