
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import { AppLayout } from "./components/layout/AppLayout";
import Index from "./pages/Index";
import ApartmentsPage from "./pages/ApartmentsPage";
import RequestQuotePage from "./pages/RequestQuotePage";
import ReservedAreaPage from "./pages/ReservedAreaPage";
import ContactsPage from "./pages/ContactsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import CookiePolicyPage from "./pages/CookiePolicyPage";
import NotFound from "./pages/NotFound";
import GalleryPage from "./pages/GalleryPage";
import { ReservationsProvider } from "./hooks/useReservations";
import { PricesProvider } from "./hooks/usePrices";
import { SettingsProvider } from "./hooks/useSettings";
import { ActivityLogProvider } from "./hooks/useActivityLog";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Component to track page views
const PageViewTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
    // We need to use a React component to access hooks
    const addPageVisit = async () => {
      try {
        const { useActivityLog } = await import("./hooks/useActivityLog");
        const { addSiteVisit } = useActivityLog();
        addSiteVisit(location.pathname);
      } catch (error) {
        console.error("Failed to log page visit", error);
      }
    };
    
    // Execute it inside the component
    addPageVisit();
  }, [location]);
  
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ReservationsProvider>
        <PricesProvider>
          <SettingsProvider>
            <ActivityLogProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route element={<AppLayout />}>
                    <Route path="/" element={<Index />} />
                    <Route path="/appartamenti" element={<ApartmentsPage />} />
                    <Route path="/galleria" element={<GalleryPage />} />
                    <Route path="/preventivo" element={<RequestQuotePage />} />
                    <Route path="/area-riservata/*" element={<ReservedAreaPage />} />
                    <Route path="/contatti" element={<ContactsPage />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                    <Route path="/cookie-policy" element={<CookiePolicyPage />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <PageViewTracker />
              </BrowserRouter>
            </ActivityLogProvider>
          </SettingsProvider>
        </PricesProvider>
      </ReservationsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
