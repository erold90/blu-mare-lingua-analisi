
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";

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
import { AuthProvider } from "./contexts/AuthContext";

console.log("🚀 App.tsx: Loading main App component");

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    }
  }
});

function App() {
  console.log("🚀 App: Rendering main App component");
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <SettingsProvider>
            <ActivityLogProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/appartamenti" element={<ApartmentsPage />} />
                  <Route 
                    path="/preventivo" 
                    element={<RequestQuotePage />} 
                  />
                  <Route path="/area-riservata/*" element={<ReservedAreaPage />} />
                  <Route path="/contatti" element={<ContactsPage />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                  <Route path="/cookie-policy" element={<CookiePolicyPage />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ActivityLogProvider>
          </SettingsProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
