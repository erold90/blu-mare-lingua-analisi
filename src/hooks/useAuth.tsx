
import { useState, useEffect, useCallback, useRef } from "react";

export const useAuth = () => {
  // Singleton pattern to ensure consistent auth state across components
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const authStatus = localStorage.getItem("adminAuth") === "true";
    console.log("useAuth - Initial auth state:", authStatus);
    return authStatus;
  });
  
  const [adminCredentials, setAdminCredentials] = useState({
    username: "admin",
    password: "205647"
  });
  
  // Riferimento per evitare chiamate duplicate durante le transizioni di stato
  const authChangeInProgress = useRef(false);
  
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
  }, []);
  
  // Effect per monitorare cambiamenti nel localStorage
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "adminAuth") {
        const authStatus = event.newValue === "true";
        console.log("useAuth - Storage changed externally, new auth status:", authStatus);
        setIsAuthenticated(authStatus);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Funzione di login migliorata per garantire aggiornamento immediato dello stato
  const login = useCallback((username: string, password: string) => {
    // Preveniamo login multipli simultanei
    if (authChangeInProgress.current) {
      console.log("useAuth - Login already in progress, skipping");
      return false;
    }
    
    console.log("useAuth - Attempting login for:", username);
    
    if (username === adminCredentials.username && password === adminCredentials.password) {
      authChangeInProgress.current = true;
      
      console.log("useAuth - Credenziali corrette, aggiornamento stato...");
      
      // Prima salviamo lo stato nel localStorage
      localStorage.setItem("adminAuth", "true");
      
      // Imposta immediatamente lo stato di autenticazione
      setIsAuthenticated(true);
      console.log("useAuth - Authentication state updated to:", true);
      
      // Reset del flag
      setTimeout(() => {
        authChangeInProgress.current = false;
      }, 100);
      
      return true;
    }
    
    console.log("useAuth - Credenziali non valide");
    return false;
  }, [adminCredentials]);

  // Funzione di logout con la stessa logica protettiva
  const logout = useCallback(() => {
    if (authChangeInProgress.current) {
      console.log("useAuth - Logout already in progress, skipping");
      return;
    }
    
    authChangeInProgress.current = true;
    
    console.log("useAuth - Executing logout");
    
    // Prima rimuoviamo dal localStorage
    localStorage.removeItem("adminAuth");
    
    // Poi aggiorniamo lo stato React
    setIsAuthenticated(false);
    console.log("useAuth - Authentication state updated to:", false);
    
    // Reset del flag
    setTimeout(() => {
      authChangeInProgress.current = false;
    }, 100);
  }, []);

  // Log dello stato corrente per debugging
  useEffect(() => {
    console.log("useAuth - Current authentication state updated:", isAuthenticated);
  }, [isAuthenticated]);

  return { isAuthenticated, login, logout, adminCredentials };
};
