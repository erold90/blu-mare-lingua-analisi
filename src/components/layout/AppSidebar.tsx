
import * as React from "react";
import { Link } from "react-router-dom";
import { Home, User, Calculator, Building, Mail, Shield, Cookie, Info, BookOpen } from "lucide-react";
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

export function AppSidebar() {
  const { setOpenMobile, setOpen } = useSidebar();
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
        <Link to="/" className="flex items-center gap-2 px-4 py-3" onClick={handleLinkClick}>
          <span className="font-serif text-xl font-semibold text-sidebar-primary">Villa MareBlu</span>
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
                  <Link to="/chi-siamo" onClick={handleLinkClick} className="flex items-center">
                    <Info className="shrink-0 text-sidebar-primary" />
                    <span className="ml-2">Chi Siamo</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/guide" onClick={handleLinkClick} className="flex items-center">
                    <BookOpen className="shrink-0 text-sidebar-primary" />
                    <span className="ml-2">Guide Salento</span>
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
