import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { LeadForm } from "@/components/forms/lead-form";
import { useLeads, useCreateLead, useUpdateLead, useDeleteLead, useConvertLead } from "@/hooks/use-leads";
import { useAuth } from "@/contexts/auth-context";
import type { LeadFormData } from "@/lib/validations/lead";
import {
  Plus, Users, MoreHorizontal, Pencil, Trash2, FileText,
  Copy, Clock, AlertTriangle, ArrowUpDown, ArrowUp, ArrowDown,
  Search, X, TrendingUp, DollarSign, Timer, Calculator, Video,
  UserCheck, ArrowRightCircle, Camera,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { CAMERAS, LICENSES, PLANS } from "@/lib/config/lisual-products";
import { ExportMenu } from "@/components/export-menu";
import { useLocale } from "@/contexts/locale-context";
import { cn } from "@/lib/utils";

// --- Helpers ---

const ESTADO_LABELS: Record<string, string> = {
  prospecto: "Prospecto", negociacion: "Negociación", convertido: "Convertido", perdido: "Perdido",
};

const estadoVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  prospecto: "secondary", negociacion: "default", convertido: "outline", perdido: "destructive",
};

function getCountdown(fechaStr: string | null): { days: number | null; label: string; urgency: "overdue" | "urgent" | "soon" | "ok" | "none" } {
  if (!fechaStr) return { days: null, label: "—", urgency: "none" };
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(fechaStr + "T00:00:00");
  const diffDays = Math.round((target.getTime() - now.getTime()) / 86400000);

  if (diffDays < 0) return { days: diffDays, label: `${Math.abs(diffDays)}d vencido`, urgency: "overdue" };
  if (diffDays === 0) return { days: 0, label: "Hoy", urgency: "overdue" };
  if (diffDays === 1) return { days: 1, label: "Mañana", urgency: "urgent" };
  if (diffDays <= 3) return { days: diffDays, label: `${diffDays} días`, urgency: "urgent" };
  if (diffDays <= 7) return { days: diffDays, label: `${diffDays} días`, urgency: "soon" };
  return { days: diffDays, label: `${diffDays} días`, urgency: "ok" };
}

const urgencyStyles: Record<string, string> = {
  overdue: "text-destructive font-semibold",
  urgent: "text-orange-500 font-medium",
  soon: "text-yellow-500",
  ok: "text-muted-foreground",
  none: "text-muted-foreground",
};

function displayId(lead: { codigo?: string; id: string }) {
  return lead.codigo || lead.id.slice(0, 8).toUpperCase();
}

// --- Sorting ---

type SortKey = "nombre" | "empresa" | "estado" | "monto" | "decision";
type SortDir = "asc" | "desc";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sortLeads(leads: any[], key: SortKey, dir: SortDir) {
  const m = dir === "asc" ? 1 : -1;
  return [...leads].sort((a, b) => {
    switch (key) {
      case "nombre": return m * (a.nombre ?? "").localeCompare(b.nombre ?? "");
      case "empresa": return m * (a.empresa ?? "").localeCompare(b.empresa ?? "");
      case "estado": return m * (a.estado ?? "").localeCompare(b.estado ?? "");
      case "monto": return m * ((a.presupuesto_estimado ?? 0) - (b.presupuesto_estimado ?? 0));
      case "decision": {
        const da = a.fecha_decision_estimada ? new Date(a.fecha_decision_estimada).getTime() : Infinity;
        const db = b.fecha_decision_estimada ? new Date(b.fecha_decision_estimada).getTime() : Infinity;
        return m * (da - db);
      }
      default: return 0;
    }
  });
}

function SortableHead({ label, sortKey, current, dir, onSort, className }: {
  label: string; sortKey: SortKey; current: SortKey | null; dir: SortDir;
  onSort: (k: SortKey) => void; className?: string;
}) {
  const active = current === sortKey;
  return (
    <TableHead className={cn("cursor-pointer select-none group", className)} onClick={() => onSort(sortKey)}>
      <span className={cn("inline-flex items-center gap-1", className?.includes("text-center") && "justify-center w-full", className?.includes("text-right") && "justify-end w-full")}>
        {label}
        {active ? (
          dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-40 transition-opacity" />
        )}
      </span>
    </TableHead>
  );
}

// --- Page ---

export default function LeadsPage() {
  const { tp } = useLocale();
  const { canEdit } = useAuth();
  const { data: leads, isLoading, isError } = useLeads();
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const convertLead = useConvertLead();
  const [createOpen, setCreateOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingLead, setEditingLead] = useState<any | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [convertingLead, setConvertingLead] = useState<any | null>(null);
  const [convertForm, setConvertForm] = useState({
    fecha_pago: new Date().toISOString().slice(0, 10),
    monto_pagado: 0,
    metodo_pago: "",
    referencia_pago: "",
    cantidad_camaras: 1,
    tipo_licencia: "",
    plan: "",
    duracion_meses: 12,
    notas_conversion: "",
  });

  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("activos");
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const filtered = useMemo(() => {
    if (!leads) return [];
    let result = leads;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.nombre?.toLowerCase().includes(q) ||
          l.empresa?.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q) ||
          l.codigo?.toLowerCase().includes(q) ||
          l.id?.toLowerCase().includes(q)
      );
    }
    if (filterEstado === "activos") {
      result = result.filter((l) => l.estado !== "convertido" && l.estado !== "perdido");
    } else if (filterEstado !== "all") {
      result = result.filter((l) => l.estado === filterEstado);
    }
    if (sortKey) {
      result = sortLeads(result, sortKey, sortDir);
    }
    return result;
  }, [leads, search, filterEstado, sortKey, sortDir]);

  const stats = useMemo(() => {
    if (!leads) return { total: 0, montoTotal: 0, urgentes: 0 };
    const activos = leads.filter((l) => l.estado !== "convertido" && l.estado !== "perdido");
    let montoTotal = 0;
    let urgentes = 0;
    for (const l of activos) {
      if (l.presupuesto_estimado) montoTotal += Number(l.presupuesto_estimado);
      const cd = getCountdown(l.fecha_decision_estimada);
      if (cd.urgency === "overdue" || cd.urgency === "urgent") urgentes++;
    }
    return { total: activos.length, montoTotal, urgentes };
  }, [leads]);

  async function handleCreate(data: LeadFormData) {
    try {
      await createLead.mutateAsync(data);
      toast.success("Lead creado correctamente");
      setCreateOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al crear el lead");
    }
  }

  async function handleUpdate(data: LeadFormData) {
    if (!editingLead) return;
    try {
      await updateLead.mutateAsync({ id: editingLead.id, form: data });
      toast.success("Lead actualizado");
      setEditingLead(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al actualizar");
    }
  }

  async function handleDelete(id: string) {
    if (confirm("¿Eliminar este lead?")) {
      await deleteLead.mutateAsync(id);
      toast.success("Lead eliminado");
    }
  }

  function copyId(id: string) {
    navigator.clipboard.writeText(id);
    toast.success("ID copiado", { description: id });
  }

  const exportHeaders = [
    "ID", "Nombre", "Empresa", "Email", "Teléfono", "Estado",
    "Moneda", "Monto Estimado", "Canal", "Decisión Estimada",
    "Necesidad", "Notas", "Cotiz. Dólar", "Fecha Cotiz.",
  ];

  const exportRows = useMemo(() => {
    return (filtered ?? []).map((l) => [
      displayId(l),
      l.nombre ?? "",
      l.empresa ?? "",
      l.email ?? "",
      l.telefono ?? "",
      ESTADO_LABELS[l.estado] ?? l.estado ?? "",
      l.presupuesto_estimado_moneda ?? "",
      l.presupuesto_estimado ?? "",
      l.canal_origen ?? "",
      l.fecha_decision_estimada ?? "",
      l.necesidad ?? "",
      l.notas ?? "",
      l.cotizacion_dolar_valor ?? "",
      l.cotizacion_dolar_fecha ?? "",
    ]);
  }, [filtered]);

  return (
    <TooltipProvider delayDuration={200}>
    <div className="space-y-2">
      {/* Header compact: title + KPIs + actions in one strip */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold tracking-tight whitespace-nowrap">{tp.leadsTitle}</h1>

        {!isLoading && leads && leads.length > 0 && (
          <div className="hidden sm:flex items-center gap-3 text-xs border-l border-border/40 pl-4">
            <span className="flex items-center gap-1 text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span className="font-semibold text-foreground tabular-nums">{stats.total}</span> activos
            </span>
            <span className="text-border/60">·</span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              <span className="font-semibold text-foreground tabular-nums">U$D {stats.montoTotal.toLocaleString("es-AR")}</span>
            </span>
            {stats.urgentes > 0 && (
              <>
                <span className="text-border/60">·</span>
                <span className="flex items-center gap-1 text-orange-500 font-medium">
                  <Timer className="h-3 w-3" />
                  {stats.urgentes} urgente{stats.urgentes > 1 ? "s" : ""}
                </span>
              </>
            )}
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          {leads && leads.length > 0 && (
            <ExportMenu
              title={`Leads — NOMOS ${new Date().toLocaleDateString("es-AR")}`}
              headers={exportHeaders}
              rows={exportRows}
              filenamePrefix="leads-nomos"
              disabled={filtered.length === 0}
            />
          )}
          {canEdit && (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-7 text-xs gap-1"><Plus className="h-3.5 w-3.5" />Nuevo Lead</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Nuevo Lead</DialogTitle></DialogHeader>
                <LeadForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} submitLabel="Crear Lead" />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Filters bar — single compact row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7 pl-7 pr-7 text-xs"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <Select value={filterEstado} onValueChange={setFilterEstado}>
          <SelectTrigger className="h-7 w-[140px] text-xs">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="activos">Pipeline activo</SelectItem>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(ESTADO_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(search || filterEstado !== "activos") && (
          <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1 px-2" onClick={() => { setSearch(""); setFilterEstado("activos"); }}>
            <X className="h-2.5 w-2.5" />Limpiar
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
        {isLoading ? (
          <div className="space-y-1 p-3">{[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-7 w-full" />)}</div>
        ) : isError ? (
          <p className="p-4 text-xs text-destructive">Error al cargar leads. Verifica las tablas en Supabase y RLS.</p>
        ) : filtered.length === 0 ? (
          leads && leads.length > 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">Sin resultados para los filtros aplicados.</div>
          ) : (
            <div className="p-4"><EmptyState icon={Users} title="No hay leads" description="Usa el botón Nuevo Lead para crear tu primer prospecto." /></div>
          )
        ) : (
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/30 h-8">
                <TableHead className="w-[72px] text-[10px] uppercase tracking-wider text-muted-foreground/70 py-1.5 px-3">#</TableHead>
                <SortableHead label="Nombre" sortKey="nombre" current={sortKey} dir={sortDir} onSort={handleSort} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 py-1.5" />
                <SortableHead label="Empresa" sortKey="empresa" current={sortKey} dir={sortDir} onSort={handleSort} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 py-1.5" />
                <SortableHead label="Estado" sortKey="estado" current={sortKey} dir={sortDir} onSort={handleSort} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 text-center py-1.5" />
                <SortableHead label="Monto" sortKey="monto" current={sortKey} dir={sortDir} onSort={handleSort} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 text-center py-1.5" />
                <SortableHead label="Decisión" sortKey="decision" current={sortKey} dir={sortDir} onSort={handleSort} className="text-[10px] uppercase tracking-wider text-muted-foreground/70 text-center py-1.5" />
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground/70 text-center py-1.5">Presup.</TableHead>
                <TableHead className="w-[36px] py-1.5"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((lead) => {
                const presupuestos: { id: string; numero: string }[] = Array.isArray(lead.presupuestos) ? lead.presupuestos : [];
                const cd = getCountdown(lead.fecha_decision_estimada);
                return (
                <TableRow key={lead.id} className="border-border/20 hover:bg-accent/30 transition-colors h-9">
                  <TableCell className="py-1 px-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => copyId(lead.id)}
                          className="group flex items-center gap-1 font-mono text-[10px] text-muted-foreground/60 hover:text-foreground transition-colors"
                        >
                          {displayId(lead)}
                          <Copy className="h-2.5 w-2.5 opacity-0 group-hover:opacity-60 transition-opacity" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p className="font-mono text-xs">{lead.id}</p>
                        <p className="text-xs text-muted-foreground">Click para copiar</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="py-1 text-xs font-medium">{lead.nombre}</TableCell>
                  <TableCell className="py-1 text-xs text-muted-foreground">{lead.empresa || "—"}</TableCell>
                  <TableCell className="py-1 text-center">
                    <Badge variant={estadoVariant[lead.estado] ?? "secondary"} className="text-[10px] px-1.5 py-0 font-medium leading-5">
                      {ESTADO_LABELS[lead.estado] ?? lead.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-1 text-center">
                    {lead.presupuesto_estimado ? (
                      <span className="text-xs font-semibold tabular-nums">
                        {(lead.presupuesto_estimado_moneda === "ARS" ? "$ " : "U$D ")}{Number(lead.presupuesto_estimado).toLocaleString("es-AR")}
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground/40">—</span>
                    )}
                  </TableCell>
                  <TableCell className="py-1 text-center">
                    <span className={cn("inline-flex items-center gap-1 text-[11px] whitespace-nowrap", urgencyStyles[cd.urgency])}>
                      {cd.urgency === "overdue" && <AlertTriangle className="h-2.5 w-2.5" />}
                      {(cd.urgency === "urgent" || cd.urgency === "soon") && <Clock className="h-2.5 w-2.5" />}
                      {cd.label}
                    </span>
                  </TableCell>
                  <TableCell className="py-1 text-center">
                    {presupuestos.length === 0 ? (
                      <span className="text-[10px] text-muted-foreground/40">—</span>
                    ) : (
                      <div className="flex flex-wrap justify-center gap-0.5">
                        {presupuestos.map((p) => (
                          <Link key={p.id} to={`/dashboard/presupuestos?lead_id=${lead.id}`}>
                            <Badge variant="outline" className="cursor-pointer text-[9px] font-mono px-1 py-0 leading-4 hover:bg-primary/10 hover:text-primary transition-colors">
                              {p.numero}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="py-1 px-1">
                    {canEdit && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-50 hover:opacity-100"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/dashboard/presupuestos?lead_id=${lead.id}`}><FileText className="mr-2 h-3.5 w-3.5" />Ver presupuestos</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/dashboard/cotizador?lead_id=${lead.id}`}><Calculator className="mr-2 h-3.5 w-3.5" />Crear cotización</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/dashboard/reuniones?lead=${lead.id}`}><Video className="mr-2 h-3.5 w-3.5" />Ver reuniones</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditingLead(lead)}><Pencil className="mr-2 h-3.5 w-3.5" />Editar</DropdownMenuItem>
                          {lead.estado !== "convertido" && lead.estado !== "perdido" && (
                            <DropdownMenuItem
                              onClick={() => {
                                setConvertingLead(lead);
                                setConvertForm({
                                  fecha_pago: new Date().toISOString().slice(0, 10),
                                  monto_pagado: lead.presupuesto_estimado ? Number(lead.presupuesto_estimado) : 0,
                                  metodo_pago: "",
                                  referencia_pago: "",
                                  cantidad_camaras: 1,
                                  tipo_licencia: "",
                                  plan: "",
                                  duracion_meses: 12,
                                  notas_conversion: "",
                                });
                              }}
                              className="text-green-600"
                            >
                              <UserCheck className="mr-2 h-3.5 w-3.5" />Convertir a Cliente
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDelete(lead.id)} className="text-destructive"><Trash2 className="mr-2 h-3.5 w-3.5" />Eliminar</DropdownMenuItem>
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
        {filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-border/20 px-3 py-1.5 text-[10px] text-muted-foreground/60">
            <span>{filtered.length} de {leads?.length ?? 0} leads</span>
            {sortKey && <span>Ordenado por {sortKey}</span>}
          </div>
        )}
      </div>

      {/* Convert to client dialog */}
      <Dialog open={!!convertingLead} onOpenChange={(open) => { if (!open) setConvertingLead(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightCircle className="h-5 w-5 text-green-600" />
              Convertir a Cliente
            </DialogTitle>
          </DialogHeader>
          {convertingLead && (() => {
            const vencimiento = convertForm.fecha_pago && convertForm.duracion_meses
              ? (() => {
                  const d = new Date(convertForm.fecha_pago + "T12:00:00");
                  d.setMonth(d.getMonth() + convertForm.duracion_meses);
                  return d.toISOString().slice(0, 10);
                })()
              : "";
            return (
            <div className="space-y-4">
              <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3">
                <p className="text-sm font-medium">{convertingLead.nombre}</p>
                {convertingLead.empresa && <p className="text-xs text-muted-foreground">{convertingLead.empresa}</p>}
                <p className="mt-1 text-xs text-muted-foreground">
                  Este lead pasa a CX — Clientes. Desaparece del pipeline de ventas.
                </p>
              </div>

              {/* Qué se vendió */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Camera className="h-3 w-3" />Qué se vendió
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Cámaras</label>
                    <Select
                      value={String(convertForm.cantidad_camaras)}
                      onValueChange={(v) => setConvertForm((f) => ({ ...f, cantidad_camaras: Number(v) }))}
                    >
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CAMERAS.map((c) => (
                          <SelectItem key={c.quantity} value={String(c.quantity)}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Licencia</label>
                    <Select
                      value={convertForm.tipo_licencia}
                      onValueChange={(v) => setConvertForm((f) => ({ ...f, tipo_licencia: v }))}
                    >
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        {LICENSES.map((l) => (
                          <SelectItem key={l.key} value={l.key}>{l.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Plan</label>
                    <Select
                      value={convertForm.plan}
                      onValueChange={(v) => setConvertForm((f) => ({ ...f, plan: v }))}
                    >
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        {PLANS.map((p) => (
                          <SelectItem key={p.key} value={p.key}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Pago */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pago</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Fecha de pago *</label>
                    <Input
                      type="date"
                      value={convertForm.fecha_pago}
                      onChange={(e) => setConvertForm((f) => ({ ...f, fecha_pago: e.target.value }))}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Monto pagado (USD) *</label>
                    <Input
                      type="number"
                      value={convertForm.monto_pagado || ""}
                      onChange={(e) => setConvertForm((f) => ({ ...f, monto_pagado: Number(e.target.value) || 0 }))}
                      className="h-8 text-sm"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Método de pago</label>
                    <Select value={convertForm.metodo_pago} onValueChange={(v) => setConvertForm((f) => ({ ...f, metodo_pago: v }))}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transferencia">Transferencia</SelectItem>
                        <SelectItem value="efectivo">Efectivo</SelectItem>
                        <SelectItem value="tarjeta">Tarjeta</SelectItem>
                        <SelectItem value="crypto">Crypto</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Ref. de pago</label>
                    <Input
                      value={convertForm.referencia_pago}
                      onChange={(e) => setConvertForm((f) => ({ ...f, referencia_pago: e.target.value }))}
                      className="h-8 text-sm"
                      placeholder="Nro. comprobante"
                    />
                  </div>
                </div>
              </div>

              {/* Duración + vencimiento auto */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Contrato</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Duración</label>
                    <Select
                      value={String(convertForm.duracion_meses)}
                      onValueChange={(v) => setConvertForm((f) => ({ ...f, duracion_meses: Number(v) }))}
                    >
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 meses</SelectItem>
                        <SelectItem value="12">12 meses (1 año)</SelectItem>
                        <SelectItem value="18">18 meses</SelectItem>
                        <SelectItem value="24">24 meses (2 años)</SelectItem>
                        <SelectItem value="36">36 meses (3 años)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Vencimiento (auto)</label>
                    <div className="flex h-8 items-center rounded-md border border-border/50 bg-muted/30 px-3 text-sm tabular-nums">
                      {vencimiento
                        ? new Date(vencimiento + "T12:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })
                        : "—"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Notas de conversión</label>
                <Textarea
                  value={convertForm.notas_conversion}
                  onChange={(e) => setConvertForm((f) => ({ ...f, notas_conversion: e.target.value }))}
                  className="text-sm min-h-[50px]"
                  placeholder="Observaciones sobre la venta, condiciones especiales..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/30">
                <Button variant="outline" size="sm" onClick={() => setConvertingLead(null)}>Cancelar</Button>
                <Button
                  size="sm"
                  className="gap-1.5 bg-green-600 hover:bg-green-700"
                  disabled={convertLead.isPending || !convertForm.fecha_pago}
                  onClick={async () => {
                    await convertLead.mutateAsync({
                      lead_id: convertingLead.id,
                      ...convertForm,
                      fecha_vencimiento: vencimiento || undefined,
                    });
                    setConvertingLead(null);
                  }}
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  {convertLead.isPending ? "Convirtiendo..." : "Confirmar conversión"}
                </Button>
              </div>
            </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editingLead} onOpenChange={(open) => !open && setEditingLead(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Editar Lead</DialogTitle></DialogHeader>
          {editingLead && (
            <LeadForm
              defaultValues={{
                nombre: editingLead.nombre,
                empresa: editingLead.empresa ?? "",
                email: editingLead.email,
                telefono: editingLead.telefono ?? "",
                canal_origen: editingLead.canal_origen as LeadFormData["canal_origen"],
                estado: editingLead.estado as LeadFormData["estado"],
                presupuesto_estimado: editingLead.presupuesto_estimado ?? undefined,
                presupuesto_estimado_moneda: (editingLead.presupuesto_estimado_moneda as LeadFormData["presupuesto_estimado_moneda"]) ?? "USD",
                link_reunion: editingLead.link_reunion ?? "",
                necesidad: editingLead.necesidad ?? "",
                fecha_decision_estimada: editingLead.fecha_decision_estimada ?? "",
                notas: editingLead.notas ?? "",
              }}
              onSubmit={handleUpdate}
              onCancel={() => setEditingLead(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  );
}
