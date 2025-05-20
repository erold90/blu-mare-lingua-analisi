
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
    if (isMobile) {
      setOpenMobile(false);
    }
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
      className={`transition-all duration-500 ease-in-out fixed top-16 left-0 bottom-0 z-30 ${
        isMobile ? "w-0" : "md:w-0"
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className={`absolute top-0 left-0 h-full overflow-hidden transition-all duration-500 ease-in-out ${
          isHovered ? "w-52 opacity-100" : "w-0 opacity-0"
        }`}
      >
        <Sidebar>
          <SidebarHeader className="border-b">
            <Link to="/" className="flex items-center gap-2 px-4 py-2" onClick={handleLinkClick}>
              <span className="text-xl font-semibold">Villa Mare Blu</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/" onClick={handleLinkClick} className="flex items-center">
                        <Home className="shrink-0" />
                        <span className="ml-2">Home</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/appartamenti" onClick={handleLinkClick} className="flex items-center">
                        <Building className="shrink-0" />
                        <span className="ml-2">Appartamenti</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/preventivo" onClick={handleLinkClick} className="flex items-center">
                        <Calculator className="shrink-0" />
                        <span className="ml-2">Preventivo</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/contatti" onClick={handleLinkClick} className="flex items-center">
                        <Mail className="shrink-0" />
                        <span className="ml-2">Contatti</span>
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
                    <span className="ml-2">Area Riservata</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarSeparator />
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/privacy-policy" onClick={handleLinkClick} className="flex items-center">
                    <Shield className="shrink-0" />
                    <span className="ml-2">Privacy Policy</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/cookie-policy" onClick={handleLinkClick} className="flex items-center">
                    <Cookie className="shrink-0" />
                    <span className="ml-2">Cookie Policy</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <div className="mt-4 text-xs text-muted-foreground">
              <div>© Villa Mare Blu {new Date().getFullYear()}</div>
              <div>Tutti i diritti riservati</div>
            </div>
          </SidebarFooter>
        </Sidebar>
      </div>
      
      {/* Small indicator strip that appears on the left edge of the screen */}
      {!isMobile && (
        <div 
          className={`absolute top-0 left-0 h-full w-1 bg-primary/20 hover:bg-primary/40 transition-colors duration-300`}
          onMouseEnter={handleMouseEnter}
        />
      )}
    </div>
  );
}
