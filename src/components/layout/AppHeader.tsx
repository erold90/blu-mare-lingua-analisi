
import * as React from "react";
import { Menu } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export function AppHeader() {
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-40 w-full bg-transparent">
      <div className="container flex h-16 items-center">
        {isMobile ? (
          <div className="flex items-center ml-2">
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
