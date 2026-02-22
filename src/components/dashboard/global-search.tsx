import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { searchGlobal } from "@/services/search";
import type { SearchResult } from "@/types/entities";
import { User, Building2, FileText, FolderKanban, ClipboardList, Calendar, StickyNote } from "lucide-react";

const getContexto = (pathname: string): "trabajo" | "personal" =>
  pathname.startsWith("/dashboard/personal") ? "personal" : "trabajo";

export function GlobalSearch() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const contexto = getContexto(pathname ?? "");

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const runSearch = useCallback(
    async (q: string) => {
      if (!q || q.trim().length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const data = await searchGlobal(q, contexto);
        setResults(data);
      } finally {
        setLoading(false);
      }
    },
    [contexto]
  );

  useEffect(() => {
    const t = setTimeout(() => runSearch(query), 200);
    return () => clearTimeout(t);
  }, [query, runSearch]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
        if (!open) {
          setQuery("");
          setResults([]);
        }
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open]);

  const handleSelect = (r: SearchResult) => {
    navigate(r.href);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <span>Buscar...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setQuery("");
        }}
        title="Buscar"
        description={contexto === "personal" ? "Buscar tareas, eventos y notas" : "Buscar leads y clientes"}
        commandProps={{
          shouldFilter: false,
          value: query,
          onValueChange: setQuery,
        }}
      >
        <CommandInput
          placeholder={
            contexto === "personal"
              ? "Buscar tareas, eventos, notas..."
              : "Buscar por nombre, empresa o email..."
          }
        />
        <CommandList>
          <CommandEmpty>
            {loading ? "Buscando..." : query.trim().length < 2 ? "Escribe al menos 2 caracteres" : "Sin resultados"}
          </CommandEmpty>
          {results.length > 0 && (
            <CommandGroup heading="Resultados">
              {results.map((r) => (
                <CommandItem key={`${r.type}-${r.id}`} value={`${r.nombre} ${r.empresa ?? ""}`} onSelect={() => handleSelect(r)}>
                  {r.type === "lead" && <User className="mr-2 h-4 w-4" />}
                  {r.type === "cliente" && <Building2 className="mr-2 h-4 w-4" />}
                  {r.type === "presupuesto" && <FileText className="mr-2 h-4 w-4" />}
                  {r.type === "proyecto" && <FolderKanban className="mr-2 h-4 w-4" />}
                  {r.type === "tarea" && <ClipboardList className="mr-2 h-4 w-4" />}
                  {r.type === "evento" && <Calendar className="mr-2 h-4 w-4" />}
                  {r.type === "nota" && <StickyNote className="mr-2 h-4 w-4" />}
                  <div className="flex flex-col">
                    <span>{r.nombre}</span>
                    {(r.empresa || r.email) && (
                      <span className="text-xs text-muted-foreground">
                        {[r.empresa, r.email].filter(Boolean).join(" · ")}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
