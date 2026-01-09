import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { Toaster as UIToaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from 'react-helmet-async';
import PerformanceOptimizer from "@/components/PerformanceOptimizer";
import AppLayout from "@/components/layout/AppLayout";
import { AuthProvider } from "@/hooks/useAuth";
import { SessionProvider } from "@/contexts/SessionContext";

// Lazy load delle pagine per migliorare performance iniziale
const Index = lazy(() => import("@/pages/Index"));
const ApartmentsPage = lazy(() => import("@/pages/ApartmentsPage"));
const ContactsPage = lazy(() => import("@/pages/ContactsPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const RequestQuotePage = lazy(() => import("@/pages/RequestQuotePage"));
const PrivacyPolicyPage = lazy(() => import("@/pages/PrivacyPolicyPage"));
const CookiePolicyPage = lazy(() => import("@/pages/CookiePolicyPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const AdminPage = lazy(() => import("@/pages/AdminPage"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const AppWithRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<AppLayout><Index /></AppLayout>} />
        <Route path="/appartamenti" element={<AppLayout><ApartmentsPage /></AppLayout>} />
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
    </Suspense>
  );
};

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <AuthProvider>
          <PerformanceOptimizer />
          <Router>
            <SessionProvider>
              <AppWithRoutes />
              <Toaster />
              <UIToaster />
            </SessionProvider>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
