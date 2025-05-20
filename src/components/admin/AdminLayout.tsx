
import * as React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, LayoutDashboard, LogOut, Users } from "lucide-react";
import { useAuth } from "@/pages/ReservedAreaPage";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/area-riservata");
  };

  return (
    <div className="container px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Area Amministrazione</h1>
          <p className="text-muted-foreground">Gestisci le prenotazioni e visualizza le statistiche</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar navigation */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="space-y-2">
            <NavLink
              to="/area-riservata/dashboard"
              className={({ isActive }) =>
                `flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-accent ${
                  isActive ? "bg-accent font-medium" : ""
                }`
              }
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
            >
              <Calendar className="h-5 w-5" />
              <span>Prenotazioni</span>
            </NavLink>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 border rounded-lg p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
