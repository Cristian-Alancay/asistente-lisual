"use client";

import { usePathname } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { UserMenu } from "@/components/dashboard/user-menu";
import { GlobalSearch } from "@/components/dashboard/global-search";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationsDropdown } from "@/components/dashboard/notifications-dropdown";
import { ProactiveAlerts } from "@/components/dashboard/proactive-alerts";
import { WelcomeToast } from "@/components/dashboard/welcome-toast";
import { DashboardContextRedirect } from "@/components/dashboard/dashboard-context-redirect";
import { HeaderContextTitle } from "@/components/dashboard/header-context-title";
import { Suspense } from "react";
import type { Profile, Role } from "@/types/auth";

type DashboardShellProps = {
  profile: Profile | null;
  role: Role;
  children: React.ReactNode;
};

export function DashboardShell({ profile, role, children }: DashboardShellProps) {
  const pathname = usePathname();
  const isElegir =
    pathname === "/dashboard/elegir" ||
    pathname === "/dashboard/elegir/" ||
    pathname.startsWith("/dashboard/elegir?");

  const header = (
    <header className="app-header-gradient safe-area-inset-top flex h-14 min-h-[3.5rem] shrink-0 items-center justify-between gap-2 border-b border-transparent bg-background/80 px-3 backdrop-blur-sm safe-area-padding-x sm:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {!isElegir && (
          <>
            <SidebarTrigger className="-ml-1 touch-target shrink-0 sm:min-w-0" />
            <Separator orientation="vertical" className="mr-1 h-4 shrink-0 sm:mr-2" />
          </>
        )}
        <HeaderContextTitle />
        <GlobalSearch />
      </div>
      <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
        <NotificationsDropdown />
        <ThemeToggle />
        <UserMenu profile={profile} />
      </div>
    </header>
  );

  const mainContent = (
    <>
      <div className="pointer-events-none fixed inset-0 app-gradient-bg -z-10" aria-hidden />
      <div className="app-orb app-orb-1 -z-10" aria-hidden />
      <div className="app-orb app-orb-2 -z-10" aria-hidden />
      {header}
      <main className="flex-1 overflow-auto p-3 safe-area-inset-bottom safe-area-padding-x pb-6 pt-4 md:p-6">
        {children}
      </main>
      <Suspense fallback={null}>
        <WelcomeToast />
      </Suspense>
      <ProactiveAlerts />
    </>
  );

  if (isElegir) {
    return (
      <div className="relative min-h-screen-mobile min-h-svh overflow-hidden flex flex-col bg-[#0a0a0b]">
        <DashboardContextRedirect />
        <main className="flex-1 overflow-auto flex flex-col items-center justify-center p-4 md:p-6">
          {children}
        </main>
        <Suspense fallback={null}>
          <WelcomeToast />
        </Suspense>
        <ProactiveAlerts />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar userRole={role} />
      <DashboardContextRedirect />
      <SidebarInset className="relative min-h-screen-mobile min-h-svh overflow-hidden">
        {mainContent}
      </SidebarInset>
    </SidebarProvider>
  );
}
