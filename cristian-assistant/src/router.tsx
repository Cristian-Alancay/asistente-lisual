import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute, PublicOnlyRoute } from "@/components/auth/protected-route";
import { AdminRoute } from "@/components/auth/admin-route";
import { PersonalRoute } from "@/components/auth/personal-route";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary, RouteErrorFallback } from "@/components/error-boundary";

const LandingPage = lazy(() => import("@/pages/landing"));
const AuthLayout = lazy(() => import("@/pages/auth/layout"));
const LoginPage = lazy(() => import("@/pages/auth/login"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/forgot-password"));
const RegisterPage = lazy(() => import("@/pages/auth/register"));
const DashboardLayout = lazy(() => import("@/pages/dashboard/layout"));
const DashboardPage = lazy(() => import("@/pages/dashboard/index"));
const ElegirPage = lazy(() => import("@/pages/dashboard/elegir"));
const LeadsPage = lazy(() => import("@/pages/dashboard/leads"));
const PresupuestosPage = lazy(() => import("@/pages/dashboard/presupuestos"));
const ClientesPage = lazy(() => import("@/pages/dashboard/clientes"));
const OperacionesPage = lazy(() => import("@/pages/dashboard/operaciones"));
const InstalacionesPage = lazy(() => import("@/pages/dashboard/instalaciones"));
const PlanificacionPage = lazy(() => import("@/pages/dashboard/planificacion"));
const CalendarioPage = lazy(() => import("@/pages/dashboard/calendario"));
const ExperienciaPage = lazy(() => import("@/pages/dashboard/experiencia"));
const ReportesPage = lazy(() => import("@/pages/dashboard/reportes"));
const ConfiguracionPage = lazy(() => import("@/pages/dashboard/configuracion"));
const ChatPage = lazy(() => import("@/pages/dashboard/chat"));
const CotizadorPage = lazy(() => import("@/pages/dashboard/cotizador"));
const BibliotecaPage = lazy(() => import("@/pages/dashboard/biblioteca"));
const ReunionesPage = lazy(() => import("@/pages/dashboard/reuniones"));
const PersonalPage = lazy(() => import("@/pages/dashboard/personal/index"));
const PersonalTareasPage = lazy(() => import("@/pages/dashboard/personal/tareas"));
const PersonalNotasPage = lazy(() => import("@/pages/dashboard/personal/notas"));
const PersonalCalendarioPage = lazy(() => import("@/pages/dashboard/personal/calendario"));
const PersonalConfiguracionPage = lazy(() => import("@/pages/dashboard/personal/configuracion"));
const AuthCallbackPage = lazy(() => import("@/pages/auth/callback"));
const NotFoundPage = lazy(() => import("@/pages/not-found"));

function PageFallback() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

function wrap(Component: React.LazyExoticComponent<React.ComponentType>) {
  return (
    <Suspense fallback={<PageFallback />}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    errorElement: <RouteErrorFallback />,
    children: [
      { index: true, element: wrap(LandingPage) },
      { path: "/auth/callback", element: wrap(AuthCallbackPage) },
      {
        element: <PublicOnlyRoute />,
        children: [
          {
            element: wrap(AuthLayout),
            children: [
              { path: "/login", element: wrap(LoginPage) },
              { path: "/forgot-password", element: wrap(ForgotPasswordPage) },
              { path: "/register", element: wrap(RegisterPage) },
            ],
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: (
              <ErrorBoundary>
                {wrap(DashboardLayout)}
              </ErrorBoundary>
            ),
            children: [
              { path: "/dashboard", element: wrap(DashboardPage) },
              { path: "/dashboard/elegir", element: wrap(ElegirPage) },
              { path: "/dashboard/leads", element: wrap(LeadsPage) },
              { path: "/dashboard/presupuestos", element: wrap(PresupuestosPage) },
              { path: "/dashboard/cotizador", element: wrap(CotizadorPage) },
              { path: "/dashboard/biblioteca", element: wrap(BibliotecaPage) },
              { path: "/dashboard/reuniones", element: wrap(ReunionesPage) },
              { path: "/dashboard/clientes", element: wrap(ClientesPage) },
              { path: "/dashboard/operaciones", element: wrap(OperacionesPage) },
              { path: "/dashboard/instalaciones", element: wrap(InstalacionesPage) },
              { path: "/dashboard/planificacion", element: wrap(PlanificacionPage) },
              { path: "/dashboard/calendario", element: wrap(CalendarioPage) },
              { path: "/dashboard/experiencia", element: wrap(ExperienciaPage) },
              { path: "/dashboard/reportes", element: wrap(ReportesPage) },
              { path: "/dashboard/chat", element: wrap(ChatPage) },
              {
                element: <AdminRoute />,
                children: [
                  { path: "/dashboard/configuracion", element: wrap(ConfiguracionPage) },
                ],
              },
              {
                element: <PersonalRoute />,
                children: [
                  { path: "/dashboard/personal", element: wrap(PersonalPage) },
                  { path: "/dashboard/personal/tareas", element: wrap(PersonalTareasPage) },
                  { path: "/dashboard/personal/notas", element: wrap(PersonalNotasPage) },
                  { path: "/dashboard/personal/calendario", element: wrap(PersonalCalendarioPage) },
                  { path: "/dashboard/personal/configuracion", element: wrap(PersonalConfiguracionPage) },
                ],
              },
            ],
          },
        ],
      },
      { path: "*", element: wrap(NotFoundPage) },
    ],
  },
]);
