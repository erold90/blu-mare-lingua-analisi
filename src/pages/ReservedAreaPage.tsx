
import * as React from "react";
import { useNavigate, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

// Admin components imports
import AdminLayoutNew from "@/components/admin/AdminLayoutNew";
import AdminDashboard from "@/components/admin/dashboard/AdminDashboardNew";
import AdminReservations from "@/components/admin/AdminReservations";
import AdminPrices from "@/components/admin/AdminPrices";
import AdminApartments from "@/components/admin/AdminApartments";
import AdminSettings from "@/components/admin/AdminSettings";
import { AdminCleaningManagement } from "@/components/admin/cleaning/AdminCleaningManagement";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import { SiteImageManager } from "@/components/admin/images/SiteImageManager";

const LoginForm = () => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      console.log("LoginForm - Already authenticated, redirecting to dashboard");
      navigate("/area-riservata/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoggingIn) return;
    
    setIsLoggingIn(true);
    console.log("LoginForm - Attempting login with:", username);
    
    try {
      const loginSuccess = login(username, password);
      console.log("LoginForm - Login result:", loginSuccess);
      
      if (loginSuccess) {
        toast.success("Login effettuato con successo");
        console.log("LoginForm - Login successful, navigating to dashboard");
        navigate("/area-riservata/dashboard", { replace: true });
      } else {
        toast.error("Credenziali non valide");
        setIsLoggingIn(false);
      }
    } catch (error) {
      console.error("LoginForm - Login error:", error);
      toast.error("Errore durante il login");
      setIsLoggingIn(false);
    }
  };

  if (isAuthenticated) {
    return <div className="p-8 text-center">Reindirizzamento in corso alla dashboard...</div>;
  }

  return (
    <div className="container flex items-center justify-center min-h-[80vh] px-4 mt-8 md:mt-0 md:min-h-[70vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">Area Riservata</CardTitle>
          <CardDescription>
            Accedi all'area di amministrazione per gestire le prenotazioni.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Inserisci username" 
                required 
                autoComplete="username"
                disabled={isLoggingIn}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Inserisci password" 
                required 
                autoComplete="current-password"
                disabled={isLoggingIn}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Accesso in corso..." : "Accedi"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const ReservedAreaPage = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  const isAtAdminRoot = location.pathname === '/area-riservata' || location.pathname === '/area-riservata/';
  
  if (isAuthenticated && isAtAdminRoot) {
    return <Navigate to="/area-riservata/dashboard" replace />;
  }
  
  if (!isAuthenticated && !isAtAdminRoot) {
    return <Navigate to="/area-riservata" replace />;
  }
  
  if (!isAuthenticated && isAtAdminRoot) {
    return <LoginForm />;
  }
  
  return (
    <Routes>
      <Route path="/*" element={<AdminLayoutNew />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="prenotazioni" element={<AdminReservations />} />
        <Route path="appartamenti" element={<AdminApartments />} />
        <Route path="prezzi" element={<AdminPrices />} />
        <Route path="pulizie" element={<AdminCleaningManagement />} />
        <Route path="immagini" element={<SiteImageManager />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="impostazioni" element={<AdminSettings />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default ReservedAreaPage;
