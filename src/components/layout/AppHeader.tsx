
import * as React from "react";
import { Link } from "react-router-dom";
import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export function AppHeader() {
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          <Link to="/" className="flex items-center gap-2 text-xl font-semibold">
            <span className="text-primary">Villa Mare Blu</span>
          </Link>
        </div>
        
        {!isMobile && (
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/appartamenti" className="font-medium hover:text-primary transition-colors">
              Appartamenti
            </Link>
            <Link to="/preventivo" className="font-medium hover:text-primary transition-colors">
              Preventivo
            </Link>
            <Link to="/area-riservata" className="font-medium hover:text-primary transition-colors">
              Area Riservata
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/area-riservata">
              <User className="h-4 w-4 mr-1" /> Area Riservata
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
