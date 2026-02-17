import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { UserMenu } from "@/components/dashboard/user-menu";
import { GlobalSearch } from "@/components/dashboard/global-search";
import { ThemeToggle } from "@/components/theme-toggle";
import { getProfile } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  const role = profile?.role ?? "usuario";

  return (
    <SidebarProvider>
      <AppSidebar userRole={role} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <span className="hidden text-sm font-medium text-muted-foreground sm:inline">
              Asistente Lisual
            </span>
            <GlobalSearch />
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <UserMenu profile={profile} />
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
