import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/auth";

type ProfileFormProps = {
  profile: Profile;
};

export function ProfileForm({ profile }: ProfileFormProps) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [additionalEmailsRaw, setAdditionalEmailsRaw] = useState(
    (profile.additional_emails ?? []).join(", ")
  );
  const [phone1, setPhone1] = useState(profile.phone_1 ?? "");
  const [phone2, setPhone2] = useState(profile.phone_2 ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      const additionalEmails = additionalEmailsRaw
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean);

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName || null,
          additional_emails: additionalEmails,
          phone_1: phone1 || null,
          phone_2: phone2 || null,
        })
        .eq("id", profile.id);

      if (error) {
        setMessage({ type: "error", text: error.message });
        return;
      }
      setMessage({ type: "success", text: "Datos guardados en Supabase." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos de perfil (Supabase)</CardTitle>
        <CardDescription>
          Correos y telefonos se guardan en la tabla <code className="text-xs">profiles</code>.
          El correo de login es el principal; podes agregar mas y hasta 2 telefonos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {message && (
            <p
              className={
                message.type === "error"
                  ? "text-sm text-destructive"
                  : "text-sm text-green-600 dark:text-green-400"
              }
            >
              {message.text}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Correo principal (login)</Label>
            <Input id="email" type="email" value={profile.email ?? ""} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">
              Este es el correo con el que entras al sistema. No se puede cambiar aqui.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre completo</Label>
            <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ej. Cristian Alancay" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additional_emails">Correos adicionales</Label>
            <Textarea
              id="additional_emails"
              value={additionalEmailsRaw}
              onChange={(e) => setAdditionalEmailsRaw(e.target.value)}
              placeholder="uno@ejemplo.com, otro@ejemplo.com"
              rows={2}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">Separados por coma o uno por linea.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone_1">Telefono 1</Label>
              <Input id="phone_1" type="tel" value={phone1} onChange={(e) => setPhone1(e.target.value)} placeholder="+54 9 11 1234-5678" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_2">Telefono 2</Label>
              <Input id="phone_2" type="tel" value={phone2} onChange={(e) => setPhone2(e.target.value)} placeholder="Opcional" />
            </div>
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? "Guardando..." : "Guardar en Supabase"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
