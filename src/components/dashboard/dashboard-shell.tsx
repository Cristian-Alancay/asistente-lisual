import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Briefcase, Video, Calendar,
  Wrench, HeartHandshake, MessageSquare, BarChart3,
  ClipboardList, StickyNote, ChevronDown, Menu, X, Building2, User,
  Calculator, BookOpen,
} from "lucide-react";
import { UserMenu } from "@/components/dashboard/user-menu";
import { GlobalSearch } from "@/components/dashboard/global-search";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationsDropdown } from "@/components/dashboard/notifications-dropdown";
import { ProactiveAlerts } from "@/components/dashboard/proactive-alerts";
import { WelcomeToast } from "@/components/dashboard/welcome-toast";
import { DashboardContextRedirect } from "@/components/dashboard/dashboard-context-redirect";
import { useLocale } from "@/contexts/locale-context";
import { setStoredDashboardContext } from "@/lib/contexto-storage";
import { cn } from "@/lib/utils";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState, type ReactNode } from "react";

type NavLink = { to: string; label: string; icon: React.ElementType; match?: string };
type NavGroup = { label: string; icon: React.ElementType; children: NavLink[] };
type NavEntry = NavLink | NavGroup;

function isGroup(entry: NavEntry): entry is NavGroup {
  return "children" in entry;
}

function linkIsActive(pathname: string, link: NavLink): boolean {
  if (link.match) return pathname === link.match;
  return pathname.startsWith(link.to);
}

function groupIsActive(pathname: string, group: NavGroup): boolean {
  return group.children.some((c) => linkIsActive(pathname, c));
}

function getWorkNav(ts: Record<string, string>): NavEntry[] {
  return [
    { to: "/dashboard", label: ts.dashboard, icon: LayoutDashboard, match: "/dashboard" },
    {
      label: ts.planning,
      icon: ClipboardList,
      children: [
        { to: "/dashboard/planificacion", label: ts.planning, icon: ClipboardList },
        { to: "/dashboard/calendario", label: ts.calendar, icon: Calendar },
      ],
    },
    {
      label: ts.sales,
      icon: Users,
      children: [
        { to: "/dashboard/leads", label: ts.leads, icon: Users },
        { to: "/dashboard/cotizador", label: "Cotizador", icon: Calculator },
        { to: "/dashboard/reuniones", label: ts.meetings, icon: Video },
        { to: "/dashboard/biblioteca", label: ts.biblioteca, icon: BookOpen },
      ],
    },
    {
      label: ts.operations,
      icon: Wrench,
      children: [
        { to: "/dashboard/operaciones", label: ts.operations, icon: Wrench },
        { to: "/dashboard/instalaciones", label: ts.installations, icon: Video },
      ],
    },
    {
      label: "CX",
      icon: HeartHandshake,
      children: [
        { to: "/dashboard/clientes", label: ts.clients, icon: Briefcase },
        { to: "/dashboard/experiencia", label: ts.experience, icon: HeartHandshake },
      ],
    },
    { to: "/dashboard/reportes", label: ts.reports, icon: BarChart3 },
    { to: "/dashboard/chat", label: ts.chat, icon: MessageSquare },
  ];
}

function getPersonalNav(ts: Record<string, string>): NavEntry[] {
  return [
    { to: "/dashboard/personal", label: ts.dashboard, icon: LayoutDashboard, match: "/dashboard/personal" },
    { to: "/dashboard/personal/tareas", label: ts.tasks, icon: ClipboardList },
    { to: "/dashboard/personal/calendario", label: ts.calendar, icon: Calendar },
    { to: "/dashboard/personal/notas", label: ts.notes, icon: StickyNote },
    { to: "/dashboard/chat", label: ts.chat, icon: MessageSquare },
  ];
}

function flattenNav(entries: NavEntry[]): NavLink[] {
  return entries.flatMap((e) => (isGroup(e) ? e.children : [e]));
}

function NavDropdown({ group, pathname }: { group: NavGroup; pathname: string }) {
  const active = groupIsActive(pathname, group);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-1 text-[12px] font-medium transition-colors",
            active
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <group.icon className="h-3 w-3 shrink-0" />
          {group.label}
          <ChevronDown className="h-2.5 w-2.5 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[180px]">
        {group.children.map((child) => (
          <DropdownMenuItem key={child.to} asChild>
            <Link
              to={child.to}
              className={cn(
                "flex w-full cursor-pointer items-center gap-2",
                linkIsActive(pathname, child) && "bg-accent font-semibold"
              )}
            >
              <child.icon className="h-4 w-4 shrink-0" />
              {child.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { ts } = useLocale();

  const isElegir =
    pathname === "/dashboard/elegir" ||
    pathname === "/dashboard/elegir/" ||
    pathname.startsWith("/dashboard/elegir?");

  const isPersonal = pathname.startsWith("/dashboard/personal");
  const currentContext = isPersonal ? "personal" : "trabajo";
  const navEntries = currentContext === "personal"
    ? getPersonalNav(ts)
    : getWorkNav(ts);
  const flatItems = flattenNav(navEntries);

  const [mobileOpen, setMobileOpen] = useState(false);

  function switchContext(ctx: "trabajo" | "personal") {
    setStoredDashboardContext(ctx);
    navigate(ctx === "personal" ? "/dashboard/personal" : "/dashboard");
    setMobileOpen(false);
  }

  // --- Elegir page: dedicated premium layout ---
  if (isElegir) {
    return (
      <div className="elegir-page relative min-h-screen-mobile min-h-svh overflow-hidden flex flex-col bg-background">
        <div className="pointer-events-none absolute inset-0 bg-auth-gradient" aria-hidden />
        <div className="auth-orb auth-orb-1" aria-hidden />
        <div className="auth-orb auth-orb-2" aria-hidden />
        <div className="auth-orb auth-orb-3" aria-hidden />
        <header className="auth-header safe-area-inset-top relative z-10 flex items-center justify-between px-4 py-3 safe-area-padding-x">
          <div className="flex items-center gap-2">
            <img src="/pwa-192x192.png" alt="" className="h-6 w-6 shrink-0" draggable={false} />
            <span className="auth-header-brand text-sm font-black tracking-tight">NOMOS</span>
          </div>
          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>
        <DashboardContextRedirect />
        <main className="relative z-10 flex-1 overflow-auto flex flex-col items-center justify-center p-4 md:p-6">
          {children}
        </main>
        <WelcomeToast />
        <ProactiveAlerts />
      </div>
    );
  }

  // --- Dashboard layout: top navbar ---
  return (
    <div className="relative flex min-h-screen-mobile min-h-svh flex-col overflow-hidden bg-background">
      <div className="pointer-events-none fixed inset-0 app-gradient-bg -z-10" aria-hidden />
      <div className="app-orb app-orb-1 -z-10" aria-hidden />
      <div className="app-orb app-orb-2 -z-10" aria-hidden />

      <DashboardContextRedirect />

      <header className="app-header-gradient safe-area-inset-top sticky top-0 z-40 flex h-12 shrink-0 items-center gap-1.5 border-b border-border/40 bg-background/80 px-3 backdrop-blur-md safe-area-padding-x sm:px-4">
        {/* Left: Logo + Context switcher */}
        <Link to="/dashboard/elegir" className="flex shrink-0 items-center gap-1.5">
          <img src="/pwa-192x192.png" alt="" className="h-5 w-5" draggable={false} />
        </Link>

        <span className="text-border/60 text-xs select-none">/</span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 gap-1 px-1.5 text-[13px] font-semibold">
              {currentContext === "personal" ? ts.personal : ts.work}
              <ChevronDown className="h-3 w-3 text-muted-foreground/70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[160px]">
            <DropdownMenuItem
              onClick={() => switchContext("trabajo")}
              className={cn("gap-2", currentContext === "trabajo" && "bg-accent")}
            >
              <Building2 className="h-4 w-4" />
              {ts.work}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => switchContext("personal")}
              className={cn("gap-2", currentContext === "personal" && "bg-accent")}
            >
              <User className="h-4 w-4" />
              {ts.personal}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Separator */}
        <div className="hidden h-5 w-px bg-border/50 md:block" />

        {/* Center: Grouped nav (desktop) */}
        <nav className="hidden flex-1 items-center gap-0.5 md:flex">
          {navEntries.map((entry, i) =>
            isGroup(entry) ? (
              <NavDropdown key={i} group={entry} pathname={pathname} />
            ) : (
              <Link
                key={entry.to}
                to={entry.to}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-[12px] font-medium transition-colors",
                  linkIsActive(pathname, entry)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <entry.icon className="h-3 w-3 shrink-0" />
                {entry.label}
              </Link>
            )
          )}
        </nav>

        {/* Right: Search + Notifications + User */}
        <div className="ml-auto flex shrink-0 items-center gap-0.5">
          <GlobalSearch />
          <NotificationsDropdown />
          <UserMenu />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menú"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="fixed inset-x-0 top-12 z-30 border-b border-border/40 bg-background/95 backdrop-blur-lg md:hidden safe-area-padding-x animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col gap-0.5 p-2">
            {flatItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  linkIsActive(pathname, item)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto p-3 safe-area-inset-bottom safe-area-padding-x pb-6 pt-4 md:p-6">
        {children}
      </main>

      <WelcomeToast />
      <ProactiveAlerts />
    </div>
  );
}
