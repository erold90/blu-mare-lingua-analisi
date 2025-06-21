
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import App from "./App.tsx";
import "./index.css";

// Import the new Supabase providers
import { SupabaseReservationsProvider } from "@/hooks/useSupabaseReservations";
import { SupabasePricesProvider } from "@/hooks/useSupabasePrices";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {/* Removed BrowserRouter from here since it's already in App.tsx */}
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
