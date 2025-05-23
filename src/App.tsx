import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useLocation } from "react-router-dom";
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
import { SettingsProvider } from "./hooks/useSettings";
import { ActivityLogProvider } from "./hooks/useActivityLog";
import ApiTestPage from './pages/api-test';

// Create a new QueryClient instance (IMPORTANT: Don't use useState or useRef here!)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    }
  }
});

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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SettingsProvider>
          <ActivityLogProvider>
            <Toaster />
            <Sonner />
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
          </ActivityLogProvider>
        </SettingsProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
