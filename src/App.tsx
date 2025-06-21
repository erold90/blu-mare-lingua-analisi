
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { Toaster as UIToaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ActivityLogProvider } from "@/hooks/useActivityLog";
import { usePageVisitTracker } from "@/hooks/usePageVisitTracker";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "@/pages/Index";
import ApartmentsPage from "@/pages/ApartmentsPage";
import ServicesPage from "@/pages/ServicesPage";
import ContactsPage from "@/pages/ContactsPage";
import AboutPage from "@/pages/AboutPage";
import RequestQuotePage from "@/pages/RequestQuotePage";
import ReservedAreaPage from "@/pages/ReservedAreaPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import CookiePolicyPage from "@/pages/CookiePolicyPage";
import NotFound from "@/pages/NotFound";
import { CookieConsent } from "@/components/CookieConsent";

const AppWithTracking = () => {
  usePageVisitTracker();
  
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Index />} />
        <Route path="appartamenti" element={<ApartmentsPage />} />
        <Route path="servizi" element={<ServicesPage />} />
        <Route path="contatti" element={<ContactsPage />} />
        <Route path="chi-siamo" element={<AboutPage />} />
        <Route path="richiedi-preventivo" element={<RequestQuotePage />} />
        <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="cookie-policy" element={<CookiePolicyPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="/area-riservata/*" element={<ReservedAreaPage />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <ActivityLogProvider>
          <Router>
            <AppWithTracking />
            <CookieConsent />
            <Toaster />
            <UIToaster />
          </Router>
        </ActivityLogProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
