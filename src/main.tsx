
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import App from "./App.tsx";
import "./index.css";

// Import the Supabase providers
import { SupabaseReservationsProvider } from "@/hooks/useSupabaseReservations";
import { SupabasePricesProvider } from "@/hooks/useSupabasePrices";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Reduce retries to prevent timeout loops
      staleTime: 5 * 60 * 1000, // 5 minutes cache
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SupabaseReservationsProvider>
            <SupabasePricesProvider>
              <App />
              <Toaster />
            </SupabasePricesProvider>
          </SupabaseReservationsProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>,
);
