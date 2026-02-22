import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Video, CalendarCheck, Users, Plus } from "lucide-react";
import { useSolicitudesVideo, useRevisiones, useReferencias, useCreateSolicitudVideo, useCreateRevision, useCreateReferencia } from "@/hooks/use-experiencia";
import { useClientes } from "@/hooks/use-operaciones";
import { useLeads } from "@/hooks/use-leads";
import { useLocale } from "@/contexts/locale-context";

const estadoVariantSol: Record<string, "default" | "secondary" | "outline"> = { pendiente: "secondary", en_proceso: "default", entregado: "outline" };
const tipoLabels: Record<string, string> = { semana1: "Semana 1", mes1: "Mes 1", trimestral: "Trimestral", semestral: "Semestral" };
const TIPO_OPCIONES = [{ value: "semana1", label: "Semana 1" }, { value: "mes1", label: "Mes 1" }, { value: "trimestral", label: "Trimestral" }, { value: "semestral", label: "Semestral" }];

function SolicitudVideoDialog() {
  const [open, setOpen] = useState(false);
  const [clienteId, setClienteId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { data: clientes } = useClientes();
  const createSol = useCreateSolicitudVideo();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(null);
    const form = e.currentTarget;
    const fecha_hora_video = (form.elements.namedItem("fecha_hora_video") as HTMLInputElement)?.value;
    const motivo = (form.elements.namedItem("motivo") as HTMLTextAreaElement)?.value;
    const duracion_min = (form.elements.namedItem("duracion_min") as HTMLInputElement)?.value;
    if (!clienteId || !fecha_hora_video) { setError("Cliente y fecha/hora son requeridos"); return; }
    try {
      await createSol.mutateAsync({ cliente_id: clienteId, fecha_hora_video, motivo: motivo || undefined, duracion_min: duracion_min ? parseInt(duracion_min) : undefined });
      setOpen(false); setClienteId(""); form.reset(); void navigate(0);
    } catch (err) { setError(err instanceof Error ? err.message : "Error"); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Nueva solicitud</Button></DialogTrigger>
      <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Solicitud de video</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="space-y-2"><Label>Cliente *</Label><Select value={clienteId} onValueChange={setClienteId}><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{(clientes ?? []).map((c) => { const l = Array.isArray(c.leads) ? c.leads[0] : c.leads; return <SelectItem key={c.id} value={c.id}>{l?.nombre ?? c.id}</SelectItem>; })}</SelectContent></Select></div>
          <div className="space-y-2"><Label htmlFor="fecha_hora_video">Fecha y hora *</Label><Input id="fecha_hora_video" name="fecha_hora_video" type="datetime-local" required /></div>
          <div className="space-y-2"><Label htmlFor="motivo">Motivo</Label><Textarea id="motivo" name="motivo" rows={3} /></div>
          <div className="space-y-2"><Label htmlFor="duracion_min">Duración (min)</Label><Input id="duracion_min" name="duracion_min" type="number" min={1} /></div>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit" disabled={createSol.isPending}>{createSol.isPending ? "Creando..." : "Crear"}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RevisionDialog() {
  const [open, setOpen] = useState(false);
  const [clienteId, setClienteId] = useState("");
  const [tipo, setTipo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { data: clientes } = useClientes();
  const createRev = useCreateRevision();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(null);
    const form = e.currentTarget;
    const programada_para = (form.elements.namedItem("programada_para") as HTMLInputElement)?.value;
    const notas = (form.elements.namedItem("notas") as HTMLTextAreaElement)?.value;
    if (!clienteId || !tipo || !programada_para) { setError("Todos los campos * son requeridos"); return; }
    try {
      await createRev.mutateAsync({ cliente_id: clienteId, tipo, programada_para, notas: notas || undefined });
      setOpen(false); setClienteId(""); setTipo(""); form.reset(); void navigate(0);
    } catch (err) { setError(err instanceof Error ? err.message : "Error"); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Nueva revisión</Button></DialogTrigger>
      <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Nueva revisión periódica</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="space-y-2"><Label>Cliente *</Label><Select value={clienteId} onValueChange={setClienteId}><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{(clientes ?? []).map((c) => { const l = Array.isArray(c.leads) ? c.leads[0] : c.leads; return <SelectItem key={c.id} value={c.id}>{l?.nombre ?? c.id}</SelectItem>; })}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Tipo *</Label><Select value={tipo} onValueChange={setTipo}><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{TIPO_OPCIONES.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label htmlFor="programada_para">Fecha *</Label><Input id="programada_para" name="programada_para" type="date" required /></div>
          <div className="space-y-2"><Label htmlFor="notas">Notas</Label><Textarea id="notas" name="notas" rows={3} /></div>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit" disabled={createRev.isPending}>{createRev.isPending ? "Creando..." : "Crear"}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ReferenciaDialog() {
  const [open, setOpen] = useState(false);
  const [clienteReferidorId, setClienteReferidorId] = useState("");
  const [leadReferidoId, setLeadReferidoId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { data: clientes } = useClientes();
  const { data: leads } = useLeads();
  const createRef = useCreateReferencia();
  const navigate = useNavigate();

  const leadIdsClientes = new Set((clientes ?? []).map((c) => c.lead_id));
  const leadsNoClientes = (leads ?? []).filter((l) => !leadIdsClientes.has(l.id));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(null);
    const form = e.currentTarget;
    const incentivo_ofrecido = (form.elements.namedItem("incentivo_ofrecido") as HTMLInputElement)?.value;
    if (!clienteReferidorId || !leadReferidoId) { setError("Ambos campos son requeridos"); return; }
    try {
      await createRef.mutateAsync({ cliente_referidor_id: clienteReferidorId, lead_referido_id: leadReferidoId, incentivo_ofrecido: incentivo_ofrecido || undefined });
      setOpen(false); setClienteReferidorId(""); setLeadReferidoId(""); form.reset(); void navigate(0);
    } catch (err) { setError(err instanceof Error ? err.message : "Error"); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Nueva referencia</Button></DialogTrigger>
      <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Nueva referencia</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="space-y-2"><Label>Cliente referidor *</Label><Select value={clienteReferidorId} onValueChange={setClienteReferidorId}><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{(clientes ?? []).map((c) => { const l = Array.isArray(c.leads) ? c.leads[0] : c.leads; return <SelectItem key={c.id} value={c.id}>{l?.nombre ?? c.id}</SelectItem>; })}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Lead referido *</Label><Select value={leadReferidoId} onValueChange={setLeadReferidoId}><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{leadsNoClientes.length === 0 ? <SelectItem value="_" disabled>Sin leads disponibles</SelectItem> : leadsNoClientes.map((l) => <SelectItem key={l.id} value={l.id}>{l.nombre} - {l.email}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label htmlFor="incentivo_ofrecido">Incentivo</Label><Input id="incentivo_ofrecido" name="incentivo_ofrecido" /></div>
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit" disabled={createRef.isPending || leadsNoClientes.length === 0}>{createRef.isPending ? "Creando..." : "Crear"}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ExperienciaPage() {
  const { tp } = useLocale();
  const { data: solicitudes, isLoading: loadSol } = useSolicitudesVideo();
  const { data: revisiones, isLoading: loadRev } = useRevisiones();
  const { data: referencias, isLoading: loadRef } = useReferencias();

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold tracking-tight">{tp.experienceTitle}</h1><p className="text-muted-foreground">{tp.experienceSubtitle}</p></div>
      <Tabs defaultValue="solicitudes" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="solicitudes" className="gap-2"><Video className="h-4 w-4" />Solicitudes de video</TabsTrigger>
          <TabsTrigger value="revisiones" className="gap-2"><CalendarCheck className="h-4 w-4" />Revisiones</TabsTrigger>
          <TabsTrigger value="referencias" className="gap-2"><Users className="h-4 w-4" />Referencias</TabsTrigger>
        </TabsList>
        <TabsContent value="solicitudes" className="space-y-4">
          <Card><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Solicitudes de video</CardTitle><CardDescription>Clientes que solicitan grabaciones específicas</CardDescription></div><SolicitudVideoDialog /></CardHeader>
            <CardContent>{loadSol ? <Skeleton className="h-32" /> : !solicitudes || solicitudes.length === 0 ? <EmptyState icon={Video} title="Sin solicitudes" description="No hay solicitudes de video." /> : (
              <Table><TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>Fecha/hora video</TableHead><TableHead>Motivo</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
                <TableBody>{solicitudes.map((s) => { const cl = Array.isArray(s.clientes) ? s.clientes[0] : s.clientes; const lead = cl?.leads; const nombre = lead ? (Array.isArray(lead) ? lead[0]?.nombre : lead.nombre) : "-"; return (
                  <TableRow key={s.id}><TableCell className="font-medium">{nombre}</TableCell><TableCell>{new Date(s.fecha_hora_video).toLocaleString("es-AR")}</TableCell><TableCell>{s.motivo || "-"}</TableCell><TableCell><Badge variant={estadoVariantSol[s.estado] ?? "secondary"}>{s.estado}</Badge></TableCell></TableRow>
                ); })}</TableBody></Table>
            )}</CardContent></Card>
        </TabsContent>
        <TabsContent value="revisiones" className="space-y-4">
          <Card><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Revisiones periódicas</CardTitle><CardDescription>Semana 1, mes 1, trimestral, semestral</CardDescription></div><RevisionDialog /></CardHeader>
            <CardContent>{loadRev ? <Skeleton className="h-32" /> : !revisiones || revisiones.length === 0 ? <EmptyState icon={CalendarCheck} title="Sin revisiones" description="No hay revisiones programadas." /> : (
              <Table><TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead>Tipo</TableHead><TableHead>Programada para</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
                <TableBody>{revisiones.map((r) => { const cl = Array.isArray(r.clientes) ? r.clientes[0] : r.clientes; const lead = cl?.leads; const nombre = lead ? (Array.isArray(lead) ? lead[0]?.nombre : lead.nombre) : "-"; return (
                  <TableRow key={r.id}><TableCell className="font-medium">{nombre}</TableCell><TableCell>{tipoLabels[r.tipo] ?? r.tipo}</TableCell><TableCell>{new Date(r.programada_para).toLocaleDateString("es-AR")}</TableCell><TableCell>{r.realizada_at ? <Badge variant="outline">Realizada</Badge> : <Badge variant="secondary">Pendiente</Badge>}</TableCell></TableRow>
                ); })}</TableBody></Table>
            )}</CardContent></Card>
        </TabsContent>
        <TabsContent value="referencias" className="space-y-4">
          <Card><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Programa de referencias</CardTitle><CardDescription>Leads referidos por clientes con incentivos</CardDescription></div><ReferenciaDialog /></CardHeader>
            <CardContent>{loadRef ? <Skeleton className="h-32" /> : !referencias || referencias.length === 0 ? <EmptyState icon={Users} title="Sin referencias" description="No hay referencias registradas." /> : (
              <Table><TableHeader><TableRow><TableHead>Cliente referidor</TableHead><TableHead>Lead referido</TableHead><TableHead>Incentivo</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
                <TableBody>{referencias.map((r) => { const cl = Array.isArray(r.clientes) ? r.clientes[0] : r.clientes; const leadRef = cl?.leads; const referidor = leadRef ? (Array.isArray(leadRef) ? leadRef[0]?.nombre : leadRef.nombre) : "-"; const leadRefi = Array.isArray(r.leads) ? r.leads[0] : r.leads; const referido = leadRefi ? `${leadRefi.nombre} (${leadRefi.email})` : "-"; return (
                  <TableRow key={r.id}><TableCell className="font-medium">{referidor}</TableCell><TableCell>{referido}</TableCell><TableCell>{r.incentivo_ofrecido || "-"}</TableCell><TableCell>{r.incentivo_activado_at ? <Badge variant="outline">Activado</Badge> : <Badge variant="secondary">Pendiente</Badge>}</TableCell></TableRow>
                ); })}</TableBody></Table>
            )}</CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
