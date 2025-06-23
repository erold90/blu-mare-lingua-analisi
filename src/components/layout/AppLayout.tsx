import React, { useState, useEffect } from "react";
import AppHeader from "./AppHeader";
import WhatsAppButton from "../WhatsAppButton";
import CookieConsent from "@/components/CookieConsent";
import { useLocation } from "react-router-dom";
import { usePageVisitTracker } from "@/hooks/usePageVisitTracker";

interface AppLayoutProps {
  children: React.ReactNode;
}

import { AnalyticsProvider } from "./AnalyticsProvider";

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  usePageVisitTracker();
  const [showCookieConsent, setShowCookieConsent] = useState(false);

  useEffect(() => {
    const hasAcceptedCookies = localStorage.getItem("cookieConsent");
    setShowCookieConsent(!hasAcceptedCookies);
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem("cookieConsent", "true");
    setShowCookieConsent(false);
  };

  return (
    <AnalyticsProvider>
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="flex-1">
          {children}
        </main>
        <WhatsAppButton />
        <CookieConsent />
      </div>
    </AnalyticsProvider>
  );
};

export default AppLayout;
