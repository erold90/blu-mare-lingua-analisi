import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useActivityLog } from "./hooks/useActivityLog";
import { useEffect } from "react";

import { AppLayout } from "./components/layout/AppLayout";
import Index from "./pages/Index";
import ApartmentsPage from "./pages/ApartmentsPage";
import RequestQuotePage from "./pages/RequestQuotePage";
import ReservedAreaPage from "./pages/ReservedAreaPage";
import ContactsPage from "./pages/ContactsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import CookiePolicyPage from "./pages/CookiePolicyPage";
import NotFound from "./pages/NotFound";
import { ReservationsProvider } from "./hooks/useReservations";
import { PricesProvider } from "./hooks/price/PricesProvider";
import { SettingsProvider } from "./hooks/useSettings";
import { ActivityLogProvider } from "./hooks/useActivityLog";

const queryClient = new QueryClient();

// Component to track page views
const PageViewTracker = () => {
  const location = useLocation();
  const { addSiteVisit, clearOldData } = useActivityLog();
  
  // Track the current page visit - with proper dependency array
  useEffect(() => {
    // Only track if path actually exists
    if (location.pathname) {
      addSiteVisit(location.pathname);
    }
    // Only depend on pathname changes, not the function reference
  }, [location.pathname]);
  
  // Clear old data periodically - once per session is enough
  useEffect(() => {
    // Only run once when component mounts
    clearOldData();
    // Empty dependency array ensures this only runs once
  }, []);
  
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
