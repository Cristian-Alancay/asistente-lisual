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
import { useOperacionesStats, useProyectos, useClientes, useCreateProyecto } from "@/hooks/use-operaciones";
import { useAuth } from "@/contexts/auth-context";
import { Plus, FolderKanban } from "lucide-react";
import { useLocale } from "@/contexts/locale-context";

const estadoVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  pendiente: "secondary", programada: "default", en_proceso: "outline", completada: "outline", atrasada: "destructive",
};

function StatsCards() {
  const { data: stats, isLoading } = useOperacionesStats();
  if (isLoading) return <Skeleton className="h-24" />;
  const s = stats ?? { instalacionesProximos7Dias: 0, instalacionesPendientes: 0, equiposEnDistribucion: 0 };
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Próximas 7 días</CardTitle><Badge variant="secondary">Instalaciones</Badge></CardHeader>
        <CardContent><div className="text-2xl font-bold">{s.instalacionesProximos7Dias}</div><p className="text-xs text-muted-foreground">Programadas</p></CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Pendientes</CardTitle><Badge variant="outline">Instalaciones</Badge></CardHeader>
        <CardContent><div className="text-2xl font-bold">{s.instalacionesPendientes}</div><p className="text-xs text-muted-foreground">Por completar</p></CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Equipos en distribución</CardTitle><Badge variant="secondary">Stock</Badge></CardHeader>
        <CardContent><div className="text-2xl font-bold">{s.equiposEnDistribucion}</div><p className="text-xs text-muted-foreground">En tránsito</p></CardContent>
      </Card>
    </div>
  );
}

function ProyectoCreateDialog() {
  const { canEdit } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clienteId, setClienteId] = useState("");
  const { data: clientes } = useClientes();
  const createProyecto = useCreateProyecto();
  const navigate = useNavigate();

  if (!canEdit) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null); setLoading(true);
    const form = e.currentTarget;
    const nombre = (form.elements.namedItem("nombre") as HTMLInputElement)?.value;
    const direccion = (form.elements.namedItem("direccion") as HTMLInputElement)?.value;
    const contacto_sitio = (form.elements.namedItem("contacto_sitio") as HTMLInputElement)?.value;
    const telefono_sitio = (form.elements.namedItem("telefono_sitio") as HTMLInputElement)?.value;
    const fecha_instalacion_programada = (form.elements.namedItem("fecha_instalacion_programada") as HTMLInputElement)?.value;
    if (!clienteId || !nombre) { setError("Cliente y nombre son requeridos"); setLoading(false); return; }
    try {
      await createProyecto.mutateAsync({ cliente_id: clienteId, nombre, direccion: direccion || undefined, contacto_sitio: contacto_sitio || undefined, telefono_sitio: telefono_sitio || undefined, fecha_instalacion_programada: fecha_instalacion_programada || undefined });
      setOpen(false); setClienteId(""); form.reset();
      void navigate(0);
    } catch (err) { setError(err instanceof Error ? err.message : "Error al crear proyecto"); }
    finally { setLoading(false); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Nuevo Proyecto</Button></DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Nuevo Proyecto</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="cliente_id">Cliente *</Label>
            <Select value={clienteId} onValueChange={setClienteId}>
              <SelectTrigger id="cliente_id"><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
              <SelectContent>
                {(clientes ?? []).map((c) => {
                  const lead = Array.isArray(c.leads) ? c.leads[0] : c.leads;
                  const label = lead ? `${lead.nombre}${lead.empresa ? ` (${lead.empresa})` : ""}` : c.id;
                  return <SelectItem key={c.id} value={c.id}>{label}</SelectItem>;
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label htmlFor="nombre">Nombre del proyecto *</Label><Input id="nombre" name="nombre" placeholder="Instalación Oficina Centro" required /></div>
          <div className="space-y-2"><Label htmlFor="direccion">Dirección</Label><Input id="direccion" name="direccion" placeholder="Calle, número, ciudad" /></div>
          <div className="space-y-2"><Label htmlFor="contacto_sitio">Contacto en sitio</Label><Input id="contacto_sitio" name="contacto_sitio" /></div>
          <div className="space-y-2"><Label htmlFor="telefono_sitio">Teléfono sitio</Label><Input id="telefono_sitio" name="telefono_sitio" /></div>
          <div className="space-y-2"><Label htmlFor="fecha_instalacion_programada">Fecha instalación programada</Label><Input id="fecha_instalacion_programada" name="fecha_instalacion_programada" type="date" /></div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? "Creando..." : "Crear"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function OperacionesPage() {
  const { tp } = useLocale();
  const { data: proyectos, isLoading, isError } = useProyectos();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{tp.operationsTitle}</h1>
          <p className="text-muted-foreground">{tp.operationsSubtitle}</p>
        </div>
        <ProyectoCreateDialog />
      </div>
      <StatsCards />
      <Card>
        <CardHeader>
          <CardTitle>Proyectos</CardTitle>
          <CardDescription>Proyectos de instalación por cliente. <Link to="/dashboard/instalaciones" className="text-primary hover:underline">Ver instalaciones pendientes</Link></CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : isError ? (
            <p className="text-sm text-destructive py-4">Error al cargar proyectos.</p>
          ) : !proyectos || proyectos.length === 0 ? (
            <EmptyState icon={FolderKanban} title="Sin proyectos" description="Crea un cliente primero y luego crea un proyecto." action={{ label: "Ver operaciones", href: "/dashboard/operaciones" }} />
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Proyecto</TableHead><TableHead>Cliente</TableHead><TableHead>Fecha programada</TableHead><TableHead>Estado</TableHead><TableHead></TableHead></TableRow></TableHeader>
              <TableBody>
                {proyectos.map((p) => {
                  const cliente = Array.isArray(p.clientes) ? p.clientes[0] : p.clientes;
                  const lead = cliente?.leads;
                  const clienteNombre = lead ? (Array.isArray(lead) ? lead[0]?.nombre : lead.nombre) : "-";
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.nombre}</TableCell>
                      <TableCell>{clienteNombre}</TableCell>
                      <TableCell>{p.fecha_instalacion_programada ? new Date(p.fecha_instalacion_programada).toLocaleDateString("es-AR") : "-"}</TableCell>
                      <TableCell><Badge variant={estadoVariant[p.estado] ?? "secondary"}>{p.estado}</Badge></TableCell>
                      <TableCell><Link to={`/dashboard/instalaciones?proyecto=${p.id}`} className="text-sm text-primary hover:underline">Ver instalación</Link></TableCell>
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
