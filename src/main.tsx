import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import App from "./App.tsx";
import "./index.css";

// Import the new Supabase providers
import { SupabaseReservationsProvider } from "@/hooks/useSupabaseReservations";
import { SupabasePricesProvider } from "@/hooks/useSupabasePrices";

// Keep the old providers for backward compatibility
import { ReservationsProvider } from "@/hooks/useReservations";
import { PricesProvider } from "@/hooks/usePrices";
import { CleaningProvider } from "@/hooks/cleaning";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          {/* Wrap with both old and new providers for migration period */}
          <SupabaseReservationsProvider>
            <SupabasePricesProvider>
              <ReservationsProvider>
                <PricesProvider>
                  <CleaningProvider>
                    <App />
                    <Toaster />
                  </CleaningProvider>
                </PricesProvider>
              </ReservationsProvider>
            </SupabasePricesProvider>
          </SupabaseReservationsProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </StrictMode>,
);
