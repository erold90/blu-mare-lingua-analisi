
import * as React from "react";
import { NavLink, useLocation, Link, useNavigate } from "react-router-dom";
import { 
  Calendar, 
  LayoutDashboard, 
  Image, 
  Settings, 
  EuroIcon, 
  History, 
  Home, 
  Menu, 
  CleaningIcon, 
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = React.useState(false);
  
  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  const handleLogout = React.useCallback(() => {
    logout();
    toast.success("Logout effettuato con successo");
    
    console.log("AdminLayout - Logout: reindirizzamento tra 300ms");
    
    // Chiude il menu mobile se aperto
    setMenuOpen(false);
    
    // Utilizziamo un approccio più diretto per il reindirizzamento
    setTimeout(() => {
      // Usando window.location per un refresh completo della pagina
      window.location.href = "/area-riservata";
    }, 300);
  }, [logout]);

  // Il resto del codice rimane invariato
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
        to="/area-riservata/calendario"
        className={({ isActive }) =>
          `flex items-center space-x-3 py-2.5 px-3 rounded-lg transition-colors ${
            isActive ? "bg-accent font-medium" : "hover:bg-muted"
          }`
        }
        onClick={() => setMenuOpen(false)}
      >
        <Calendar className="h-5 w-5" />
        <span>Calendario</span>
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
        to="/area-riservata/pulizie"
        className={({ isActive }) =>
          `flex items-center space-x-3 py-2.5 px-3 rounded-lg transition-colors ${
            isActive ? "bg-accent font-medium" : "hover:bg-muted"
          }`
        }
        onClick={() => setMenuOpen(false)}
      >
        <CleaningIcon className="h-5 w-5" />
        <span>Pulizie</span>
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
      <div className="mt-4 md:hidden px-3">
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </nav>
  );

  return (
    <div className="flex flex-col h-full min-h-screen">
      <div className="flex items-center justify-between py-3 px-3 mb-0 md:mb-4 bg-white shadow-sm z-10 sticky top-0">
        <div className="flex items-center space-x-3">
          {isMobile && (
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 pt-8">
                <div className="py-2">
                  <h2 className="text-lg font-medium mx-3 mb-4">Menu</h2>
                  <NavItems />
                </div>
              </SheetContent>
            </Sheet>
          )}
          <div>
            <h1 className="text-xl font-bold">Area Amministrazione</h1>
            <p className="text-muted-foreground text-xs hidden sm:block">
              {isActive('dashboard') ? 'Statistiche e metriche' : 
               isActive('calendario') ? 'Calendario unificato' :
               isActive('prenotazioni') ? 'Gestione prenotazioni' : 
               isActive('pulizie') ? 'Gestione pulizie' :
               isActive('prezzi') ? 'Gestione prezzi stagionali' :
               isActive('appartamenti') ? 'Gestione appartamenti' :
               isActive('impostazioni') ? 'Impostazioni generali' :
               isActive('log') ? 'Log attività' : ''}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Link to="/" className="text-black hover:underline">
            <Home className="h-5 w-5" />
            <span className="sr-only">Home</span>
          </Link>
          {!isMobile && (
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-1">
        {!isMobile && (
          <aside className="w-56 shrink-0 border-r h-[calc(100vh-70px)] sticky top-[60px] pt-5 px-2">
            <NavItems />
          </aside>
        )}
        <main className="flex-1 p-3 md:p-6">
          <div className="border rounded-lg h-full p-3 md:p-6 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
