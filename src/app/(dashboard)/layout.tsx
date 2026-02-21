import { RoleProvider } from "@/components/dashboard/role-provider";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getProfile } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  const role = profile?.role ?? "usuario";

  return (
    <RoleProvider userRole={role}>
      <DashboardShell profile={profile} role={role}>
        {children}
      </DashboardShell>
    </RoleProvider>
  );
}
