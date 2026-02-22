import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Algo salió mal
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Ocurrió un error inesperado. Podés intentar recargar la página o
            volver al inicio.
          </p>
          {this.state.error && (
            <pre className="mx-auto mt-3 max-w-lg overflow-auto rounded-lg bg-muted/50 p-3 text-left text-xs text-muted-foreground">
              {this.state.error.message}
            </pre>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={this.handleReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
          <Button size="sm" asChild>
            <a href="/">
              <Home className="mr-2 h-4 w-4" />
              Inicio
            </a>
          </Button>
        </div>
      </div>
    );
  }
}

export function RouteErrorFallback() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 text-center text-foreground">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">
          Error inesperado
        </h2>
        <p className="max-w-md text-sm text-muted-foreground">
          La página no pudo cargarse correctamente.
        </p>
      </div>
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Recargar
        </Button>
        <Button size="sm" asChild>
          <a href="/">
            <Home className="mr-2 h-4 w-4" />
            Inicio
          </a>
        </Button>
      </div>
    </div>
  );
}
