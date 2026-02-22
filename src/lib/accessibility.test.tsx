import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "vitest-axe";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

describe("Accesibilidad (a11y)", () => {
  it("formulario con labels correctos no tiene violaciones axe", async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Formulario de prueba</CardTitle>
        </CardHeader>
        <CardContent>
          <form>
            <div>
              <Label htmlFor="test-email">Email</Label>
              <Input id="test-email" type="email" aria-describedby="email-hint" />
              <span id="email-hint">Ingresá tu email</span>
            </div>
            <Button type="submit">Enviar</Button>
          </form>
        </CardContent>
      </Card>
    );
    const results = await axe(container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });

  it("botón con aria-label no tiene violaciones", async () => {
    const { container } = render(
      <Button type="button" aria-label="Cerrar">
        ×
      </Button>
    );
    const results = await axe(container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });

  it("card con contenido accesible", async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Título</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Contenido</p>
        </CardContent>
      </Card>
    );
    expect(screen.getByText("Título")).toBeInTheDocument();
    const results = await axe(container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});
