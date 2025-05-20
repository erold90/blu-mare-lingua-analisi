
import * as React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, LayoutDashboard, LogOut, Menu } from "lucide-react";
import { useAuth } from "@/pages/ReservedAreaPage";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate("/area-riservata");
  };

  const NavItems = () => (
    <nav className="space-y-2">
      <NavLink
        to="/area-riservata/dashboard"
        className={({ isActive }) =>
          `flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-accent ${
            isActive ? "bg-accent font-medium" : ""
          }`
        }
        onClick={() => setMenuOpen(false)}
      >
        <LayoutDashboard className="h-5 w-5" />
        <span>Dashboard</span>
      </NavLink>
      <NavLink
        to="/area-riservata/prenotazioni"
        className={({ isActive }) =>
          `flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-accent ${
            isActive ? "bg-accent font-medium" : ""
          }`
        }
        onClick={() => setMenuOpen(false)}
      >
        <Calendar className="h-5 w-5" />
        <span>Prenotazioni</span>
      </NavLink>
    </nav>
  );

  return (
    <div className="px-4 py-4">
      <div className="flex flex-col mb-4 gap-2">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">Area Amministrazione</h1>
          <p className="text-muted-foreground text-sm">Gestisci le prenotazioni e visualizza le statistiche</p>
        </div>
        <Button variant="outline" onClick={handleLogout} size={isMobile ? "sm" : "default"} className="self-start">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {/* Mobile navigation */}
        {isMobile ? (
          <div className="mb-4">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full flex justify-between items-center">
                  <span>Menu di navigazione</span>
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px]">
                <div className="py-4">
                  <h2 className="text-lg font-medium mb-4">Menu</h2>
                  <NavItems />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        ) : (
          /* Desktop sidebar navigation */
          <aside className="w-64 shrink-0">
            <NavItems />
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1 border rounded-lg p-3 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
