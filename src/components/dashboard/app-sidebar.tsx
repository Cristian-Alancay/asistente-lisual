"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Briefcase,
  Video,
  Calendar,
  Wrench,
  Settings,
  HeartHandshake,
  MessageSquare,
  BarChart3,
  ClipboardList,
  Building2,
  User,
  StickyNote,
} from "lucide-react";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { setStoredDashboardContext } from "@/lib/contexto-storage";
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

/** Contexto: Trabajo (laboral) o Cristian Alancay (personal). Deriva del pathname. */
const isPersonalContext = (pathname: string) => pathname.startsWith("/dashboard/personal");
/** Página de elección de contexto: no mostrar menús hasta que elija. */
const isElegirPage = (pathname: string) => pathname === "/dashboard/elegir";

export function AppSidebar({ userRole = "usuario" }: AppSidebarProps) {
  const pathname = usePathname();
  const isAdmin = userRole === "admin";
  const personal = isPersonalContext(pathname);
  const elegir = isElegirPage(pathname);

  return (
    <Sidebar className="sidebar-gradient-accent">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <Link href={elegir ? "/dashboard/elegir" : "/dashboard"} className="flex items-center gap-2 font-semibold">
          <span className="text-lg">Assistant Cristian Alancay</span>
        </Link>
        <p className="text-xs text-muted-foreground">
          {elegir ? "Elegí un espacio" : "Asistente Personal"}
        </p>
      </SidebarHeader>
      <SidebarContent>
        {/* Selector de contexto: Trabajo | Cristian Alancay */}
        <SidebarGroup className="mb-2">
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
            Contexto
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={!elegir && !personal}
                  tooltip="Trabajo (laboral)"
                  className="touch-target"
                >
                  <Link href="/dashboard" onClick={() => setStoredDashboardContext("trabajo")}>
                    <Building2 className="h-4 w-4 shrink-0" />
                    <span>Trabajo</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={!elegir && personal}
                  tooltip="Cristian Alancay (personal)"
                  className="touch-target"
                >
                  <Link href="/dashboard/personal" onClick={() => setStoredDashboardContext("personal")}>
                    <User className="h-4 w-4 shrink-0" />
                    <span>Cristian Alancay</span>
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
          /* Menú contexto Cristian Alancay: Tareas, Calendario, Notas, Chat, Configuración */
          <SidebarGroup>
            <SidebarGroupLabel>Cristian Alancay</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith("/dashboard/personal/tareas")}
                    tooltip="Tareas"
                  >
                    <Link href="/dashboard/personal/tareas">
                      <ClipboardList />
                      <span>Tareas</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith("/dashboard/personal/calendario")}
                    tooltip="Calendario"
                  >
                    <Link href="/dashboard/personal/calendario">
                      <Calendar />
                      <span>Calendario</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith("/dashboard/personal/notas")}
                    tooltip="Notas"
                  >
                    <Link href="/dashboard/personal/notas">
                      <StickyNote />
                      <span>Notas</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith("/dashboard/chat")}
                    tooltip="Chat"
                  >
                    <Link href="/dashboard/chat">
                      <MessageSquare />
                      <span>Chat</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {isAdmin && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith("/dashboard/personal/configuracion")}
                      tooltip="Configuración"
                    >
                      <Link href="/dashboard/personal/configuracion">
                        <Settings />
                        <span>Configuración</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <>
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/dashboard"}
                  tooltip="Dashboard"
                >
                  <Link href="/dashboard">
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith("/dashboard/planificacion")}
                  tooltip="Planificación"
                >
                  <Link href="/dashboard/planificacion">
                    <ClipboardList />
                    <span>Planificación</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith("/dashboard/chat")}
                  tooltip="Chat"
                >
                  <Link href="/dashboard/chat">
                    <MessageSquare />
                    <span>Chat</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Ventas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith("/dashboard/leads")}
                  tooltip="Leads"
                >
                  <Link href="/dashboard/leads">
                    <Users />
                    <span>Leads</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith("/dashboard/presupuestos")}
                  tooltip="Presupuestos"
                >
                  <Link href="/dashboard/presupuestos">
                    <FileText />
                    <span>Presupuestos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith("/dashboard/clientes")}
                  tooltip="Clientes"
                >
                  <Link href="/dashboard/clientes">
                    <Briefcase />
                    <span>Clientes</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Operaciones</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith("/dashboard/operaciones")}
                  tooltip="Operaciones"
                >
                  <Link href="/dashboard/operaciones">
                    <Wrench />
                    <span>Operaciones</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith("/dashboard/instalaciones")}
                  tooltip="Instalaciones"
                >
                  <Link href="/dashboard/instalaciones">
                    <Video />
                    <span>Instalaciones</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith("/dashboard/calendario")}
                  tooltip="Calendario"
                >
                  <Link href="/dashboard/calendario">
                    <Calendar />
                    <span>Calendario</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Experiencia</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith("/dashboard/experiencia")}
                  tooltip="Experiencia"
                >
                  <Link href="/dashboard/experiencia">
                    <HeartHandshake />
                    <span>Experiencia</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Reportes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith("/dashboard/reportes")}
                  tooltip="Reportes"
                >
                  <Link href="/dashboard/reportes">
                    <BarChart3 />
                    <span>Reportes</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Sistema</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith("/dashboard/configuracion")}
                    tooltip="Configuración"
                  >
                    <Link href="/dashboard/configuracion">
                      <Settings />
                      <span>Configuración</span>
                    </Link>
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
