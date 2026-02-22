import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PresupuestoForm } from "@/components/forms/presupuesto-form";
import { usePresupuestos, useCreatePresupuesto, useUpdatePresupuesto, useUpdatePresupuestoEstado, useDeletePresupuesto } from "@/hooks/use-presupuestos";
import { useLeads } from "@/hooks/use-leads";
import { useAuth } from "@/contexts/auth-context";
import type { PresupuestoFormData } from "@/lib/validations/presupuesto";
import { Plus, FileText, MoreHorizontal, Pencil, Trash2, Download } from "lucide-react";
import { downloadPresupuestoPDF } from "@/lib/pdf/presupuesto-pdf";
import { useLocale } from "@/contexts/locale-context";

const estadoVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  borrador: "secondary", enviado: "default", aceptado: "outline", rechazado: "destructive", vencido: "destructive",
};
const estadoLabels: Record<string, string> = {
  borrador: "Borrador", enviado: "Enviado", aceptado: "Aceptado", rechazado: "Rechazado", vencido: "Vencido",
};

export default function PresupuestosPage() {
  const { tp } = useLocale();
  const [searchParams] = useSearchParams();
  const leadId = searchParams.get("lead_id") ?? undefined;
  const { canEdit } = useAuth();
  const { data: presupuestos, isLoading, isError } = usePresupuestos(leadId);
  const { data: leadsData } = useLeads();
  const createPresupuesto = useCreatePresupuesto();
  const updatePresupuesto = useUpdatePresupuesto();
  const updateEstado = useUpdatePresupuestoEstado();
  const deletePresupuesto = useDeletePresupuesto();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const leadOptions = (leadsData ?? []).map((l) => ({ id: l.id, nombre: l.nombre, empresa: l.empresa }));
  const editingPresupuesto = editingId ? presupuestos?.find((p) => p.id === editingId) : null;

  async function handleCreate(data: PresupuestoFormData) {
    try {
      await createPresupuesto.mutateAsync(data);
      toast.success("Presupuesto creado");
      setCreateOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al crear presupuesto");
    }
  }

  async function handleUpdate(data: PresupuestoFormData) {
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
    toast.success(`Estado actualizado a ${estado}`);
  }

  async function handleDelete(id: string) {
    if (confirm("¿Eliminar este presupuesto?")) {
      await deletePresupuesto.mutateAsync(id);
      toast.success("Presupuesto eliminado");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{tp.quotesTitle}</h1>
          <p className="text-muted-foreground">{tp.quotesSubtitle}</p>
        </div>
        {canEdit && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Nuevo presupuesto</Button></DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Nuevo presupuesto</DialogTitle></DialogHeader>
              <PresupuestoForm leads={leadOptions} defaultValues={leadId ? { lead_id: leadId } : undefined} onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} submitLabel="Crear presupuesto" />
            </DialogContent>
          </Dialog>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Listado</CardTitle>
          <CardDescription>{leadId ? "Presupuestos de este lead" : "Presupuestos con lead, fechas y estado"}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : isError ? (
            <p className="text-sm text-destructive">Error al cargar presupuestos.</p>
          ) : !presupuestos || presupuestos.length === 0 ? (
            <EmptyState icon={FileText} title="No hay presupuestos" description="Crea tu primer presupuesto con el botón Nuevo presupuesto." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead><TableHead>Lead</TableHead><TableHead>Emisión</TableHead>
                  <TableHead>Vigencia</TableHead><TableHead>Total</TableHead><TableHead>Estado</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {presupuestos.map((p) => {
                  const lead = Array.isArray(p.leads) ? p.leads[0] : p.leads;
                  const nombre = lead?.nombre ?? "-";
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.numero}</TableCell>
                      <TableCell>{nombre}</TableCell>
                      <TableCell>{new Date(p.fecha_emision).toLocaleDateString("es-AR")}</TableCell>
                      <TableCell>{new Date(p.vigencia_hasta).toLocaleDateString("es-AR")}</TableCell>
                      <TableCell>{p.moneda} {Number(p.total).toLocaleString("es-AR")}</TableCell>
                      <TableCell><Badge variant={estadoVariant[p.estado] ?? "secondary"}>{estadoLabels[p.estado] ?? p.estado}</Badge></TableCell>
                      <TableCell>
                        {canEdit ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditingId(p.id)}><Pencil className="mr-2 h-4 w-4" />Editar</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                const lead = Array.isArray(p.leads) ? p.leads[0] : p.leads;
                                downloadPresupuestoPDF({
                                  numero: p.numero, fecha_emision: p.fecha_emision, vigencia_hasta: p.vigencia_hasta,
                                  moneda: p.moneda, subtotal: Number(p.subtotal), impuestos: Number(p.impuestos),
                                  total: Number(p.total), estado: p.estado,
                                  items: (p.items as { descripcion: string; cantidad: number; precio_unitario: number }[]) ?? [],
                                  lead: lead ? { nombre: lead.nombre, empresa: lead.empresa, email: lead.email } : null,
                                });
                              }}><Download className="mr-2 h-4 w-4" />Exportar PDF</DropdownMenuItem>
                              {p.estado === "borrador" && <DropdownMenuItem onClick={() => handleEstado(p.id, "enviado")}>Marcar como Enviado</DropdownMenuItem>}
                              {p.estado === "enviado" && (<><DropdownMenuItem onClick={() => handleEstado(p.id, "aceptado")}>Marcar como Aceptado</DropdownMenuItem><DropdownMenuItem onClick={() => handleEstado(p.id, "rechazado")}>Marcar como Rechazado</DropdownMenuItem></>)}
                              <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="mr-2 h-4 w-4" />Eliminar</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Dialog open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Editar presupuesto</DialogTitle></DialogHeader>
          {editingPresupuesto && (
            <PresupuestoForm
              leads={leadOptions}
              isEditing
              defaultValues={{
                lead_id: editingPresupuesto.lead_id,
                numero: editingPresupuesto.numero,
                fecha_emision: editingPresupuesto.fecha_emision,
                vigencia_hasta: editingPresupuesto.vigencia_hasta,
                items: (editingPresupuesto.items as { descripcion: string; cantidad: number; precio_unitario: number }[]) ?? [{ descripcion: "", cantidad: 1, precio_unitario: 0 }],
                moneda: editingPresupuesto.moneda,
                estado: editingPresupuesto.estado,
              }}
              onSubmit={handleUpdate}
              onCancel={() => setEditingId(null)}
              submitLabel="Guardar"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
