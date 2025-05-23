
import * as React from "react";
import { useNavigate, Link, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";

// Admin components imports
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminReservations from "@/components/admin/AdminReservations";
import AdminPrices from "@/components/admin/AdminPrices";
import AdminApartments from "@/components/admin/AdminApartments";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminLog from "@/components/admin/AdminLog";
import AdminLayout from "@/components/admin/AdminLayout";
// Nuovi componenti
import AdminCalendar from "@/components/admin/calendar/AdminCalendar";
import AdminCleaningManagement from "@/components/admin/cleaning/AdminCleaningManagement";
import ApiTestPage from '../pages/api-test';

const LoginForm = () => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      console.log("User already authenticated, redirecting to dashboard");
      navigate("/area-riservata/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoggingIn) return;
    
    setIsLoggingIn(true);
    console.log("Attempting login with:", username);
    
    try {
      const loginSuccess = login(username, password);
      
      if (loginSuccess) {
        toast.success("Login effettuato con successo");
        console.log("Login successful, forcing redirect to dashboard");
        
        // Piccolo delay per assicurarsi che lo stato si aggiorni
        setTimeout(() => {
          navigate("/area-riservata/dashboard", { replace: true });
        }, 100);
      } else {
        toast.error("Credenziali non valide");
        setIsLoggingIn(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Errore durante il login");
      setIsLoggingIn(false);
    }
  };

  // Don't show login form if user is authenticated
  if (isAuthenticated) {
    return <div>Reindirizzamento in corso...</div>;
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
  
  console.log("ReservedAreaPage - Stato autenticazione:", isAuthenticated);
  console.log("ReservedAreaPage - Percorso attuale:", location.pathname);
  
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            <Navigate to="/area-riservata/dashboard" replace />
          ) : (
            <LoginForm />
          )
        } 
      />
      <Route 
        path="/*" 
        element={
          isAuthenticated ? (
            <AdminLayout>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="prenotazioni" element={<AdminReservations />} />
                <Route path="prezzi" element={<AdminPrices />} />
                <Route path="appartamenti" element={<AdminApartments />} />
                <Route path="impostazioni" element={<AdminSettings />} />
                <Route path="log" element={<AdminLog />} />
                <Route path="calendario" element={<AdminCalendar />} />
                <Route path="pulizie" element={<AdminCleaningManagement />} />
                <Route path="api-test" element={<ApiTestPage />} />
                <Route path="*" element={<Navigate to="/area-riservata/dashboard" />} />
              </Routes>
            </AdminLayout>
          ) : (
            <Navigate to="/area-riservata" replace />
          )
        } 
      />
    </Routes>
  );
};

export default ReservedAreaPage;
