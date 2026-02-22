import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/ui/phone-input";
import { DatePicker } from "@/components/ui/date-picker";
import { leadSchema, type LeadFormData } from "@/lib/validations/lead";
import * as dolarService from "@/services/dolar";

type LeadFormProps = {
  defaultValues?: Partial<LeadFormData>;
  onSubmit: (data: LeadFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
};

export function LeadForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Guardar",
}: LeadFormProps) {
  const form = useForm<LeadFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(leadSchema) as any,
    defaultValues: {
      nombre: "",
      empresa: "",
      email: "",
      telefono: "",
      canal_origen: "manual" as const,
      estado: "prospecto" as const,
      presupuesto_estimado: undefined,
      presupuesto_estimado_moneda: "USD" as const,
      link_reunion: "",
      necesidad: "",
      fecha_decision_estimada: "",
      notas: "",
      ...defaultValues,
    },
  });

  const presupuesto = form.watch("presupuesto_estimado");
  const moneda = form.watch("presupuesto_estimado_moneda");
  const [ventaBna, setVentaBna] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    dolarService.getDolarOficial()
      .then((d) => { if (!cancelled && d?.venta) setVentaBna(d.venta); })
      .catch(() => { if (!cancelled) setVentaBna(null); });
    return () => { cancelled = true; };
  }, []);

  async function handleSubmit(data: LeadFormData) {
    if (ventaBna != null) {
      data.cotizacion_dolar_valor = ventaBna;
      data.cotizacion_dolar_fecha = new Date().toISOString().slice(0, 10);
    }
    await onSubmit(data);
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre completo *</FormLabel>
              <FormControl><Input placeholder="Juan Pérez" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="empresa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Empresa</FormLabel>
              <FormControl><Input placeholder="Empresa S.A." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email *</FormLabel>
              <FormControl><Input type="email" placeholder="juan@empresa.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormItem>
          <FormLabel>Teléfono</FormLabel>
          <FormControl>
            <PhoneInput
              name="telefono"
              control={form.control}
              defaultCountry="AR"
              placeholder="11 1234-5678"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="canal_origen"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Canal de origen</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="reunion">Reunión</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="web">Web</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="referencia">Referencia</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="estado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="prospecto">Prospecto</SelectItem>
                    <SelectItem value="negociacion">Negociación</SelectItem>
                    <SelectItem value="convertido">Convertido</SelectItem>
                    <SelectItem value="perdido">Perdido</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="presupuesto_estimado"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Presupuesto estimado</FormLabel>
              <div className="flex items-center gap-2">
                <FormField
                  control={form.control}
                  name="presupuesto_estimado_moneda"
                  render={({ field: mField }) => (
                    <Select onValueChange={mField.onChange} value={mField.value ?? "USD"}>
                      <SelectTrigger className="w-[80px] shrink-0 font-semibold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">U$D</SelectItem>
                        <SelectItem value="ARS">$ ARS</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                <FormControl>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={typeof field.value === "number" ? field.value.toLocaleString("es-AR") : ""}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      field.onChange(raw === "" ? undefined : Number(raw));
                    }}
                  />
                </FormControl>
              </div>
              {moneda === "USD" && typeof presupuesto === "number" && presupuesto > 0 && ventaBna != null && (
                <div className="mt-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-muted-foreground">Equivalente ARS</span>
                    <span className="text-base font-bold text-foreground">
                      $ {Math.round(presupuesto * ventaBna).toLocaleString("es-AR")}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground/70">
                    Dólar Oficial BNA Venta: ${ventaBna.toLocaleString("es-AR", { minimumFractionDigits: 2 })} — {new Date().toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="link_reunion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link de reunión</FormLabel>
              <FormControl><Input type="url" placeholder="https://meet.google.com/..." {...field} value={field.value ?? ""} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fecha_decision_estimada"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha estimada de decisión</FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  placeholder="Seleccionar fecha"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="necesidad"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Necesidad / Problema</FormLabel>
              <FormControl><Textarea placeholder="Descripción breve" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas</FormLabel>
              <FormControl><Textarea placeholder="Notas adicionales" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2 justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          )}
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Guardando..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
