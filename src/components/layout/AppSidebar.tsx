
import * as React from "react";
import { Link } from "react-router-dom";
import { Home, User, Calculator, Building, Mail, Shield, Cookie } from "lucide-react";
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
  const { setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();
  const [isHovered, setIsHovered] = React.useState(false);
  
  // Function to close sidebar on mobile when a link is clicked
  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  // For desktop only - hover interaction
  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsHovered(false);
    }
  };

  return (
    <div 
      className={`md:fixed md:left-0 md:top-0 md:bottom-0 md:z-30 transition-all duration-300 ease-in-out ${
        !isMobile && isHovered ? "md:w-64" : "md:w-14"
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Sidebar>
        <SidebarHeader className="border-b">
          <Link to="/" className="flex items-center gap-2 px-4 py-2" onClick={handleLinkClick}>
            <span className={`text-xl font-semibold transition-opacity duration-200 ${
              !isMobile && !isHovered ? "md:opacity-0" : "md:opacity-100"
            }`}>Villa Mare Blu</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className={`transition-opacity duration-200 ${
              !isMobile && !isHovered ? "md:opacity-0" : "md:opacity-100"
            }`}>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/" onClick={handleLinkClick} className="flex items-center">
                      <Home className="shrink-0" />
                      <span className={`ml-2 transition-opacity duration-200 ${
                        !isMobile && !isHovered ? "md:opacity-0 md:w-0 md:overflow-hidden" : "md:opacity-100 md:w-auto"
                      }`}>Home</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/appartamenti" onClick={handleLinkClick} className="flex items-center">
                      <Building className="shrink-0" />
                      <span className={`ml-2 transition-opacity duration-200 ${
                        !isMobile && !isHovered ? "md:opacity-0 md:w-0 md:overflow-hidden" : "md:opacity-100 md:w-auto"
                      }`}>Appartamenti</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/preventivo" onClick={handleLinkClick} className="flex items-center">
                      <Calculator className="shrink-0" />
                      <span className={`ml-2 transition-opacity duration-200 ${
                        !isMobile && !isHovered ? "md:opacity-0 md:w-0 md:overflow-hidden" : "md:opacity-100 md:w-auto"
                      }`}>Preventivo</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/contatti" onClick={handleLinkClick} className="flex items-center">
                      <Mail className="shrink-0" />
                      <span className={`ml-2 transition-opacity duration-200 ${
                        !isMobile && !isHovered ? "md:opacity-0 md:w-0 md:overflow-hidden" : "md:opacity-100 md:w-auto"
                      }`}>Contatti</span>
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
                  <User className="shrink-0" />
                  <span className={`ml-2 transition-opacity duration-200 ${
                    !isMobile && !isHovered ? "md:opacity-0 md:w-0 md:overflow-hidden" : "md:opacity-100 md:w-auto"
                  }`}>Area Riservata</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarSeparator />
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/privacy-policy" onClick={handleLinkClick} className="flex items-center">
                  <Shield className="shrink-0" />
                  <span className={`ml-2 transition-opacity duration-200 ${
                    !isMobile && !isHovered ? "md:opacity-0 md:w-0 md:overflow-hidden" : "md:opacity-100 md:w-auto"
                  }`}>Privacy Policy</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/cookie-policy" onClick={handleLinkClick} className="flex items-center">
                  <Cookie className="shrink-0" />
                  <span className={`ml-2 transition-opacity duration-200 ${
                    !isMobile && !isHovered ? "md:opacity-0 md:w-0 md:overflow-hidden" : "md:opacity-100 md:w-auto"
                  }`}>Cookie Policy</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <div className={`mt-4 text-xs text-muted-foreground transition-opacity duration-200 ${
            !isMobile && !isHovered ? "md:opacity-0" : "md:opacity-100"
          }`}>
            <div>© Villa Mare Blu {new Date().getFullYear()}</div>
            <div>Tutti i diritti riservati</div>
          </div>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}
