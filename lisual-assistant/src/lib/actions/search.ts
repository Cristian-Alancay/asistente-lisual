"use server";

import { createClient } from "@/lib/supabase/server";

export type SearchResult = {
  id: string;
  type: "lead" | "cliente";
  nombre: string;
  empresa?: string | null;
  email?: string | null;
  href: string;
};

export async function searchGlobal(q: string): Promise<SearchResult[]> {
  if (!q || q.trim().length < 2) return [];

  const term = `%${q.trim()}%`;
  const supabase = await createClient();

  const [leadsNombre, leadsEmpresa, leadsEmail, clientesRes] = await Promise.all([
    supabase.from("leads").select("id, nombre, empresa, email").ilike("nombre", term).limit(5),
    supabase.from("leads").select("id, nombre, empresa, email").ilike("empresa", term).limit(5),
    supabase.from("leads").select("id, nombre, empresa, email").ilike("email", term).limit(5),
    supabase.from("clientes").select("id, leads(nombre, empresa, email)").limit(50),
  ]);

  const leadIds = new Set<string>();
  const results: SearchResult[] = [];

  for (const res of [leadsNombre, leadsEmpresa, leadsEmail]) {
    if (res.data) {
      for (const l of res.data) {
        if (!leadIds.has(l.id)) {
          leadIds.add(l.id);
          results.push({
            id: l.id,
            type: "lead",
            nombre: l.nombre ?? "",
            empresa: l.empresa,
            email: l.email,
            href: "/dashboard/leads",
          });
        }
      }
    }
  }

  if (clientesRes.data) {
    const t = q.trim().toLowerCase();
    for (const c of clientesRes.data) {
      const lead = Array.isArray(c.leads) ? c.leads[0] : c.leads;
      const l = lead as { nombre?: string; empresa?: string; email?: string } | undefined;
      if (!l) continue;
      const nombre = (l.nombre ?? "").toLowerCase();
      const empresa = (l.empresa ?? "").toLowerCase();
      const email = (l.email ?? "").toLowerCase();
      if (nombre.includes(t) || empresa.includes(t) || email.includes(t)) {
        results.push({
          id: c.id,
          type: "cliente",
          nombre: l.nombre ?? "",
          empresa: l.empresa,
          email: l.email,
          href: "/dashboard/clientes",
        });
      }
    }
  }

  return results.slice(0, 8);
}
