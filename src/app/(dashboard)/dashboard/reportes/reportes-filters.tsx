"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";

export function ReportesFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [desde, setDesde] = useState(() => searchParams.get("desde") ?? "");
  const [hasta, setHasta] = useState(() => searchParams.get("hasta") ?? "");
  const prevParams = useRef(searchParams.toString());
  useEffect(() => {
    const current = searchParams.toString();
    if (current !== prevParams.current) {
      prevParams.current = current;
      const d = searchParams.get("desde") ?? "";
      const h = searchParams.get("hasta") ?? "";
      queueMicrotask(() => {
        setDesde(d);
        setHasta(h);
      });
    }
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

  function setPreset(days: number) {
    const h = new Date();
    const d = new Date();
    d.setDate(d.getDate() - days);
    setDesde(d.toISOString().slice(0, 10));
    setHasta(h.toISOString().slice(0, 10));
    const params = new URLSearchParams();
    params.set("desde", d.toISOString().slice(0, 10));
    params.set("hasta", h.toISOString().slice(0, 10));
    router.push(`/dashboard/reportes?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-lg border p-4">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => setPreset(7)}>
          7 días
        </Button>
        <Button variant="outline" size="sm" onClick={() => setPreset(30)}>
          30 días
        </Button>
        <Button variant="outline" size="sm" onClick={() => setPreset(90)}>
          90 días
        </Button>
      </div>
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
