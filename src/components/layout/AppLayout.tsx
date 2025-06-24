
import React, { useState, useEffect } from "react";
import { AppHeader } from "./AppHeader";
import WhatsAppButton from "./WhatsAppButton";
import { CookieConsent } from "@/components/CookieConsent";
import { useLocation } from "react-router-dom";
import { usePageTracking } from "@/hooks/analytics/usePageTracking";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AnalyticsProvider } from "./AnalyticsProvider";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  usePageTracking();
  const [showCookieConsent, setShowCookieConsent] = useState(false);

  useEffect(() => {
    const hasAcceptedCookies = localStorage.getItem("cookieConsent");
    setShowCookieConsent(!hasAcceptedCookies);
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem("cookieConsent", "true");
    setShowCookieConsent(false);
  };

  // Se siamo nell'area riservata, non usiamo il sidebar principale
  const isReservedArea = location.pathname.startsWith('/area-riservata');

  if (isReservedArea) {
    return (
      <AnalyticsProvider>
        <div className="min-h-screen bg-background">
          {children}
          <WhatsAppButton />
          {showCookieConsent && (
            <CookieConsent onAccept={handleAcceptCookies} />
          )}
        </div>
      </AnalyticsProvider>
    );
  }

  return (
    <AnalyticsProvider>
      <SidebarProvider defaultOpen={false}>
        <div className="min-h-screen bg-background flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <AppHeader />
            <main className="flex-1 p-4">
              {children}
            </main>
          </SidebarInset>
          <WhatsAppButton />
          {showCookieConsent && (
            <CookieConsent onAccept={handleAcceptCookies} />
          )}
        </div>
      </SidebarProvider>
    </AnalyticsProvider>
  );
};

export default AppLayout;
