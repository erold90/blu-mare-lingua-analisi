import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { Toaster as UIToaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
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
const GuidesIndexPage = lazy(() => import("@/pages/GuidesIndexPage"));
const GuidePage = lazy(() => import("@/pages/GuidePage"));

// Loading fallback component with animation
const PageLoader = () => (
  <motion.div
    className="min-h-screen flex items-center justify-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="rounded-full h-10 w-10 border-2 border-primary border-t-transparent"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  </motion.div>
);

// Page transition wrapper
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }
  },
};

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
  >
    {children}
  </motion.div>
);

const AppWithRoutes = () => {
  const location = useLocation();

  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<AppLayout><PageWrapper><Index /></PageWrapper></AppLayout>} />
          <Route path="/appartamenti" element={<AppLayout><PageWrapper><ApartmentsPage /></PageWrapper></AppLayout>} />
          <Route path="/contatti" element={<AppLayout><PageWrapper><ContactsPage /></PageWrapper></AppLayout>} />
          <Route path="/chi-siamo" element={<AppLayout><PageWrapper><AboutPage /></PageWrapper></AppLayout>} />
          <Route path="/preventivo" element={<AppLayout><PageWrapper><RequestQuotePage /></PageWrapper></AppLayout>} />
          <Route path="/richiedi-preventivo" element={<Navigate to="/preventivo" replace />} />
          <Route path="/privacy-policy" element={<AppLayout><PageWrapper><PrivacyPolicyPage /></PageWrapper></AppLayout>} />
          <Route path="/cookie-policy" element={<AppLayout><PageWrapper><CookiePolicyPage /></PageWrapper></AppLayout>} />
          <Route path="/guide" element={<AppLayout><PageWrapper><GuidesIndexPage /></PageWrapper></AppLayout>} />
          <Route path="/guide/:slug" element={<AppLayout><PageWrapper><GuidePage /></PageWrapper></AppLayout>} />
          <Route path="/auth" element={<PageWrapper><AuthPage /></PageWrapper>} />
          <Route path="/admin" element={<PageWrapper><AdminPage /></PageWrapper>} />
          <Route path="/area-riservata" element={<PageWrapper><AdminPage /></PageWrapper>} />
          <Route path="*" element={<AppLayout><PageWrapper><NotFound /></PageWrapper></AppLayout>} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
};

function App() {
  return (
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
  );
}

export default App;
