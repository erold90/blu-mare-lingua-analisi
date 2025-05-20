
import * as React from "react";
import { useNavigate, Link, Routes, Route, Navigate } from "react-router-dom";
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

const LoginForm = () => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (login(username, password)) {
      toast.success("Login effettuato con successo");
      // Immediate navigation without setTimeout
      navigate("/area-riservata/dashboard");
    } else {
      toast.error("Credenziali non valide");
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-[70vh] px-4">
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
              />
            </div>
            <Button type="submit" className="w-full">Accedi</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const ReservedAreaPage = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={!isAuthenticated ? <LoginForm /> : <Navigate to="/area-riservata/dashboard" replace />} />
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
