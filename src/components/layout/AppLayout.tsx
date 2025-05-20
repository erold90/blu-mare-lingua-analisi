
import { Outlet } from "react-router-dom";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { CookieConsent } from "@/components/CookieConsent";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

export function AppLayout() {
  const isMobile = useIsMobile();
  const [sidebarHovered, setSidebarHovered] = useState(false);
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col">
        <AppHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset className="flex-1 w-full transition-all duration-300">
            <main className="flex-1">
              <Outlet />
            </main>
          </SidebarInset>
        </div>
        <CookieConsent />
      </div>
    </SidebarProvider>
  );
}
