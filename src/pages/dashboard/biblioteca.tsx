import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BookOpen,
  Plus,
  Search,
  X,
  Star,
  Globe,
  Instagram,
  Play,
  ExternalLink,
  Copy,
  MessageCircle,
  Pencil,
  Trash2,
  Building2,
  Shield,
  TrendingUp,
  Eye,
  Camera,
  Video,
  HardHat,
  Megaphone,
} from "lucide-react";
import {
  useCasosExito,
  useCreateCasoExito,
  useUpdateCasoExito,
  useDeleteCasoExito,
} from "@/hooks/use-biblioteca";
import type { CasoExito, CasoExitoInsert } from "@/services/biblioteca";

const PAISES = ["Argentina", "Paraguay", "Uruguay", "Chile", "Otro"];

const TIPOS_PROYECTO: Record<string, string> = {
  vivienda_unifamiliar: "Vivienda unifamiliar",
  edificio_residencial: "Edificio residencial",
  barrio_privado: "Barrio privado",
  parque_industrial: "Parque industrial",
  nave_industrial: "Nave industrial",
  obra_publica: "Obra pública",
  centro_comercial: "Centro comercial",
  reforma: "Reforma / remodelación",
  loteo: "Loteo",
  urbanizacion: "Urbanización",
  otro: "Otro",
};

const PERFILES: Record<string, string> = {
  constructora_grande: "Constructora grande",
  pyme: "PyME",
  desarrolladora: "Desarrolladora",
  arquitecto: "Arquitecto independiente",
  otro: "Otro",
};

const PROBLEMAS_OPTIONS = [
  "Falta de visibilidad remota",
  "Robos",
  "Desorden en obra",
  "Falta de contenido marketing",
  "Control de avances",
  "Reclamos de inversores",
  "Control de personal",
];

const SOLUCIONES_OPTIONS = [
  "Cámara fija",
  "Cámara móvil",
  "Casco 4G",
  "Sistema anti robo",
  "Time-lapse",
  "Streaming inversores",
  "Integración marketing",
];

const RESULTADOS_OPTIONS = [
  "Reducción de robos",
  "Ahorro en visitas a obra",
  "Mejora comunicación inversores",
  "Más ventas por contenido",
  "Pruebas legales / evidencia",
  "Profesionalización imagen",
];

const NIVELES: Record<string, string> = { bajo: "Bajo", medio: "Medio", alto: "Alto" };

function problemIcon(problem: string) {
  if (problem.includes("Robo") || problem.includes("anti robo")) return Shield;
  if (problem.includes("marketing") || problem.includes("contenido")) return Megaphone;
  if (problem.includes("visibilidad") || problem.includes("Control")) return Eye;
  if (problem.includes("inversores")) return TrendingUp;
  return Building2;
}

function solutionIcon(sol: string) {
  if (sol.includes("Casco")) return HardHat;
  if (sol.includes("Time-lapse") || sol.includes("Streaming")) return Video;
  if (sol.includes("Cámara")) return Camera;
  return Shield;
}

function MultiSelect({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1">
        {value.map((v) => (
          <Badge key={v} variant="secondary" className="gap-1 text-[10px]">
            {v}
            <button onClick={() => onChange(value.filter((x) => x !== v))} className="ml-0.5 hover:text-destructive">
              <X className="h-2.5 w-2.5" />
            </button>
          </Badge>
        ))}
      </div>
      <Select onValueChange={(v) => { if (!value.includes(v)) onChange([...value, v]); }}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.filter((o) => !value.includes(o)).map((o) => (
            <SelectItem key={o} value={o}>{o}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

const EMPTY_FORM: Omit<CasoExitoInsert, "activo"> = {
  nombre_proyecto: "",
  empresa: "",
  pais: "Argentina",
  ciudad: null,
  tipo_proyecto: "edificio_residencial",
  tamano_obra: null,
  duracion_estimada: null,
  perfil_cliente: "pyme",
  etapa_cliente: "decision",
  nivel_presupuesto: "medio",
  problemas: [],
  soluciones: [],
  resultados: [],
  metricas: null,
  link_instagram: null,
  link_reel: null,
  link_post: null,
  link_drive: null,
  link_timelapse: null,
  imagen_url: null,
  objecion_responde: null,
  frase_gancho: null,
  mensaje_whatsapp: null,
  script_reunion: null,
  momento_ideal: null,
  destacado: false,
};

export default function BibliotecaPage() {
  const { data: casos, isLoading } = useCasosExito();
  const createMutation = useCreateCasoExito();
  const updateMutation = useUpdateCasoExito();
  const deleteMutation = useDeleteCasoExito();

  const [search, setSearch] = useState("");
  const [filterPais, setFilterPais] = useState("all");
  const [filterTipo, setFilterTipo] = useState("all");
  const [filterPerfil, setFilterPerfil] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [viewId, setViewId] = useState<string | null>(null);
  const viewCaso = viewId ? casos?.find((c) => c.id === viewId) ?? null : null;

  const filtered = useMemo(() => {
    if (!casos) return [];
    let result = casos;
    if (filterPais !== "all") result = result.filter((c) => c.pais === filterPais);
    if (filterTipo !== "all") result = result.filter((c) => c.tipo_proyecto === filterTipo);
    if (filterPerfil !== "all") result = result.filter((c) => c.perfil_cliente === filterPerfil);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.nombre_proyecto.toLowerCase().includes(q) ||
          c.empresa.toLowerCase().includes(q) ||
          c.pais.toLowerCase().includes(q) ||
          c.frase_gancho?.toLowerCase().includes(q) ||
          c.problemas.some((p) => p.toLowerCase().includes(q)) ||
          c.soluciones.some((s) => s.toLowerCase().includes(q)),
      );
    }
    return result;
  }, [casos, filterPais, filterTipo, filterPerfil, search]);

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormOpen(true);
  }

  function openEdit(c: CasoExito) {
    setForm({
      nombre_proyecto: c.nombre_proyecto,
      empresa: c.empresa,
      pais: c.pais,
      ciudad: c.ciudad,
      tipo_proyecto: c.tipo_proyecto,
      tamano_obra: c.tamano_obra,
      duracion_estimada: c.duracion_estimada,
      perfil_cliente: c.perfil_cliente,
      etapa_cliente: c.etapa_cliente,
      nivel_presupuesto: c.nivel_presupuesto,
      problemas: c.problemas,
      soluciones: c.soluciones,
      resultados: c.resultados,
      metricas: c.metricas,
      link_instagram: c.link_instagram,
      link_reel: c.link_reel,
      link_post: c.link_post,
      link_drive: c.link_drive,
      link_timelapse: c.link_timelapse,
      imagen_url: c.imagen_url,
      objecion_responde: c.objecion_responde,
      frase_gancho: c.frase_gancho,
      mensaje_whatsapp: c.mensaje_whatsapp,
      script_reunion: c.script_reunion,
      momento_ideal: c.momento_ideal,
      destacado: c.destacado,
    });
    setEditingId(c.id);
    setFormOpen(true);
  }

  async function handleSubmit() {
    if (!form.nombre_proyecto.trim() || !form.empresa.trim()) {
      toast.error("Nombre del proyecto y empresa son obligatorios");
      return;
    }
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, data: form });
    } else {
      await createMutation.mutateAsync({ ...form, activo: true });
    }
    setFormOpen(false);
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado`);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Biblioteca Comercial</h1>
            <p className="text-xs text-muted-foreground">Casos de éxito y material de ventas</p>
          </div>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Nuevo caso
        </Button>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por proyecto, empresa, problema..."
              className="h-8 text-sm"
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
          <Select value={filterPais} onValueChange={setFilterPais}>
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <Globe className="h-3 w-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los países</SelectItem>
              {PAISES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterTipo} onValueChange={setFilterTipo}>
            <SelectTrigger className="h-8 w-[160px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo tipo de obra</SelectItem>
              {Object.entries(TIPOS_PROYECTO).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterPerfil} onValueChange={setFilterPerfil}>
            <SelectTrigger className="h-8 w-[160px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo perfil</SelectItem>
              {Object.entries(PERFILES).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(filterPais !== "all" || filterTipo !== "all" || filterPerfil !== "all") && (
            <button
              onClick={() => { setFilterPais("all"); setFilterTipo("all"); setFilterPerfil("all"); }}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
        {filtered.length > 0 && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            {filtered.length} caso{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Cards grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-60 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-sm text-muted-foreground">
            {search || filterPais !== "all" || filterTipo !== "all"
              ? "Sin resultados para estos filtros"
              : "No hay casos de éxito aún. Creá el primero."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => setViewId(c.id)}
              className="group relative cursor-pointer rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
            >
              {c.destacado && (
                <div className="absolute top-2 right-2 z-10">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                </div>
              )}

              {c.imagen_url ? (
                <div className="h-32 bg-muted/30 overflow-hidden">
                  <img src={c.imagen_url} alt={c.nombre_proyecto} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="h-20 bg-linear-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-primary/20" />
                </div>
              )}

              <div className="p-4 space-y-2.5">
                <div>
                  <h3 className="font-semibold text-sm line-clamp-1">{c.nombre_proyecto}</h3>
                  <p className="text-xs text-muted-foreground">{c.empresa} — {c.pais}</p>
                </div>

                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-[9px]">
                    {TIPOS_PROYECTO[c.tipo_proyecto] ?? c.tipo_proyecto}
                  </Badge>
                  <Badge variant="secondary" className="text-[9px]">
                    {PERFILES[c.perfil_cliente] ?? c.perfil_cliente}
                  </Badge>
                </div>

                {c.problemas.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {c.problemas.slice(0, 3).map((p) => {
                      const Icon = problemIcon(p);
                      return (
                        <span key={p} className="inline-flex items-center gap-0.5 rounded bg-red-500/10 px-1.5 py-0.5 text-[9px] text-red-600">
                          <Icon className="h-2.5 w-2.5" />{p}
                        </span>
                      );
                    })}
                    {c.problemas.length > 3 && (
                      <span className="text-[9px] text-muted-foreground">+{c.problemas.length - 3}</span>
                    )}
                  </div>
                )}

                {c.soluciones.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {c.soluciones.slice(0, 3).map((s) => {
                      const Icon = solutionIcon(s);
                      return (
                        <span key={s} className="inline-flex items-center gap-0.5 rounded bg-green-500/10 px-1.5 py-0.5 text-[9px] text-green-600">
                          <Icon className="h-2.5 w-2.5" />{s}
                        </span>
                      );
                    })}
                  </div>
                )}

                {c.frase_gancho && (
                  <p className="text-[11px] italic text-muted-foreground line-clamp-2">
                    "{c.frase_gancho}"
                  </p>
                )}

                {/* Quick links */}
                <div className="flex items-center gap-1.5 pt-1 border-t border-border/30">
                  {c.link_instagram && (
                    <a href={c.link_instagram} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-muted-foreground hover:text-pink-500 transition-colors">
                      <Instagram className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {c.link_reel && (
                    <a href={c.link_reel} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-muted-foreground hover:text-purple-500 transition-colors">
                      <Play className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {c.link_timelapse && (
                    <a href={c.link_timelapse} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-muted-foreground hover:text-blue-500 transition-colors">
                      <Video className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {c.link_drive && (
                    <a href={c.link_drive} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-muted-foreground hover:text-green-500 transition-colors">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {c.mensaje_whatsapp && (
                    <button
                      onClick={(e) => { e.stopPropagation(); copyToClipboard(c.mensaje_whatsapp!, "Mensaje WhatsApp"); }}
                      className="text-muted-foreground hover:text-green-600 transition-colors"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <div className="flex-1" />
                  {c.momento_ideal && (
                    <span className="text-[9px] text-muted-foreground/60 truncate max-w-[120px]">
                      {c.momento_ideal}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!viewId} onOpenChange={(open) => { if (!open) setViewId(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          {viewCaso && (
            <CasoDetail
              caso={viewCaso}
              onEdit={() => { setViewId(null); openEdit(viewCaso); }}
              onDelete={async () => {
                if (confirm("¿Eliminar este caso de éxito?")) {
                  await deleteMutation.mutateAsync(viewCaso.id);
                  setViewId(null);
                }
              }}
              onCopy={copyToClipboard}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit form dialog */}
      <Dialog open={formOpen} onOpenChange={(open) => { if (!open) setFormOpen(false); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar caso de éxito" : "Nuevo caso de éxito"}</DialogTitle>
          </DialogHeader>
          <CasoForm
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
            onCancel={() => setFormOpen(false)}
            isPending={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CasoDetail({
  caso: c,
  onEdit,
  onDelete,
  onCopy,
}: {
  caso: CasoExito;
  onEdit: () => void;
  onDelete: () => void;
  onCopy: (text: string, label: string) => void;
}) {
  return (
    <>
      {c.imagen_url && (
        <div className="h-48 bg-muted/30 overflow-hidden">
          <img src={c.imagen_url} alt={c.nombre_proyecto} className="h-full w-full object-cover" />
        </div>
      )}

      <div className="px-6 py-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">{c.nombre_proyecto}</h2>
              {c.destacado && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
            </div>
            <p className="text-sm text-muted-foreground">{c.empresa} — {c.ciudad ? `${c.ciudad}, ` : ""}{c.pais}</p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={onEdit}>
              <Pencil className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7 text-destructive" onClick={onDelete}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Classification badges */}
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline">{TIPOS_PROYECTO[c.tipo_proyecto] ?? c.tipo_proyecto}</Badge>
          <Badge variant="secondary">{PERFILES[c.perfil_cliente] ?? c.perfil_cliente}</Badge>
          {c.nivel_presupuesto && <Badge variant="secondary">{NIVELES[c.nivel_presupuesto] ?? c.nivel_presupuesto}</Badge>}
          {c.tamano_obra && <Badge variant="outline" className="text-[10px]">{c.tamano_obra}</Badge>}
        </div>

        {/* Problems & Solutions side by side */}
        <div className="grid grid-cols-2 gap-4">
          {c.problemas.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-red-500/70">Problemas</h4>
              <div className="space-y-1">
                {c.problemas.map((p) => {
                  const Icon = problemIcon(p);
                  return (
                    <div key={p} className="flex items-center gap-1.5 text-xs">
                      <Icon className="h-3 w-3 text-red-500/60 shrink-0" />
                      <span>{p}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {c.soluciones.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-green-500/70">Soluciones</h4>
              <div className="space-y-1">
                {c.soluciones.map((s) => {
                  const Icon = solutionIcon(s);
                  return (
                    <div key={s} className="flex items-center gap-1.5 text-xs">
                      <Icon className="h-3 w-3 text-green-500/60 shrink-0" />
                      <span>{s}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {c.resultados.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-blue-500/70">Resultados</h4>
            <div className="flex flex-wrap gap-1.5">
              {c.resultados.map((r) => (
                <Badge key={r} variant="outline" className="text-[10px] border-blue-500/30 text-blue-600">{r}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Sales hook */}
        {c.frase_gancho && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-1">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-amber-600/70">Frase gancho</h4>
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm italic">"{c.frase_gancho}"</p>
              <button onClick={() => onCopy(c.frase_gancho!, "Frase")} className="shrink-0 text-muted-foreground hover:text-foreground">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Objection & Moment */}
        {(c.objecion_responde || c.momento_ideal) && (
          <div className="grid grid-cols-2 gap-3">
            {c.objecion_responde && (
              <div className="rounded-lg border border-border/40 p-3">
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1">Objeción que responde</h4>
                <p className="text-xs">{c.objecion_responde}</p>
              </div>
            )}
            {c.momento_ideal && (
              <div className="rounded-lg border border-border/40 p-3">
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1">Momento ideal</h4>
                <p className="text-xs">{c.momento_ideal}</p>
              </div>
            )}
          </div>
        )}

        {/* WhatsApp message */}
        {c.mensaje_whatsapp && (
          <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-green-600/70">Mensaje WhatsApp listo</h4>
              <button
                onClick={() => onCopy(c.mensaje_whatsapp!, "Mensaje WhatsApp")}
                className="flex items-center gap-1 text-[10px] text-green-600 hover:text-green-700"
              >
                <Copy className="h-3 w-3" />Copiar
              </button>
            </div>
            <p className="text-xs whitespace-pre-wrap">{c.mensaje_whatsapp}</p>
          </div>
        )}

        {/* Script reunión */}
        {c.script_reunion && (
          <div className="rounded-lg border border-border/40 p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Script de reunión</h4>
              <button onClick={() => onCopy(c.script_reunion!, "Script")} className="text-muted-foreground hover:text-foreground">
                <Copy className="h-3 w-3" />
              </button>
            </div>
            <p className="text-xs whitespace-pre-wrap">{c.script_reunion}</p>
          </div>
        )}

        {/* Content links */}
        {(c.link_instagram || c.link_reel || c.link_post || c.link_drive || c.link_timelapse) && (
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Contenido</h4>
            <div className="flex flex-wrap gap-2">
              {c.link_instagram && (
                <a href={c.link_instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg border border-border/40 px-3 py-1.5 text-xs transition-colors hover:bg-accent/30">
                  <Instagram className="h-3.5 w-3.5 text-pink-500" />Instagram
                </a>
              )}
              {c.link_reel && (
                <a href={c.link_reel} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg border border-border/40 px-3 py-1.5 text-xs transition-colors hover:bg-accent/30">
                  <Play className="h-3.5 w-3.5 text-purple-500" />Reel
                </a>
              )}
              {c.link_timelapse && (
                <a href={c.link_timelapse} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg border border-border/40 px-3 py-1.5 text-xs transition-colors hover:bg-accent/30">
                  <Video className="h-3.5 w-3.5 text-blue-500" />Timelapse
                </a>
              )}
              {c.link_post && (
                <a href={c.link_post} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg border border-border/40 px-3 py-1.5 text-xs transition-colors hover:bg-accent/30">
                  <ExternalLink className="h-3.5 w-3.5" />Post
                </a>
              )}
              {c.link_drive && (
                <a href={c.link_drive} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg border border-border/40 px-3 py-1.5 text-xs transition-colors hover:bg-accent/30">
                  <ExternalLink className="h-3.5 w-3.5 text-green-500" />Drive
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function CasoForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  isPending,
}: {
  form: Omit<CasoExitoInsert, "activo">;
  setForm: React.Dispatch<React.SetStateAction<typeof form>>;
  onSubmit: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const set = <K extends keyof typeof form>(key: K, val: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="space-y-5">
      {/* Basic info */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Información general</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Proyecto *</label>
            <Input value={form.nombre_proyecto} onChange={(e) => set("nombre_proyecto", e.target.value)} className="h-8 text-sm" placeholder="Ej: Torre Nordelta" />
          </div>
          <div>
            <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Empresa *</label>
            <Input value={form.empresa} onChange={(e) => set("empresa", e.target.value)} className="h-8 text-sm" placeholder="Ej: Constructora XYZ" />
          </div>
          <div>
            <label className="text-[10px] font-medium text-muted-foreground mb-1 block">País</label>
            <Select value={form.pais} onValueChange={(v) => set("pais", v)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAISES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Ciudad</label>
            <Input value={form.ciudad ?? ""} onChange={(e) => set("ciudad", e.target.value || null)} className="h-8 text-sm" placeholder="Ej: Buenos Aires" />
          </div>
          <div>
            <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Tipo de proyecto</label>
            <Select value={form.tipo_proyecto} onValueChange={(v) => set("tipo_proyecto", v)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(TIPOS_PROYECTO).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Perfil cliente</label>
            <Select value={form.perfil_cliente} onValueChange={(v) => set("perfil_cliente", v)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(PERFILES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Nivel presupuesto</label>
            <Select value={form.nivel_presupuesto ?? "medio"} onValueChange={(v) => set("nivel_presupuesto", v)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(NIVELES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Tamaño obra</label>
            <Input value={form.tamano_obra ?? ""} onChange={(e) => set("tamano_obra", e.target.value || null)} className="h-8 text-sm" placeholder="Ej: 5.000 m²" />
          </div>
        </div>
      </div>

      {/* Multi-selects */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Clasificación</h4>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Problemas del cliente</label>
            <MultiSelect options={PROBLEMAS_OPTIONS} value={form.problemas} onChange={(v) => set("problemas", v)} placeholder="Agregar problema..." />
          </div>
          <div>
            <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Soluciones implementadas</label>
            <MultiSelect options={SOLUCIONES_OPTIONS} value={form.soluciones} onChange={(v) => set("soluciones", v)} placeholder="Agregar solución..." />
          </div>
          <div>
            <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Resultados obtenidos</label>
            <MultiSelect options={RESULTADOS_OPTIONS} value={form.resultados} onChange={(v) => set("resultados", v)} placeholder="Agregar resultado..." />
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contenido / Links</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Instagram</label>
            <Input value={form.link_instagram ?? ""} onChange={(e) => set("link_instagram", e.target.value || null)} className="h-8 text-sm" placeholder="https://instagram.com/..." />
          </div>
          <div>
            <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Reel</label>
            <Input value={form.link_reel ?? ""} onChange={(e) => set("link_reel", e.target.value || null)} className="h-8 text-sm" placeholder="https://..." />
          </div>
          <div>
            <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Timelapse</label>
            <Input value={form.link_timelapse ?? ""} onChange={(e) => set("link_timelapse", e.target.value || null)} className="h-8 text-sm" placeholder="https://..." />
          </div>
          <div>
            <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Drive</label>
            <Input value={form.link_drive ?? ""} onChange={(e) => set("link_drive", e.target.value || null)} className="h-8 text-sm" placeholder="https://drive.google.com/..." />
          </div>
          <div>
            <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Imagen / Miniatura URL</label>
            <Input value={form.imagen_url ?? ""} onChange={(e) => set("imagen_url", e.target.value || null)} className="h-8 text-sm" placeholder="https://..." />
          </div>
        </div>
      </div>

      {/* Sales material */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Material de ventas</h4>
        <div>
          <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Frase gancho</label>
          <Input value={form.frase_gancho ?? ""} onChange={(e) => set("frase_gancho", e.target.value || null)} className="h-8 text-sm" placeholder="Una frase corta para enganchar al cliente" />
        </div>
        <div>
          <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Objeción que responde</label>
          <Input value={form.objecion_responde ?? ""} onChange={(e) => set("objecion_responde", e.target.value || null)} className="h-8 text-sm" placeholder='Ej: "Es caro", "Ya tengo cámaras"' />
        </div>
        <div>
          <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Momento ideal para enviar</label>
          <Input value={form.momento_ideal ?? ""} onChange={(e) => set("momento_ideal", e.target.value || null)} className="h-8 text-sm" placeholder="Ej: Cuando preguntan precio" />
        </div>
        <div>
          <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Mensaje WhatsApp listo</label>
          <Textarea value={form.mensaje_whatsapp ?? ""} onChange={(e) => set("mensaje_whatsapp", e.target.value || null)} className="text-sm min-h-[60px]" placeholder="Mensaje para copiar y pegar en WhatsApp" />
        </div>
        <div>
          <label className="text-[10px] font-medium text-muted-foreground mb-1 block">Script de reunión</label>
          <Textarea value={form.script_reunion ?? ""} onChange={(e) => set("script_reunion", e.target.value || null)} className="text-sm min-h-[60px]" placeholder="Cómo contar este caso en reunión" />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.destacado} onChange={(e) => set("destacado", e.target.checked)} className="rounded" />
          <span className="text-xs font-medium">Caso destacado</span>
          <Star className="h-3 w-3 text-amber-400" />
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/30">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button size="sm" onClick={onSubmit} disabled={isPending}>
          {isPending ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </div>
  );
}
