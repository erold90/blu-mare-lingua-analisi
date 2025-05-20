
import * as React from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export function AppHeader() {
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur bg-transparent">
      <div className="container flex h-16 items-center">
        <div className="flex items-center">
          <SidebarTrigger className="md:hidden" />
        </div>
        
        {!isMobile && (
          <nav className="flex items-center gap-6 ml-auto">
            <Link to="/" className="font-medium text-white hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/appartamenti" className="font-medium text-white hover:text-primary transition-colors">
              Appartamenti
            </Link>
            <Link to="/preventivo" className="font-medium text-white hover:text-primary transition-colors">
              Preventivo
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
