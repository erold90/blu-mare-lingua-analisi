
import * as React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "@/components/ui/sidebar";

export function AppHeader() {
  const isMobile = useIsMobile();
  const { open } = useSidebar();

  return (
    <header className={`sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${isMobile ? "h-12" : "h-16"}`}>
      <div className={`container flex items-center ${isMobile ? "h-12 px-4" : "h-16 px-6"}`}>
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold">Villa MareBlu</h1>
          </div>
        </div>
      </div>
    </header>
  );
}
