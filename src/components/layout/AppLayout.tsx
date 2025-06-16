
import { Outlet, useLocation } from "react-router-dom";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { CookieConsent } from "@/components/CookieConsent";
import WhatsAppButton from "./WhatsAppButton";
import { useIsMobile } from "@/hooks/use-mobile";

export function AppLayout() {
  const isMobile = useIsMobile();
  const location = useLocation();
  
  // Check if we're in the reserved area
  const isReservedArea = location.pathname.includes('/area-riservata');
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col">
        {!isReservedArea && <AppHeader />}
        <div className="flex flex-1">
          {!isReservedArea && <AppSidebar />}
          <SidebarInset className="flex-1 w-full transition-all duration-300">
            <main className="flex-1">
              <Outlet />
            </main>
          </SidebarInset>
        </div>
        <CookieConsent />
        {!isReservedArea && <WhatsAppButton />}
      </div>
    </SidebarProvider>
  );
}
