
import * as React from "react";
import { Link } from "react-router-dom";
import { Home, User, Calculator, Building, Mail, Shield, Cookie, Server } from "lucide-react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarSeparator,
  useSidebar
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export const sidebarItems = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: "layout-dashboard", // Home icon
    submenu: false,
  },
  {
    title: "Prenotazioni",
    path: "/admin/reservations",
    icon: "calendar", // Calendar icon
    submenu: false,
  },
  {
    title: "Pulizie",
    path: "/admin/cleaning",
    icon: "broom", // Brush icon
    submenu: false,
  },
  {
    title: "Appartamenti",
    path: "/admin/apartments",
    icon: "home", // Home icon
    submenu: false,
  },
  {
    title: "Prezzi",
    path: "/admin/prices",
    icon: "tag", // Tag icon
    submenu: false,
  },
  {
    title: "Calendario",
    path: "/admin/calendar",
    icon: "calendar-days", // Calendar icon
    submenu: false,
  },
  {
    title: "Database",
    path: "/database-test",
    icon: "database", // Database icon
    submenu: false,
  },
  {
    title: "Test API",
    path: "/api-test",
    icon: "server", // Server icon
    submenu: false,
  },
  {
    title: "Impostazioni",
    path: "/admin/settings",
    icon: "settings", // Settings icon
    submenu: false,
  },
];

export function AppSidebar() {
  const { setOpenMobile, open, setOpen } = useSidebar();
  const isMobile = useIsMobile();
  
  // Function to close sidebar when a link is clicked
  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    } else {
      setOpen(false);
    }
  };

  return (
    <Sidebar variant="floating">
      <SidebarHeader className="border-b">
        <Link to="/" className={`flex items-center gap-2 px-4 py-3 ${isMobile ? "justify-center" : ""}`} onClick={handleLinkClick}>
          <span className={`font-serif text-xl font-semibold text-sidebar-primary ${isMobile ? "text-center" : ""}`}>Villa MareBlu</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-serif">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/" onClick={handleLinkClick} className="flex items-center">
                    <Home className="shrink-0 text-sidebar-primary" />
                    <span className="ml-2">Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/appartamenti" onClick={handleLinkClick} className="flex items-center">
                    <Building className="shrink-0 text-sidebar-primary" />
                    <span className="ml-2">Appartamenti</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/preventivo" onClick={handleLinkClick} className="flex items-center">
                    <Calculator className="shrink-0 text-sidebar-primary" />
                    <span className="ml-2">Preventivo</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/contatti" onClick={handleLinkClick} className="flex items-center">
                    <Mail className="shrink-0 text-sidebar-primary" />
                    <span className="ml-2">Contatti</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/api-test" onClick={handleLinkClick} className="flex items-center">
                    <Server className="shrink-0 text-sidebar-primary" />
                    <span className="ml-2">Test API</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/area-riservata" onClick={handleLinkClick} className="flex items-center">
                <User className="shrink-0 text-sidebar-primary" />
                <span className="ml-2">Area Riservata</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarSeparator />
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/privacy-policy" onClick={handleLinkClick} className="flex items-center">
                <Shield className="shrink-0 text-sidebar-primary" />
                <span className="ml-2">Privacy Policy</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/cookie-policy" onClick={handleLinkClick} className="flex items-center">
                <Cookie className="shrink-0 text-sidebar-primary" />
                <span className="ml-2">Cookie Policy</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="mt-4 text-xs text-muted-foreground">
          <div>© Villa MareBlu {new Date().getFullYear()}</div>
          <div>Tutti i diritti riservati</div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
