import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInstalacionesPendientes, useActivos, useProyectos, useCreateActivo } from "@/hooks/use-operaciones";
import { useAuth } from "@/contexts/auth-context";
import { Plus, Wrench, Package } from "lucide-react";
import { useLocale } from "@/contexts/locale-context";

const tipoLabels: Record<string, string> = { camara: "Cámara", chip: "Chip", teleport: "Teleport" };
const estadoVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  en_stock: "secondary", asignado: "default", instalado: "outline", en_distribucion: "destructive",
};

function ActivoCreateDialog() {
  const { canEdit } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tipo, setTipo] = useState<"camara" | "chip" | "teleport">("camara");
  const [proyectoId, setProyectoId] = useState("");
  const [estado, setEstado] = useState("en_stock");
  const { data: proyectos } = useProyectos();
  const createActivo = useCreateActivo();
  const navigate = useNavigate();

  if (!canEdit) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(null); setLoading(true);
    const form = e.currentTarget;
    const codigo = (form.elements.namedItem("codigo") as HTMLInputElement)?.value;
    const numero_serie = (form.elements.namedItem("numero_serie") as HTMLInputElement)?.value;
    const iccid = (form.elements.namedItem("iccid") as HTMLInputElement)?.value;
    const numero_telefono = (form.elements.namedItem("numero_telefono") as HTMLInputElement)?.value;
    if (!codigo) { setError("Código es requerido"); setLoading(false); return; }
    try {
      await createActivo.mutateAsync({ proyecto_id: proyectoId || undefined, tipo, codigo, numero_serie: numero_serie || undefined, iccid: iccid || undefined, numero_telefono: numero_telefono || undefined, estado: proyectoId ? undefined : estado });
      setOpen(false); setProyectoId(""); form.reset(); void navigate(0);
    } catch (err) { setError(err instanceof Error ? err.message : "Error al crear equipo"); }
    finally { setLoading(false); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Nuevo equipo</Button></DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Nuevo equipo</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="space-y-2"><Label>Tipo *</Label><Select value={tipo} onValueChange={(v) => setTipo(v as typeof tipo)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="camara">Cámara</SelectItem><SelectItem value="chip">Chip</SelectItem><SelectItem value="teleport">Teleport</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label htmlFor="codigo">Código *</Label><Input id="codigo" name="codigo" placeholder="CAM-ABC-001" required /></div>
          <div className="space-y-2"><Label htmlFor="numero_serie">Número de serie</Label><Input id="numero_serie" name="numero_serie" /></div>
          {(tipo === "chip" || tipo === "teleport") && (<><div className="space-y-2"><Label htmlFor="iccid">ICCID</Label><Input id="iccid" name="iccid" /></div><div className="space-y-2"><Label htmlFor="numero_telefono">Número de teléfono</Label><Input id="numero_telefono" name="numero_telefono" /></div></>)}
          <div className="space-y-2"><Label>Proyecto (opcional)</Label><Select value={proyectoId} onValueChange={setProyectoId}><SelectTrigger><SelectValue placeholder="Sin asignar" /></SelectTrigger><SelectContent><SelectItem value="">Sin asignar</SelectItem>{(proyectos ?? []).map((p) => <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>)}</SelectContent></Select></div>
          {!proyectoId && (<div className="space-y-2"><Label>Estado</Label><Select value={estado} onValueChange={setEstado}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="en_stock">En stock</SelectItem><SelectItem value="en_distribucion">En distribución</SelectItem></SelectContent></Select></div>)}
          <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button type="submit" disabled={loading}>{loading ? "Creando..." : "Crear"}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function InstalacionesPage() {
  const { tp } = useLocale();
  const { data: pendientes, isLoading: loadingPend } = useInstalacionesPendientes();
  const { data: activos, isLoading: loadingAct } = useActivos();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{tp.installationsTitle}</h1>
          <p className="text-muted-foreground">{tp.installationsSubtitle}</p>
        </div>
        <ActivoCreateDialog />
      </div>
      <Card>
        <CardHeader><CardTitle>Instalaciones pendientes</CardTitle><CardDescription>Proyectos sin instalación completada o con equipos en distribución</CardDescription></CardHeader>
        <CardContent>
          {loadingPend ? <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          : !pendientes || pendientes.length === 0 ? <EmptyState icon={Wrench} title="Sin instalaciones pendientes" description="No hay instalaciones pendientes en este momento." action={{ label: "Ver operaciones", href: "/dashboard/operaciones" }} />
          : (
            <Table>
              <TableHeader><TableRow><TableHead>Proyecto</TableHead><TableHead>Cliente</TableHead><TableHead>Fecha programada</TableHead><TableHead>Estado</TableHead><TableHead>Equipos en distribución</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {pendientes.map((p) => (
                  <TableRow key={p.proyecto_id}>
                    <TableCell className="font-medium">{p.proyecto_nombre}</TableCell>
                    <TableCell>{p.cliente_nombre}{p.cliente_empresa ? ` (${p.cliente_empresa})` : ""}</TableCell>
                    <TableCell>{p.fecha_instalacion_programada ? new Date(p.fecha_instalacion_programada).toLocaleDateString("es-AR") : "-"}</TableCell>
                    <TableCell><Badge variant="outline">{p.proyecto_estado}</Badge></TableCell>
                    <TableCell>{(p.equipos_en_distribucion ?? 0) > 0 ? <Badge variant="secondary">{p.equipos_en_distribucion} en distribución</Badge> : "-"}</TableCell>
                    <TableCell><Link to="/dashboard/operaciones" className="text-sm text-primary hover:underline">Ver proyecto</Link></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Equipos / Activos</CardTitle><CardDescription>Cámaras, chips y teleports. Estado: en stock, asignado, instalado o en distribución</CardDescription></CardHeader>
        <CardContent>
          {loadingAct ? <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          : !activos || activos.length === 0 ? <EmptyState icon={Package} title="Sin equipos" description="No hay equipos registrados. Haz clic en Nuevo equipo para agregar." action={{ label: "Ver instalaciones", href: "/dashboard/instalaciones" }} />
          : (
            <Table>
              <TableHeader><TableRow><TableHead>Código</TableHead><TableHead>Tipo</TableHead><TableHead>Proyecto</TableHead><TableHead>Estado</TableHead><TableHead>Nº serie / ICCID</TableHead></TableRow></TableHeader>
              <TableBody>
                {activos.map((a) => {
                  const proyecto = Array.isArray(a.proyectos) ? a.proyectos[0] : a.proyectos;
                  return (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.codigo}</TableCell>
                      <TableCell>{tipoLabels[a.tipo] ?? a.tipo}</TableCell>
                      <TableCell>{proyecto?.nombre ?? "-"}</TableCell>
                      <TableCell><Badge variant={estadoVariant[a.estado] ?? "secondary"}>{a.estado}</Badge></TableCell>
                      <TableCell>{a.numero_serie || a.iccid || "-"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
