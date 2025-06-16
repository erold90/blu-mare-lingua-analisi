
import * as React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "@/components/ui/sidebar";

export function AppHeader() {
  const isMobile = useIsMobile();
  const { open } = useSidebar();

  return (
    <header className={`fixed top-0 z-40 w-full ${isMobile ? "h-12" : "h-16"}`}>
      <div className={`container ${isMobile ? "p-0" : ""} flex items-center ${isMobile ? "h-12" : "h-16"}`}>
        <div className={`flex items-center ${isMobile ? "ml-2" : open ? "ml-[16rem]" : "ml-2"} mt-2 transition-all duration-300`}>
          <SidebarTrigger />
        </div>
      </div>
    </header>
  );
}
