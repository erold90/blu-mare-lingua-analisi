
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { Toaster as UIToaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from 'react-helmet-async';
import PerformanceOptimizer from "@/components/PerformanceOptimizer";
import AppLayout from "@/components/layout/AppLayout";
import Index from "@/pages/Index";
import ApartmentsPage from "@/pages/ApartmentsPage";
import { useVisitTracker } from '@/hooks/useVisitTracker';
import ServicesPage from "@/pages/ServicesPage";
import ContactsPage from "@/pages/ContactsPage";
import AboutPage from "@/pages/AboutPage";
import RequestQuotePage from "@/pages/RequestQuotePage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import CookiePolicyPage from "@/pages/CookiePolicyPage";
import NotFound from "@/pages/NotFound";
import AdminPage from "@/pages/AdminPage";
import AuthPage from "@/pages/AuthPage";
import { AuthProvider } from "@/hooks/useAuth";

const AppWithRoutes = () => {
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
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/area-riservata" element={<AdminPage />} />
      <Route path="*" element={<AppLayout><NotFound /></AppLayout>} />
    </Routes>
  );
};

function App() {
  // Tracciamento visite automatico
  useVisitTracker();
  
  return (
    <HelmetProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <AuthProvider>
          <PerformanceOptimizer />
          <Router>
            <AppWithRoutes />
            <Toaster />
            <UIToaster />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
