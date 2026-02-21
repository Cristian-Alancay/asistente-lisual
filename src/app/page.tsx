import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { BarChart3, MessageSquare, Users, Wrench } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen-mobile min-h-svh bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-12 safe-area-padding-x md:py-24">
        <header className="flex justify-between items-center mb-12 md:mb-16">
          <span className="truncate text-lg font-bold sm:text-xl">Assistant Cristian Alancay</span>
          <div className="flex shrink-0 gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Iniciar sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Registrarse</Link>
            </Button>
          </div>
        </header>

        <section className="text-center max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Asistente Personal para tu negocio
          </h1>
          <p className="text-xl text-muted-foreground">
            Gestioná ventas, operaciones y experiencia al cliente en un solo lugar.
            CRM integrado con IA, WhatsApp y seguimientos automáticos.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button size="lg" asChild>
              <Link href="/register">Comenzar gratis</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Ya tengo cuenta</Link>
            </Button>
          </div>
        </section>

        <section className="mt-24 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="rounded-lg border bg-card p-6 text-center">
            <Users className="mx-auto h-10 w-10 text-primary mb-3" />
            <h3 className="font-semibold mb-2">Ventas</h3>
            <p className="text-sm text-muted-foreground">
              Leads, presupuestos y clientes. Conversión y seguimiento.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-center">
            <Wrench className="mx-auto h-10 w-10 text-primary mb-3" />
            <h3 className="font-semibold mb-2">Operaciones</h3>
            <p className="text-sm text-muted-foreground">
              Proyectos, instalaciones y equipos. Todo organizado.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-center">
            <MessageSquare className="mx-auto h-10 w-10 text-primary mb-3" />
            <h3 className="font-semibold mb-2">Chat con IA</h3>
            <p className="text-sm text-muted-foreground">
              Asistente inteligente y WhatsApp integrado.
            </p>
          </div>
        </section>

        <footer className="mt-24 text-center text-sm text-muted-foreground">
          <BarChart3 className="inline h-4 w-4 mr-1" />
          Reportes, métricas y experiencia al cliente
        </footer>
      </div>
    </div>
  );
}
