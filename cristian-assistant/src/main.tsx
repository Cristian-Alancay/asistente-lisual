import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { LocaleProvider } from "@/contexts/locale-context";
import { router } from "@/router";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="cristian-assistant-theme">
        <LocaleProvider>
          <AuthProvider>
            <TooltipProvider>
              <RouterProvider router={router} />
              <Toaster richColors position="top-right" />
            </TooltipProvider>
          </AuthProvider>
        </LocaleProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
