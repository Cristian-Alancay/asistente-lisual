import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Briefcase, ExternalLink, Mail, Phone, Search, X, DollarSign,
  Building2, CalendarDays, CreditCard, Eye, UserCheck, Camera,
  AlertTriangle, Clock, Plus, Pencil, Trash2, Star, Users, Video,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LICENSES, PLANS } from "@/lib/config/lisual-products";
import { useClientes } from "@/hooks/use-operaciones";
import { useReunionesByLead } from "@/hooks/use-reuniones";
import {
  useContactosCliente,
  useCreateContacto,
  useUpdateContacto,
  useDeleteContacto,
} from "@/hooks/use-contactos-cliente";
import type { ContactoInsert, AreaContacto } from "@/services/contactos-cliente";
import { useLocale } from "@/contexts/locale-context";

const METODO_LABELS: Record<string, string> = {
  transferencia: "Transferencia",
  efectivo: "Efectivo",
  tarjeta: "Tarjeta",
  crypto: "Crypto",
  otro: "Otro",
};

const LICENSE_LABELS: Record<string, string> = Object.fromEntries(LICENSES.map((l) => [l.key, l.name]));
const PLAN_LABELS: Record<string, string> = Object.fromEntries(PLANS.map((p) => [p.key, p.name]));

const AREAS: Record<AreaContacto, string> = {
  direccion: "Dirección",
  obra: "Jefe de obra",
  marketing: "Marketing",
  administracion: "Administración",
  seguridad: "Seguridad",
  compras: "Compras",
  legal: "Legal",
  otro: "Otro",
};

function getVencimientoStatus(fecha: string | null): { label: string; urgency: "expired" | "critical" | "warning" | "ok" | "none" } {
  if (!fecha) return { label: "—", urgency: "none" };
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const target = new Date(fecha + "T00:00:00");
  const diff = Math.round((target.getTime() - now.getTime()) / 86400000);
  if (diff < 0) return { label: `Vencido hace ${Math.abs(diff)}d`, urgency: "expired" };
  if (diff <= 30) return { label: `${diff} días`, urgency: "critical" };
  if (diff <= 90) return { label: `${diff} días`, urgency: "warning" };
  return { label: `${Math.round(diff / 30)} meses`, urgency: "ok" };
}

const urgencyColors: Record<string, string> = {
  expired: "text-red-500 font-semibold",
  critical: "text-orange-500 font-medium",
  warning: "text-yellow-500",
  ok: "text-green-500",
  none: "text-muted-foreground",
};

export default function ClientesPage() {
  const { tp } = useLocale();
  const { data: clientes, isLoading } = useClientes();
  const [search, setSearch] = useState("");
  const [viewId, setViewId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!clientes) return [];
    if (!search.trim()) return clientes;
    const q = search.toLowerCase();
    return clientes.filter((c) => {
      const lead = Array.isArray(c.leads) ? c.leads[0] : c.leads;
      return (
        lead?.nombre?.toLowerCase().includes(q) ||
        lead?.empresa?.toLowerCase().includes(q) ||
        lead?.email?.toLowerCase().includes(q) ||
        lead?.codigo?.toLowerCase().includes(q)
      );
    });
  }, [clientes, search]);

  const viewCliente = viewId ? filtered.find((c) => c.id === viewId) ?? null : null;
  const vLead = viewCliente ? (Array.isArray(viewCliente.leads) ? viewCliente.leads[0] : viewCliente.leads) : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{tp.clientsTitle}</h1>
            <p className="text-xs text-muted-foreground">Clientes con servicio activo — convertidos desde Ventas</p>
          </div>
        </div>
        {clientes && clientes.length > 0 && (
          <Badge variant="secondary" className="text-sm tabular-nums gap-1">
            <UserCheck className="h-3.5 w-3.5" />
            {clientes.length}
          </Badge>
        )}
      </div>

      {/* Search */}
      {clientes && clientes.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, empresa, email..."
            className="h-9 pl-9 pr-8 text-sm"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
        {isLoading ? (
          <div className="space-y-2 p-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : !filtered || filtered.length === 0 ? (
          clientes && clientes.length > 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Sin resultados</div>
          ) : (
            <div className="p-6">
              <EmptyState
                icon={Briefcase}
                title="No hay clientes aún"
                description="Los clientes aparecen acá cuando convertís un lead desde Ventas → Leads → Convertir a Cliente."
              />
            </div>
          )
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/30">
                  <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground/70 w-[100px]">ID</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground/70">Cliente</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground/70 text-center">Servicio</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground/70 text-center">Monto</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground/70 text-center">Vencimiento</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => {
                  const lead = Array.isArray(c.leads) ? c.leads[0] : c.leads;
                  const venc = getVencimientoStatus(c.fecha_vencimiento);
                  return (
                    <TableRow
                      key={c.id}
                      className="border-border/20 hover:bg-accent/30 transition-colors cursor-pointer"
                      onClick={() => setViewId(c.id)}
                    >
                      <TableCell className="py-3">
                        <span className="font-mono text-[11px] text-primary/80 font-medium">
                          {lead?.codigo ?? "—"}
                        </span>
                      </TableCell>
                      <TableCell className="py-3">
                        <div>
                          <p className="font-medium text-sm">{lead?.nombre ?? "—"}</p>
                          {lead?.empresa && <p className="text-xs text-muted-foreground">{lead.empresa}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        <div className="flex flex-wrap justify-center gap-1">
                          {c.cantidad_camaras && (
                            <Badge variant="outline" className="text-[9px] gap-0.5">
                              <Camera className="h-2.5 w-2.5" />{c.cantidad_camaras}
                            </Badge>
                          )}
                          {c.tipo_licencia && (
                            <Badge variant="secondary" className="text-[9px]">
                              {LICENSE_LABELS[c.tipo_licencia] ?? c.tipo_licencia}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        <span className="text-sm font-semibold tabular-nums">
                          U$D {Number(c.monto_pagado).toLocaleString("es-AR")}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        <span className={`inline-flex items-center gap-1 text-xs ${urgencyColors[venc.urgency]}`}>
                          {venc.urgency === "expired" && <AlertTriangle className="h-3 w-3" />}
                          {(venc.urgency === "critical" || venc.urgency === "warning") && <Clock className="h-3 w-3" />}
                          {venc.label}
                        </span>
                        {c.fecha_vencimiento && (
                          <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                            {new Date(c.fecha_vencimiento).toLocaleDateString("es-AR")}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="py-3">
                        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" asChild onClick={(e) => e.stopPropagation()}>
                          <Link to={`/dashboard/operaciones?cliente=${c.id}`}>
                            Proyectos<ExternalLink className="h-3 w-3" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
        {filtered.length > 0 && (
          <div className="border-t border-border/20 px-4 py-2.5 text-[11px] text-muted-foreground/60">
            {filtered.length} cliente{filtered.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Detail dialog */}
      <Dialog open={!!viewId} onOpenChange={(open) => { if (!open) setViewId(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              Detalle del cliente
            </DialogTitle>
          </DialogHeader>
          {viewCliente && vLead && (
            <div className="space-y-4">
              {/* Client header */}
              <div className="rounded-lg border border-border/40 p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{vLead.nombre}</h3>
                    {vLead.empresa && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-3 w-3" />{vLead.empresa}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline" className="font-mono text-primary/80">
                    {vLead.codigo ?? "—"}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {vLead.email && (
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{vLead.email}</span>
                  )}
                  {vLead.telefono && (
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{vLead.telefono}</span>
                  )}
                </div>
              </div>

              {/* Service sold */}
              {(viewCliente.cantidad_camaras || viewCliente.tipo_licencia || viewCliente.plan) && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-primary/70 flex items-center gap-1">
                    <Camera className="h-3 w-3" />Servicio contratado
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {viewCliente.cantidad_camaras && (
                      <Badge variant="outline" className="gap-1"><Camera className="h-3 w-3" />{viewCliente.cantidad_camaras} cámara{viewCliente.cantidad_camaras > 1 ? "s" : ""}</Badge>
                    )}
                    {viewCliente.tipo_licencia && (
                      <Badge variant="secondary">{LICENSE_LABELS[viewCliente.tipo_licencia] ?? viewCliente.tipo_licencia}</Badge>
                    )}
                    {viewCliente.plan && (
                      <Badge variant="secondary">{PLAN_LABELS[viewCliente.plan] ?? viewCliente.plan}</Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Contract + Payment */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border/40 p-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider">
                    <DollarSign className="h-3 w-3" />Monto pagado
                  </div>
                  <p className="mt-1 text-lg font-bold tabular-nums">
                    U$D {Number(viewCliente.monto_pagado).toLocaleString("es-AR")}
                  </p>
                </div>
                <div className="rounded-lg border border-border/40 p-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider">
                    <CalendarDays className="h-3 w-3" />Fecha de pago
                  </div>
                  <p className="mt-1 text-sm font-medium">
                    {new Date(viewCliente.fecha_pago).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}
                  </p>
                </div>
                {viewCliente.fecha_vencimiento && (() => {
                  const v = getVencimientoStatus(viewCliente.fecha_vencimiento);
                  return (
                    <div className={`rounded-lg border p-3 ${v.urgency === "expired" || v.urgency === "critical" ? "border-red-500/30 bg-red-500/5" : "border-border/40"}`}>
                      <div className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider">Vencimiento</div>
                      <p className="mt-1 text-sm font-medium">
                        {new Date(viewCliente.fecha_vencimiento).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}
                      </p>
                      <p className={`text-xs mt-0.5 ${urgencyColors[v.urgency]}`}>{v.label}</p>
                    </div>
                  );
                })()}
                {viewCliente.duracion_meses && (
                  <div className="rounded-lg border border-border/40 p-3">
                    <div className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider">Duración</div>
                    <p className="mt-1 text-sm">{viewCliente.duracion_meses} meses</p>
                  </div>
                )}
                {viewCliente.metodo_pago && (
                  <div className="rounded-lg border border-border/40 p-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider">
                      <CreditCard className="h-3 w-3" />Método
                    </div>
                    <p className="mt-1 text-sm">{METODO_LABELS[viewCliente.metodo_pago] ?? viewCliente.metodo_pago}</p>
                  </div>
                )}
                {viewCliente.referencia_pago && (
                  <div className="rounded-lg border border-border/40 p-3">
                    <div className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider">Referencia</div>
                    <p className="mt-1 text-sm font-mono">{viewCliente.referencia_pago}</p>
                  </div>
                )}
              </div>

              {/* Conversion notes */}
              {viewCliente.notas_conversion && (
                <div className="rounded-lg border border-border/40 p-3">
                  <p className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider">Notas de conversión</p>
                  <p className="text-sm mt-0.5 whitespace-pre-wrap">{viewCliente.notas_conversion}</p>
                </div>
              )}

              {/* Lead info */}
              {(vLead.necesidad || vLead.notas) && (
                <div className="rounded-lg border border-border/40 p-3 space-y-2">
                  {vLead.necesidad && (
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider">Necesidad original</p>
                      <p className="text-sm mt-0.5">{vLead.necesidad}</p>
                    </div>
                  )}
                  {vLead.notas && (
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider">Notas</p>
                      <p className="text-sm mt-0.5 whitespace-pre-wrap">{vLead.notas}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Reuniones del lead */}
              <ReunionesLeadSection leadId={viewCliente.lead_id} />

              {/* Contactos */}
              <ContactosSection clienteId={viewCliente.id} />

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <Button variant="outline" size="sm" className="gap-1.5" asChild>
                  <Link to={`/dashboard/operaciones?cliente=${viewCliente.id}`}>
                    Proyectos<ExternalLink className="h-3 w-3" />
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5" asChild>
                  <Link to={`/dashboard/experiencia`}>
                    Experiencia<ExternalLink className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReunionesLeadSection({ leadId }: { leadId: string }) {
  const { data: reuniones, isLoading } = useReunionesByLead(leadId);

  if (isLoading) return <Skeleton className="h-12 w-full" />;
  if (!reuniones || reuniones.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
        <Video className="h-3 w-3" />Reuniones
        <Badge variant="secondary" className="text-[9px] ml-1">{reuniones.length}</Badge>
      </h4>
      <div className="space-y-1.5">
        {reuniones.slice(0, 5).map((r) => (
          <div key={r.id} className="flex items-center gap-3 rounded-lg border border-border/30 px-3 py-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{r.titulo || r.titulo_calendario || "Reunión"}</p>
              <p className="text-[10px] text-muted-foreground">
                {r.fecha_reunion ? new Date(r.fecha_reunion).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                {r.duracion_min ? ` · ${r.duracion_min}min` : ""}
              </p>
            </div>
            <div className="flex gap-1 shrink-0">
              {r.resumen_md && <Badge variant="secondary" className="text-[9px]">AI</Badge>}
              {r.fathom_url && (
                <a href={r.fathom_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        ))}
        {reuniones.length > 5 && (
          <p className="text-[10px] text-muted-foreground text-center">+{reuniones.length - 5} más</p>
        )}
      </div>
    </div>
  );
}

const EMPTY_CONTACTO: Omit<ContactoInsert, "cliente_id"> = {
  nombre: "",
  cargo: null,
  area: null,
  email: null,
  telefono: null,
  es_principal: false,
  notas: null,
};

function ContactosSection({ clienteId }: { clienteId: string }) {
  const { data: contactos, isLoading } = useContactosCliente(clienteId);
  const createMut = useCreateContacto();
  const updateMut = useUpdateContacto(clienteId);
  const deleteMut = useDeleteContacto(clienteId);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_CONTACTO);

  function openCreate() {
    setForm(EMPTY_CONTACTO);
    setEditingId(null);
    setFormOpen(true);
  }

  function openEdit(c: typeof contactos extends (infer T)[] | undefined ? T : never) {
    if (!c) return;
    setForm({
      nombre: c.nombre,
      cargo: c.cargo,
      area: c.area as AreaContacto | null,
      email: c.email,
      telefono: c.telefono,
      es_principal: c.es_principal,
      notas: c.notas,
    });
    setEditingId(c.id);
    setFormOpen(true);
  }

  async function handleSubmit() {
    if (!form.nombre.trim()) return;
    if (editingId) {
      await updateMut.mutateAsync({ id: editingId, data: form });
    } else {
      await createMut.mutateAsync({ ...form, cliente_id: clienteId });
    }
    setFormOpen(false);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          <Users className="h-3 w-3" />Contactos
          {contactos && contactos.length > 0 && (
            <Badge variant="secondary" className="text-[9px] ml-1">{contactos.length}</Badge>
          )}
        </h4>
        <Button variant="ghost" size="sm" className="h-6 gap-1 text-[10px]" onClick={openCreate}>
          <Plus className="h-3 w-3" />Agregar
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-16 w-full" />
      ) : !contactos || contactos.length === 0 ? (
        <button
          onClick={openCreate}
          className="w-full rounded-lg border border-dashed border-border/50 py-4 text-center text-xs text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors"
        >
          Sin contactos registrados. Click para agregar.
        </button>
      ) : (
        <div className="space-y-1.5">
          {contactos.map((c) => (
            <div
              key={c.id}
              className="group flex items-start gap-3 rounded-lg border border-border/30 bg-card/30 px-3 py-2 transition-colors hover:bg-accent/20"
            >
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium truncate">{c.nombre}</span>
                  {c.es_principal && <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />}
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  {c.cargo && <span className="text-[11px] text-muted-foreground">{c.cargo}</span>}
                  {c.area && (
                    <Badge variant="outline" className="text-[9px] h-4">{AREAS[c.area as AreaContacto] ?? c.area}</Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                  {c.email && (
                    <span className="flex items-center gap-0.5"><Mail className="h-2.5 w-2.5" />{c.email}</span>
                  )}
                  {c.telefono && (
                    <span className="flex items-center gap-0.5"><Phone className="h-2.5 w-2.5" />{c.telefono}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEdit(c)}>
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost" size="icon" className="h-6 w-6 text-destructive"
                  onClick={() => { if (confirm("¿Eliminar contacto?")) deleteMut.mutate(c.id); }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit form */}
      <Dialog open={formOpen} onOpenChange={(open) => { if (!open) setFormOpen(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar contacto" : "Nuevo contacto"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Nombre *</label>
                <Input
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                  className="h-8 text-sm"
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Cargo</label>
                <Input
                  value={form.cargo ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, cargo: e.target.value || null }))}
                  className="h-8 text-sm"
                  placeholder="Jefe de obra"
                />
              </div>
              <div>
                <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Área</label>
                <Select
                  value={form.area ?? ""}
                  onValueChange={(v) => setForm((f) => ({ ...f, area: (v || null) as AreaContacto | null }))}
                >
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    {(Object.entries(AREAS) as [AreaContacto, string][]).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Email</label>
                <Input
                  type="email"
                  value={form.email ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value || null }))}
                  className="h-8 text-sm"
                  placeholder="contacto@empresa.com"
                />
              </div>
              <div>
                <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Teléfono</label>
                <Input
                  value={form.telefono ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value || null }))}
                  className="h-8 text-sm"
                  placeholder="+54 9 11..."
                />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.es_principal}
                    onChange={(e) => setForm((f) => ({ ...f, es_principal: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-xs font-medium flex items-center gap-1">
                    <Star className="h-3 w-3 text-amber-400" />Principal
                  </span>
                </label>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Notas</label>
              <Textarea
                value={form.notas ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value || null }))}
                className="text-sm min-h-[40px]"
                placeholder="Horario de contacto, preferencias..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border/30">
              <Button variant="outline" size="sm" onClick={() => setFormOpen(false)}>Cancelar</Button>
              <Button
                size="sm"
                disabled={!form.nombre.trim() || createMut.isPending || updateMut.isPending}
                onClick={handleSubmit}
              >
                {createMut.isPending || updateMut.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
