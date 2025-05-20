
import * as React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Re-export all sidebar components
export * from "./context";
export * from "./sidebar";
export * from "./ui-components";
export * from "./group-components";
export * from "./menu-components";
export * from "./submenu-components";

// Export our styled TooltipProvider wrapper
export const StyledTooltipProvider: React.FC<
  React.ComponentProps<typeof TooltipProvider>
> = ({ children, ...props }) => {
  return (
    <TooltipProvider delayDuration={0} {...props}>
      <div
        className={cn(
          "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar"
        )}
      >
        {children}
      </div>
    </TooltipProvider>
  );
};

// Export a wrapped SidebarProvider that includes the TooltipProvider
export { SidebarProvider } from "./context";
