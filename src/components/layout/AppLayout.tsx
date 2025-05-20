
import { Outlet } from "react-router-dom";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { CookieConsent } from "@/components/CookieConsent";

export function AppLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col">
        <AppHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset className="flex-1">
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
