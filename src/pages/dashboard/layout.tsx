import { Outlet } from "react-router-dom";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function DashboardLayout() {
  return (
    <DashboardShell>
      <Outlet />
    </DashboardShell>
  );
}
