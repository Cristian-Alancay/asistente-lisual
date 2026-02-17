"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";

export function ReportesFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  useEffect(() => {
    setDesde(searchParams.get("desde") ?? "");
    setHasta(searchParams.get("hasta") ?? "");
  }, [searchParams]);

  function apply() {
    const params = new URLSearchParams();
    if (desde) params.set("desde", desde);
    if (hasta) params.set("hasta", hasta);
    router.push(`/dashboard/reportes?${params.toString()}`);
  }

  function clear() {
    setDesde("");
    setHasta("");
    router.push("/dashboard/reportes");
  }

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-lg border p-4">
      <div>
        <Label htmlFor="desde">Desde</Label>
        <Input
          id="desde"
          type="date"
          value={desde}
          onChange={(e) => setDesde(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="hasta">Hasta</Label>
        <Input
          id="hasta"
          type="date"
          value={hasta}
          onChange={(e) => setHasta(e.target.value)}
          className="mt-1"
        />
      </div>
      <Button onClick={apply}>Aplicar</Button>
      <Button variant="outline" onClick={clear}>
        Limpiar
      </Button>
    </div>
  );
}
