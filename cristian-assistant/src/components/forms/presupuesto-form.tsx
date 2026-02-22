import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { presupuestoSchema, type PresupuestoFormData } from "@/lib/validations/presupuesto";
import { useProximoNumero } from "@/hooks/use-presupuestos";
import { Plus, Trash2, Loader2 } from "lucide-react";

type PresupuestoFormProps = {
  defaultValues?: Partial<PresupuestoFormData>;
  onSubmit: (data: PresupuestoFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  leads: { id: string; nombre: string; empresa: string | null }[];
  isEditing?: boolean;
};

export function PresupuestoForm({ defaultValues, onSubmit, onCancel, submitLabel = "Guardar", leads, isEditing }: PresupuestoFormProps) {
  const form = useForm<PresupuestoFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(presupuestoSchema) as any,
    defaultValues: {
      lead_id: "",
      numero: "",
      fecha_emision: "",
      vigencia_hasta: "",
      items: [{ descripcion: "", cantidad: 1, precio_unitario: 0 }],
      moneda: "ARS",
      estado: "borrador",
      ...defaultValues,
    },
  });

  const watchedLeadId = form.watch("lead_id");

  const selectedLead = useMemo(
    () => leads.find((l) => l.id === watchedLeadId),
    [leads, watchedLeadId],
  );

  const { data: proximoNumero, isFetching: fetchingNumero } = useProximoNumero(
    selectedLead?.nombre,
    selectedLead?.empresa ?? undefined,
  );

  useEffect(() => {
    if (isEditing) return;
    if (proximoNumero && selectedLead) {
      form.setValue("numero", proximoNumero);
    }
  }, [proximoNumero, selectedLead, form, isEditing]);

  useEffect(() => {
    if (!defaultValues?.fecha_emision && !form.getValues("fecha_emision")) {
      form.setValue("fecha_emision", new Date().toISOString().split("T")[0]);
    }
  }, [defaultValues, form]);

  const items = form.watch("items");

  function addItem() {
    form.setValue("items", [...items, { descripcion: "", cantidad: 1, precio_unitario: 0 }]);
  }

  function removeItem(i: number) {
    if (items.length <= 1) return;
    form.setValue("items", items.filter((_, idx) => idx !== i));
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (data) => { await onSubmit(data); form.reset(); })}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="lead_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lead *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Selecciona un lead" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {leads.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.nombre}{l.empresa ? ` (${l.empresa})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="numero"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número *</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      placeholder={selectedLead ? "Generando..." : "Seleccioná un lead primero"}
                      readOnly={!isEditing}
                      className={!isEditing ? "bg-muted/50 font-mono text-xs" : "font-mono text-xs"}
                      {...field}
                    />
                  </FormControl>
                  {fetchingNumero && (
                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                  )}
                </div>
                {!isEditing && (
                  <p className="text-[11px] text-muted-foreground/70">
                    Auto-generado al seleccionar lead
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="moneda"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Moneda</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="ARS">ARS</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="fecha_emision"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha emisión *</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="vigencia_hasta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vigencia hasta *</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <FormLabel>Ítems *</FormLabel>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="mr-1 h-4 w-4" /> Agregar
            </Button>
          </div>
          <div className="mt-2 space-y-2">
            {items.map((_, i) => (
              <div key={i} className="flex gap-2 rounded border p-2">
                <FormField
                  control={form.control}
                  name={`items.${i}.descripcion`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl><Input placeholder="Descripción" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`items.${i}.cantidad`}
                  render={({ field }) => (
                    <FormItem className="w-20">
                      <FormControl>
                        <Input type="number" min={0.01} step={0.01} value={field.value} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`items.${i}.precio_unitario`}
                  render={({ field }) => (
                    <FormItem className="w-28">
                      <FormControl>
                        <Input type="number" min={0} step={0.01} value={field.value} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)} disabled={items.length <= 1}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
          {form.formState.errors.items?.message && (
            <p className="mt-1 text-sm text-destructive">{form.formState.errors.items.message}</p>
          )}
        </div>
        <FormField
          control={form.control}
          name="estado"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="borrador">Borrador</SelectItem>
                  <SelectItem value="enviado">Enviado</SelectItem>
                  <SelectItem value="aceptado">Aceptado</SelectItem>
                  <SelectItem value="rechazado">Rechazado</SelectItem>
                  <SelectItem value="vencido">Vencido</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          {onCancel && (<Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>)}
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Guardando..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
