
import { useState, useEffect, useCallback } from "react";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("adminAuth") === "true";
  });
  const [adminCredentials, setAdminCredentials] = useState({
    username: "admin",
    password: "205647"
  });
  
  // Load admin credentials from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("adminSettings");
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setAdminCredentials({
          username: settings.username || "admin",
          password: settings.password || "205647"
        });
      } catch (error) {
        console.error("Failed to parse saved admin settings:", error);
      }
    }
    
    // Controlla anche lo stato di autenticazione all'avvio
    const authStatus = localStorage.getItem("adminAuth") === "true";
    console.log("Stato autenticazione all'avvio:", authStatus);
    setIsAuthenticated(authStatus);
  }, []);

  const login = useCallback((username: string, password: string) => {
    if (username === adminCredentials.username && password === adminCredentials.password) {
      localStorage.setItem("adminAuth", "true");
      setIsAuthenticated(true);
      console.log("Login effettuato con successo");
      return true;
    }
    console.log("Credenziali non valide");
    return false;
  }, [adminCredentials]);

  const logout = useCallback(() => {
    localStorage.removeItem("adminAuth");
    setIsAuthenticated(false);
    console.log("Logout effettuato");
  }, []);

  return { isAuthenticated, login, logout, adminCredentials };
};
