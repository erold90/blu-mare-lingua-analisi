import React from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ModernAdminSidebar } from "./ModernAdminSidebar";
import { ModernAdminHeader } from "./ModernAdminHeader";

const ModernAdminLayout = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-slate-50/30">
        <ModernAdminSidebar />
        
        <div className="flex-1 flex flex-col">
          <ModernAdminHeader />
          
          <main className="flex-1 p-8 overflow-auto">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ModernAdminLayout;