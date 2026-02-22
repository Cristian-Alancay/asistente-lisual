import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  Briefcase,
  Video,
  Wrench,
  Calendar,
  Settings,
  HeartHandshake,
  MessageSquare,
  BarChart3,
  ClipboardList,
  Building2,
  User,
  StickyNote,
  BookOpen,
} from "lucide-react";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { setStoredDashboardContext } from "@/lib/contexto-storage";
import { useLocale } from "@/contexts/locale-context";
import type { Role } from "@/types/auth";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

type AppSidebarProps = {
  userRole?: Role;
};

const isPersonalContext = (pathname: string) => pathname.startsWith("/dashboard/personal");
const isElegirPage = (pathname: string) => pathname === "/dashboard/elegir";

export function AppSidebar({ userRole = "usuario" }: AppSidebarProps) {
  const { pathname } = useLocation();
  const { ts } = useLocale();
  const isAdmin = userRole === "admin";
  const personal = isPersonalContext(pathname);
  const elegir = isElegirPage(pathname);

  return (
    <Sidebar className="sidebar-gradient-accent">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <Link to={elegir ? "/dashboard/elegir" : "/dashboard"} className="flex items-center gap-2.5 font-semibold">
          <img src="/pwa-192x192.png" alt="" className="h-7 w-7 shrink-0" draggable={false} />
          <span className="auth-header-brand text-base font-black tracking-tight">{ts.appName}</span>
        </Link>
        <p className="text-xs text-muted-foreground">
          {elegir ? ts.pickSpace : ts.subtitle}
        </p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="mb-2">
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
            {ts.context}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={!elegir && !personal}
                  tooltip={ts.workTooltip}
                  className="touch-target"
                >
                  <Link to="/dashboard" onClick={() => setStoredDashboardContext("trabajo")}>
                    <Building2 className="h-4 w-4 shrink-0" />
                    <span>{ts.work}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={!elegir && personal}
                  tooltip={ts.personalTooltip}
                  className="touch-target"
                >
                  <Link to="/dashboard/personal" onClick={() => setStoredDashboardContext("personal")}>
                    <User className="h-4 w-4 shrink-0" />
                    <span>{ts.personal}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {!elegir && (
        <>
        <SidebarSeparator className="mb-2" />
        {personal ? (
          <SidebarGroup>
            <SidebarGroupLabel>{ts.personal}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/personal/tareas")} tooltip={ts.tasks}>
                    <Link to="/dashboard/personal/tareas"><ClipboardList /><span>{ts.tasks}</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/personal/calendario")} tooltip={ts.calendar}>
                    <Link to="/dashboard/personal/calendario"><Calendar /><span>{ts.calendar}</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/personal/notas")} tooltip={ts.notes}>
                    <Link to="/dashboard/personal/notas"><StickyNote /><span>{ts.notes}</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/chat")} tooltip={ts.chat}>
                    <Link to="/dashboard/chat"><MessageSquare /><span>{ts.chat}</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {isAdmin && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/personal/configuracion")} tooltip={ts.settings}>
                      <Link to="/dashboard/personal/configuracion"><Settings /><span>{ts.settings}</span></Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <>
        <SidebarGroup>
          <SidebarGroupLabel>{ts.general}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard"} tooltip={ts.dashboard}>
                  <Link to="/dashboard"><LayoutDashboard /><span>{ts.dashboard}</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/planificacion")} tooltip={ts.planning}>
                  <Link to="/dashboard/planificacion"><ClipboardList /><span>{ts.planning}</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/chat")} tooltip={ts.chat}>
                  <Link to="/dashboard/chat"><MessageSquare /><span>{ts.chat}</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>{ts.sales}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/leads")} tooltip={ts.leads}>
                  <Link to="/dashboard/leads"><Users /><span>{ts.leads}</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/presupuestos")} tooltip={ts.quotes}>
                  <Link to="/dashboard/presupuestos"><FileText /><span>{ts.quotes}</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/reuniones")} tooltip={ts.meetings}>
                  <Link to="/dashboard/reuniones"><Video /><span>{ts.meetings}</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/biblioteca")} tooltip={ts.biblioteca}>
                  <Link to="/dashboard/biblioteca"><BookOpen /><span>{ts.biblioteca}</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>{ts.operations}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/operaciones")} tooltip={ts.operations}>
                  <Link to="/dashboard/operaciones"><Wrench /><span>{ts.operations}</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/instalaciones")} tooltip={ts.installations}>
                  <Link to="/dashboard/instalaciones"><Wrench /><span>{ts.installations}</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/calendario")} tooltip={ts.calendar}>
                  <Link to="/dashboard/calendario"><Calendar /><span>{ts.calendar}</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>{ts.experience}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/clientes")} tooltip={ts.clients}>
                  <Link to="/dashboard/clientes"><Briefcase /><span>{ts.clients}</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/experiencia")} tooltip={ts.experience}>
                  <Link to="/dashboard/experiencia"><HeartHandshake /><span>{ts.experience}</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>{ts.reports}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/reportes")} tooltip={ts.reports}>
                  <Link to="/dashboard/reportes"><BarChart3 /><span>{ts.reports}</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>{ts.system}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/configuracion")} tooltip={ts.settings}>
                    <Link to="/dashboard/configuracion"><Settings /><span>{ts.settings}</span></Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
          </>
        )}
        </>
        )}
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="mt-auto border-t border-sidebar-border">
        <LogoutButton variant="sidebar" />
      </SidebarFooter>
    </Sidebar>
  );
}
