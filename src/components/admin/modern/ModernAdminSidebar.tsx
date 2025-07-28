import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Calendar,
  Building,
  Euro,
  Sparkles,
  BarChart3,
  Settings,
  LogOut,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "../../auth/AdminAuthProvider";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/area-riservata/dashboard",
    icon: LayoutDashboard,
    description: "Panoramica generale"
  },
  {
    title: "Prenotazioni", 
    url: "/area-riservata/prenotazioni",
    icon: Calendar,
    description: "Gestisci prenotazioni"
  },
  {
    title: "Appartamenti",
    url: "/area-riservata/appartamenti", 
    icon: Building,
    description: "Gestisci appartamenti"
  },
  {
    title: "Prezzi",
    url: "/area-riservata/prezzi",
    icon: Euro,
    description: "Gestisci tariffe"
  },
  {
    title: "Pulizie",
    url: "/area-riservata/pulizie",
    icon: Sparkles,
    description: "Gestisci pulizie"
  },
  {
    title: "Analytics",
    url: "/area-riservata/analytics",
    icon: BarChart3,
    description: "Statistiche e report"
  },
  {
    title: "Impostazioni",
    url: "/area-riservata/impostazioni",
    icon: Settings,
    description: "Configurazioni"
  },
];

export function ModernAdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAdminAuth();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar className="bg-white border-r border-slate-200/60 shadow-sm">
      <SidebarHeader className="border-b border-slate-200/60 p-6">
        <div className="flex items-center gap-3">
          <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg">
            <Building className="size-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900">Villa Mareblu</span>
              <span className="text-xs text-slate-500">Area Amministrativa</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/" 
                    className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all duration-200"
                  >
                    <Home className="h-4 w-4" />
                    {!collapsed && <span className="text-sm font-medium">Torna al Sito</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="h-px bg-slate-200/60 my-4" />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                          active 
                            ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100" 
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                        end
                      >
                        <item.icon className={`h-4 w-4 ${active ? "text-blue-600" : ""}`} />
                        {!collapsed && (
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{item.title}</span>
                            <span className="text-xs text-slate-500">{item.description}</span>
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-slate-200/60">
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg h-auto py-2.5"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="text-sm font-medium">Esci</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}