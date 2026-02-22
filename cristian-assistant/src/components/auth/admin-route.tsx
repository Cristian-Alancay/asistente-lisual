import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";

export function AdminRoute() {
  const { isAdmin, loading } = useAuth();

  if (loading) return null;

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
