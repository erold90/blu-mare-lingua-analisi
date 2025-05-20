
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ReservationsProvider>
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
        </BrowserRouter>
      </ReservationsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
