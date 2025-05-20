
import * as React from "react";
import { Menu } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export function AppHeader() {
  const isMobile = useIsMobile();

  return (
    <header className={`fixed top-0 z-40 w-full ${isMobile ? "h-12" : "h-16"}`}>
      <div className={`container ${isMobile ? "p-0" : ""} flex items-center ${isMobile ? "h-12" : "h-16"}`}>
        {isMobile ? (
          <div className="flex items-center ml-2 mt-2">
            <SidebarTrigger />
          </div>
        ) : (
          <nav className="flex items-center gap-6 ml-auto">
            <a href="/" className="font-medium text-white hover:text-primary transition-colors">
              Home
            </a>
            <a href="/appartamenti" className="font-medium text-white hover:text-primary transition-colors">
              Appartamenti
            </a>
            <a href="/preventivo" className="font-medium text-white hover:text-primary transition-colors">
              Preventivo
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
