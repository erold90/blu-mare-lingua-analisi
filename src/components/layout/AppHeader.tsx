
import * as React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "@/components/ui/sidebar";
import { Phone } from "lucide-react";

export function AppHeader() {
  const isMobile = useIsMobile();
  const { open } = useSidebar();

  return (
    <header className={`fixed top-0 z-40 w-full bg-white/95 backdrop-blur-sm border-b ${isMobile ? "h-12" : "h-16"}`}>
      <div className={`container ${isMobile ? "p-0" : ""} flex items-center justify-between ${isMobile ? "h-12" : "h-16"}`}>
        <div className={`flex items-center ${isMobile ? "ml-2" : open ? "ml-[16rem]" : "ml-2"} transition-all duration-300`}>
          <SidebarTrigger />
        </div>
        
        {/* Telefono click-to-call */}
        <div className="mr-4">
          <a 
            href="tel:+393937767749" 
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition-colors shadow-lg"
          >
            <Phone className="h-4 w-4" />
            <span className={`font-semibold ${isMobile ? "text-sm" : ""}`}>
              {isMobile ? "Chiama" : "+39 393 776 7749"}
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}
