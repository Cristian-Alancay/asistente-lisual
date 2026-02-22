import { useEffect } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function WelcomeToast() {
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get("welcome") !== "1") return;

    toast.success("Bienvenido", { description: "Sesion iniciada correctamente." });

    const params = new URLSearchParams(searchParams);
    params.delete("welcome");
    const newSearch = params.toString();
    navigate(pathname + (newSearch ? "?" + newSearch : ""), { replace: true });
  }, [searchParams, pathname, navigate]);

  return null;
}
