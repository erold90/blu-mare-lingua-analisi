
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { Toaster as UIToaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { usePageTracking } from "@/hooks/analytics/usePageTracking";
import AppLayout from "@/components/layout/AppLayout";
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
  usePageTracking();
  
  return (
    <Routes>
      <Route path="/" element={<AppLayout><Index /></AppLayout>} />
      <Route path="/appartamenti" element={<AppLayout><ApartmentsPage /></AppLayout>} />
      <Route path="/servizi" element={<AppLayout><ServicesPage /></AppLayout>} />
      <Route path="/contatti" element={<AppLayout><ContactsPage /></AppLayout>} />
      <Route path="/chi-siamo" element={<AppLayout><AboutPage /></AppLayout>} />
      <Route path="/richiedi-preventivo" element={<AppLayout><RequestQuotePage /></AppLayout>} />
      <Route path="/preventivo" element={<Navigate to="/richiedi-preventivo" replace />} />
      <Route path="/privacy-policy" element={<AppLayout><PrivacyPolicyPage /></AppLayout>} />
      <Route path="/cookie-policy" element={<AppLayout><CookiePolicyPage /></AppLayout>} />
      <Route path="/area-riservata/*" element={<ReservedAreaPage />} />
      <Route path="*" element={<AppLayout><NotFound /></AppLayout>} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>
        <Router>
          <AppWithTracking />
          <CookieConsent />
          <Toaster />
          <UIToaster />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
