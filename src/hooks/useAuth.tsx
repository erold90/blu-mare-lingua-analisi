
import { useState, useEffect, useCallback, useRef } from "react";

export const useAuth = () => {
  // Leggiamo immediatamente lo stato di autenticazione dal localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const authStatus = localStorage.getItem("adminAuth") === "true";
    console.log("Inizializzazione stato autenticazione:", authStatus);
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
  
  // Funzione di login completamente riscritta per essere più robusta
  const login = useCallback((username: string, password: string) => {
    // Preveniamo login multipli simultanei
    if (authChangeInProgress.current) return false;
    
    if (username === adminCredentials.username && password === adminCredentials.password) {
      authChangeInProgress.current = true;
      
      // Prima salviamo lo stato nel localStorage
      localStorage.setItem("adminAuth", "true");
      console.log("Login: Impostazione localStorage completata");
      
      // Poi aggiorniamo lo stato React
      setIsAuthenticated(true);
      console.log("Login: Stato autenticazione impostato a TRUE");
      
      // Reset del flag dopo un breve ritardo
      setTimeout(() => {
        authChangeInProgress.current = false;
      }, 500);
      
      return true;
    }
    
    console.log("Login: Credenziali non valide");
    return false;
  }, [adminCredentials]);

  // Funzione di logout con la stessa logica protettiva
  const logout = useCallback(() => {
    if (authChangeInProgress.current) return;
    
    authChangeInProgress.current = true;
    
    // Prima rimuoviamo dal localStorage
    localStorage.removeItem("adminAuth");
    console.log("Logout: localStorage rimosso");
    
    // Poi aggiorniamo lo stato React
    setIsAuthenticated(false);
    console.log("Logout: Stato autenticazione impostato a FALSE");
    
    // Reset del flag dopo un breve ritardo
    setTimeout(() => {
      authChangeInProgress.current = false;
    }, 500);
  }, []);

  return { isAuthenticated, login, logout, adminCredentials };
};
