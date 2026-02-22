import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get("next") || "/dashboard/elegir";

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (session) {
          navigate(next, { replace: true });
        } else {
          navigate("/login?error=auth", { replace: true });
        }
      })
      .catch(() => {
        navigate("/login?error=auth", { replace: true });
      });
  }, [navigate, next]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <Skeleton className="h-8 w-48" />
      <p className="text-sm text-muted-foreground">Autenticando...</p>
    </div>
  );
}
