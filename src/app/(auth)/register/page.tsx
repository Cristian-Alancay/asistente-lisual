import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Acceso restringido</CardTitle>
        <CardDescription>
          El registro no está disponible. Solo los usuarios autorizados (Cristian Alancay y Eliana Corraro) pueden acceder al sistema. Si eres uno de ellos, usa el correo autorizado para iniciar sesión.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full">
          <Link href="/login">Ir a iniciar sesión</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
