
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
      <Route path="/" element={<AppLayout><Index /></AppLayout>} />
      <Route path="/appartamenti" element={<AppLayout><ApartmentsPage /></AppLayout>} />
      <Route path="/servizi" element={<AppLayout><ServicesPage /></AppLayout>} />
      <Route path="/contatti" element={<AppLayout><ContactsPage /></AppLayout>} />
      <Route path="/chi-siamo" element={<AppLayout><AboutPage /></AppLayout>} />
      <Route path="/richiedi-preventivo" element={<AppLayout><RequestQuotePage /></AppLayout>} />
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
