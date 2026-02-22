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
  Video, Search, X, ExternalLink, Users, Clock, CalendarDays,
  ChevronDown, ChevronUp, CheckCircle2, Circle, User, Mail,
  FileText,
} from "lucide-react";
import { useReuniones, useParticipantes } from "@/hooks/use-reuniones";
import { useLocale } from "@/contexts/locale-context";
import type { Reunion } from "@/services/reuniones";

function formatDuration(min: number): string {
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReunionesPage() {
  const { tp } = useLocale();
  const { data: reuniones, isLoading } = useReuniones();
  const [search, setSearch] = useState("");
  const [viewingId, setViewingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!reuniones) return [];
    if (!search.trim()) return reuniones;
    const q = search.toLowerCase();
    return reuniones.filter((r) => {
      const lead = r.leads;
      return (
        r.titulo?.toLowerCase().includes(q) ||
        r.titulo_calendario?.toLowerCase().includes(q) ||
        lead?.nombre?.toLowerCase().includes(q) ||
        lead?.empresa?.toLowerCase().includes(q) ||
        lead?.codigo?.toLowerCase().includes(q)
      );
    });
  }, [reuniones, search]);

  const viewing = viewingId ? filtered.find((r) => r.id === viewingId) ?? null : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Video className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{tp.reunionesTitle}</h1>
            <p className="text-xs text-muted-foreground">{tp.reunionesSubtitle}</p>
          </div>
        </div>
        {reuniones && reuniones.length > 0 && (
          <Badge variant="secondary" className="text-sm tabular-nums gap-1">
            <Video className="h-3.5 w-3.5" />
            {reuniones.length}
          </Badge>
        )}
      </div>

      {/* Search */}
      {reuniones && reuniones.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, lead, código..."
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
          reuniones && reuniones.length > 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Sin resultados</div>
          ) : (
            <div className="p-6">
              <EmptyState
                icon={Video}
                title="No hay reuniones"
                description="Las reuniones se registran automáticamente cuando Fathom envía el webhook tras cada meeting."
              />
            </div>
          )
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/30">
                  <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground/70">Fecha</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground/70">Reunión</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground/70">Lead</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground/70 text-center">Duración</TableHead>
                  <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground/70 text-center">Resumen</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => {
                  const lead = r.leads;
                  return (
                    <TableRow
                      key={r.id}
                      className="border-border/20 hover:bg-accent/30 transition-colors cursor-pointer"
                      onClick={() => setViewingId(r.id)}
                    >
                      <TableCell className="py-3">
                        <div className="text-xs tabular-nums text-muted-foreground">
                          {formatDate(r.fecha_reunion)}
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <p className="font-medium text-sm truncate max-w-[280px]">
                          {r.titulo || r.titulo_calendario || "Sin título"}
                        </p>
                        {r.titulo_calendario && r.titulo !== r.titulo_calendario && (
                          <p className="text-[11px] text-muted-foreground/60 truncate max-w-[280px]">
                            {r.titulo_calendario}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="py-3">
                        {lead ? (
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] text-primary/70">{lead.codigo}</span>
                              <span className="text-sm">{lead.nombre}</span>
                            </div>
                            {lead.empresa && (
                              <p className="text-[11px] text-muted-foreground/60">{lead.empresa}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/40">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {formatDuration(r.duracion_min)}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        {r.resumen_md ? (
                          <Badge variant="secondary" className="text-[9px] gap-0.5">
                            <FileText className="h-2.5 w-2.5" />AI
                          </Badge>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/40">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-3">
                        {r.fathom_url && (
                          <Button
                            variant="ghost" size="sm" className="h-7 gap-1 text-xs"
                            asChild onClick={(e) => e.stopPropagation()}
                          >
                            <a href={r.fathom_url} target="_blank" rel="noopener noreferrer">
                              Fathom<ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
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
          <div className="border-t border-border/20 px-4 py-2.5 text-[11px] text-muted-foreground/60">
            {filtered.length} reunión{filtered.length !== 1 ? "es" : ""}
          </div>
        )}
      </div>

      {/* Detail dialog */}
      <Dialog open={!!viewingId} onOpenChange={(open) => { if (!open) setViewingId(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          {viewing && <ReunionDetail reunion={viewing} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReunionDetail({ reunion: r }: { reunion: Reunion }) {
  const { data: participantes } = useParticipantes(r.id);
  const [showTranscript, setShowTranscript] = useState(false);
  const lead = r.leads;
  const transcript = r.transcripcion as Reunion["transcripcion"];
  const actions = r.action_items as Reunion["action_items"];

  return (
    <div className="divide-y divide-border/30">
      {/* Header */}
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <h2 className="text-lg font-semibold leading-tight">
              {r.titulo || r.titulo_calendario || "Reunión"}
            </h2>
            {r.titulo_calendario && r.titulo !== r.titulo_calendario && (
              <p className="text-xs text-muted-foreground">{r.titulo_calendario}</p>
            )}
          </div>
          <div className="flex gap-1.5 shrink-0">
            {r.fathom_url && (
              <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" asChild>
                <a href={r.fathom_url} target="_blank" rel="noopener noreferrer">
                  <Video className="h-3 w-3" />Fathom
                </a>
              </Button>
            )}
            {r.share_url && (
              <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" asChild>
                <a href={r.share_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3" />Compartir
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {formatDateTime(r.fecha_reunion)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(r.duracion_min)}
          </span>
          {r.idioma && (
            <Badge variant="outline" className="text-[9px] uppercase">{r.idioma}</Badge>
          )}
        </div>

        {/* Lead principal */}
        {lead && (
          <div className="rounded-lg border border-border/40 p-3 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="font-mono text-[10px] text-primary/80">{lead.codigo}</Badge>
                <span className="font-medium text-sm">{lead.nombre}</span>
              </div>
              {lead.empresa && <p className="text-xs text-muted-foreground">{lead.empresa}</p>}
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" asChild>
              <Link to={`/dashboard/leads`}>
                Ver lead<ExternalLink className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Participants */}
      {participantes && participantes.length > 0 && (
        <div className="p-5 space-y-2">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Users className="h-3 w-3" />Participantes
            <Badge variant="secondary" className="text-[9px] ml-1">{participantes.length}</Badge>
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {participantes.map((p) => (
              <div key={p.id} className="flex items-center gap-2 rounded-lg border border-border/30 px-3 py-2">
                <div className={`h-2 w-2 rounded-full shrink-0 ${p.es_externo ? "bg-blue-500" : "bg-muted-foreground/40"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{p.nombre || p.email || "—"}</p>
                  <div className="flex items-center gap-1.5">
                    {p.email && (
                      <span className="text-[10px] text-muted-foreground truncate flex items-center gap-0.5">
                        <Mail className="h-2.5 w-2.5" />{p.email}
                      </span>
                    )}
                  </div>
                </div>
                {p.leads && (
                  <Badge variant="outline" className="font-mono text-[9px] shrink-0">{p.leads.codigo}</Badge>
                )}
                {!p.es_externo && (
                  <Badge variant="secondary" className="text-[9px] shrink-0">Interno</Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {r.resumen_md && (
        <div className="p-5 space-y-2">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <FileText className="h-3 w-3" />Resumen AI
          </h3>
          <div className="rounded-lg border border-border/40 bg-card/50 p-4 prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
            {r.resumen_md}
          </div>
        </div>
      )}

      {/* Action items */}
      {actions && actions.length > 0 && (
        <div className="p-5 space-y-2">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Action Items ({actions.length})
          </h3>
          <div className="space-y-1.5">
            {actions.map((a, i) => (
              <div key={i} className="flex items-start gap-2 rounded-lg border border-border/30 px-3 py-2">
                {a.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${a.completed ? "line-through text-muted-foreground" : ""}`}>
                    {a.description}
                  </p>
                  {a.assignee?.name && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">→ {a.assignee.name}</p>
                  )}
                </div>
                {a.recording_playback_url && (
                  <a
                    href={a.recording_playback_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-primary hover:underline shrink-0"
                  >
                    {a.recording_timestamp}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transcript */}
      {transcript && transcript.length > 0 && (
        <div className="p-5 space-y-2">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            Transcripción ({transcript.length} segmentos)
            {showTranscript ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {showTranscript && (
            <div className="rounded-lg border border-border/40 bg-card/50 p-4 max-h-[400px] overflow-y-auto space-y-3">
              {transcript.map((t, i) => (
                <div key={i} className="flex gap-3">
                  <div className="shrink-0 w-[60px]">
                    <span className="font-mono text-[10px] text-muted-foreground/60">{t.timestamp}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-semibold text-primary/70">{t.speaker.display_name}</span>
                    <p className="text-sm text-foreground/80 mt-0.5">{t.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
