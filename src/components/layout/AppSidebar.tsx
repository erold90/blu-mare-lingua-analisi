
import * as React from "react";
import { Link } from "react-router-dom";
import { Home, User, Calculator, Building } from "lucide-react";
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
  useSidebar
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { setOpenMobile } = useSidebar();
  
  // Function to close sidebar on mobile when a link is clicked
  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  return (
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
                  <Link to="/" onClick={handleLinkClick}>
                    <Home />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/appartamenti" onClick={handleLinkClick}>
                    <Building />
                    <span>Appartamenti</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/preventivo" onClick={handleLinkClick}>
                    <Calculator />
                    <span>Preventivo</span>
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
              <Link to="/area-riservata" onClick={handleLinkClick}>
                <User />
                <span>Area Riservata</span>
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
  );
}
