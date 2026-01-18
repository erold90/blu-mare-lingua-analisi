
import { useState, useEffect } from "react";
import { AppHeader } from "./AppHeader";
import WhatsAppButton from "./WhatsAppButton";
import { CookieConsent } from "@/components/CookieConsent";
import { ConditionalAnalytics } from "@/components/ConditionalAnalytics";
import { useLocation } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AnalyticsProvider } from "./AnalyticsProvider";
import { CookieProvider } from "@/contexts/CookieContext";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();

  // Se siamo nell'area riservata, non usiamo il sidebar principale
  const isReservedArea = location.pathname.startsWith('/area-riservata');

  if (isReservedArea) {
    return (
      <CookieProvider>
        <AnalyticsProvider>
          <div className="min-h-screen bg-background">
            {children}
            <WhatsAppButton />
            <CookieConsent />
            <ConditionalAnalytics />
          </div>
        </AnalyticsProvider>
      </CookieProvider>
    );
  }

  return (
    <CookieProvider>
      <AnalyticsProvider>
        <SidebarProvider defaultOpen={false}>
          <div className="min-h-screen bg-background flex w-full overflow-x-hidden max-w-full">
            <AppSidebar />
            <SidebarInset className="flex-1 overflow-x-hidden max-w-full">
              <AppHeader />
              <main className="flex-1 p-4 overflow-x-hidden max-w-full">
                {children}
              </main>
            </SidebarInset>
            <WhatsAppButton />
            <CookieConsent />
            <ConditionalAnalytics />
          </div>
        </SidebarProvider>
      </AnalyticsProvider>
    </CookieProvider>
  );
};

export default AppLayout;
