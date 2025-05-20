
import * as React from "react";
import { NavLink, useLocation, Link } from "react-router-dom";
import { Calendar, LayoutDashboard, Image, Settings, EuroIcon, History } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = React.useState(false);
  
  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  const NavItems = () => (
    <nav className="space-y-1">
      <NavLink
        to="/area-riservata/dashboard"
        className={({ isActive }) =>
          `flex items-center space-x-3 py-2.5 px-3 rounded-lg transition-colors ${
            isActive ? "bg-accent font-medium" : "hover:bg-muted"
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
          `flex items-center space-x-3 py-2.5 px-3 rounded-lg transition-colors ${
            isActive ? "bg-accent font-medium" : "hover:bg-muted"
          }`
        }
        onClick={() => setMenuOpen(false)}
      >
        <Calendar className="h-5 w-5" />
        <span>Prenotazioni</span>
      </NavLink>
      <NavLink
        to="/area-riservata/prezzi"
        className={({ isActive }) =>
          `flex items-center space-x-3 py-2.5 px-3 rounded-lg transition-colors ${
            isActive ? "bg-accent font-medium" : "hover:bg-muted"
          }`
        }
        onClick={() => setMenuOpen(false)}
      >
        <EuroIcon className="h-5 w-5" />
        <span>Prezzi</span>
      </NavLink>
      <NavLink
        to="/area-riservata/appartamenti"
        className={({ isActive }) =>
          `flex items-center space-x-3 py-2.5 px-3 rounded-lg transition-colors ${
            isActive ? "bg-accent font-medium" : "hover:bg-muted"
          }`
        }
        onClick={() => setMenuOpen(false)}
      >
        <Image className="h-5 w-5" />
        <span>Appartamenti</span>
      </NavLink>
      <NavLink
        to="/area-riservata/impostazioni"
        className={({ isActive }) =>
          `flex items-center space-x-3 py-2.5 px-3 rounded-lg transition-colors ${
            isActive ? "bg-accent font-medium" : "hover:bg-muted"
          }`
        }
        onClick={() => setMenuOpen(false)}
      >
        <Settings className="h-5 w-5" />
        <span>Impostazioni</span>
      </NavLink>
      <NavLink
        to="/area-riservata/log"
        className={({ isActive }) =>
          `flex items-center space-x-3 py-2.5 px-3 rounded-lg transition-colors ${
            isActive ? "bg-accent font-medium" : "hover:bg-muted"
          }`
        }
        onClick={() => setMenuOpen(false)}
      >
        <History className="h-5 w-5" />
        <span>Log</span>
      </NavLink>
    </nav>
  );

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-1rem)] py-3">
      <div className="flex items-center justify-between px-3 mb-4">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold">Area Amministrazione</h1>
          <p className="text-muted-foreground text-xs">
            {isActive('dashboard') ? 'Statistiche e metriche' : 
             isActive('prenotazioni') ? 'Gestione prenotazioni' : 
             isActive('prezzi') ? 'Gestione prezzi stagionali' :
             isActive('appartamenti') ? 'Gestione appartamenti' :
             isActive('impostazioni') ? 'Impostazioni generali' :
             isActive('log') ? 'Log attività' : ''}
          </p>
        </div>
        
        <div className="flex space-x-4">
          <Link to="/" className="text-black hover:underline">Home</Link>
          <Link to="/appartamenti" className="text-black hover:underline">Appartamenti</Link>
          <Link to="/preventivo" className="text-black hover:underline">Preventivo</Link>
        </div>
      </div>

      <div className="flex flex-1">
        {isMobile ? (
          <div className="w-full px-2 pb-2">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full flex justify-between items-center mb-3">
                  <span>
                    {isActive('dashboard') ? 'Dashboard' : 
                     isActive('prenotazioni') ? 'Prenotazioni' :
                     isActive('prezzi') ? 'Prezzi' :
                     isActive('appartamenti') ? 'Appartamenti' :
                     isActive('impostazioni') ? 'Impostazioni' :
                     isActive('log') ? 'Log' : ''}
                  </span>
                  <span className="h-5 w-5">≡</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 pt-8">
                <div className="py-2">
                  <h2 className="text-lg font-medium mx-3 mb-4">Menu</h2>
                  <NavItems />
                </div>
              </SheetContent>
            </Sheet>
            
            <div className="border rounded-lg p-3 h-full overflow-hidden">
              {children}
            </div>
          </div>
        ) : (
          <div className="flex h-full w-full gap-4 px-4">
            <aside className="w-56 shrink-0">
              <NavItems />
            </aside>
            <main className="flex-1 border rounded-lg p-6 overflow-auto">
              {children}
            </main>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLayout;
