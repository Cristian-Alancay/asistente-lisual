import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function PersonalRoute() {
  const { user, loading: authLoading } = useAuth();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;

    async function checkMembership() {
      const { data: um } = await supabase
        .from("user_manager")
        .select("id")
        .eq("slug", "default")
        .limit(1)
        .single();

      if (!um?.id) {
        setAllowed(false);
        return;
      }

      const { data: member } = await supabase
        .from("user_manager_members")
        .select("user_id")
        .eq("user_manager_id", um.id)
        .eq("user_id", user!.id)
        .limit(1)
        .single();

      setAllowed(!!member);
    }

    checkMembership();
  }, [user]);

  if (authLoading || allowed === null) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!allowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
