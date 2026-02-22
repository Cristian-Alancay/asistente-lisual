import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getStoredDashboardContext } from "@/lib/contexto-storage";

export function DashboardContextRedirect() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (pathname !== "/dashboard") return;
    const stored = getStoredDashboardContext();
    if (stored === "personal") {
      navigate("/dashboard/personal", { replace: true });
    }
  }, [pathname, navigate]);

  return null;
}
