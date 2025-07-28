import * as React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Home,
  LayoutDashboard,
  Calendar,
  Building,
  Euro,
  Sparkles,
  Images,
  BarChart3,
  Settings,
  Users,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/area-riservata/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Prenotazioni", 
    url: "/area-riservata/prenotazioni",
    icon: Calendar,
  },
  {
    title: "Appartamenti",
    url: "/area-riservata/appartamenti", 
    icon: Building,
  },
  {
    title: "Prezzi",
    url: "/area-riservata/prezzi",
    icon: Euro,
  },
  {
    title: "Pulizie",
    url: "/area-riservata/pulizie",
    icon: Sparkles,
  },
  {
    title: "Immagini",
    url: "/area-riservata/immagini",
    icon: Images,
  },
  {
    title: "Analytics",
    url: "/area-riservata/analytics",
    icon: BarChart3,
  },
  {
    title: "Impostazioni",
    url: "/area-riservata/impostazioni",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { logout } = useAuth();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent";

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building className="size-4" />
          </div>
          {!collapsed && (
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Villa Mareblu</span>
              <span className="truncate text-xs text-muted-foreground">Area Admin</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigazione</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/" 
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Home className="h-4 w-4" />
                    {!collapsed && <span>Torna alla Home</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Gestione</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavCls}
                      end
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <Button 
          variant="ghost" 
          onClick={logout}
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Esci</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}