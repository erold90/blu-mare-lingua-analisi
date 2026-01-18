
import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { TooltipProvider } from "@/components/ui/tooltip";
import App from "./App.tsx";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

const rootElement = document.getElementById("root")!;

const AppWithProviders = (
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <App />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>
);

// Hydrate se pre-renderizzato da react-snap, altrimenti render normale
if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, AppWithProviders);
} else {
  createRoot(rootElement).render(AppWithProviders);
}

// Signal prerender is ready (used by prerenderer for timing)
document.dispatchEvent(new Event("render-event"));
