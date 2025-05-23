
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  adminCredentials: {
    username: string;
    password: string;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Singleton pattern per garantire stato consistente
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const authStatus = localStorage.getItem("adminAuth") === "true";
    console.log("AuthProvider - Initial auth state:", authStatus);
    return authStatus;
  });
  
  const [adminCredentials, setAdminCredentials] = useState({
    username: "admin",
    password: "205647"
  });
  
  // Riferimento per evitare chiamate duplicate
  const authChangeInProgress = useRef(false);
  
  // Carica credenziali admin dal localStorage
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
  
  // Monitora cambiamenti nel localStorage
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "adminAuth") {
        const authStatus = event.newValue === "true";
        console.log("AuthProvider - Storage changed externally, new auth status:", authStatus);
        setIsAuthenticated(authStatus);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // Funzione di login migliorata
  const login = useCallback((username: string, password: string) => {
    if (authChangeInProgress.current) {
      console.log("AuthProvider - Login already in progress, skipping");
      return false;
    }
    
    console.log("AuthProvider - Attempting login for:", username);
    
    if (username === adminCredentials.username && password === adminCredentials.password) {
      authChangeInProgress.current = true;
      
      console.log("AuthProvider - Credenziali corrette, aggiornamento stato...");
      
      // Prima salva nel localStorage
      localStorage.setItem("adminAuth", "true");
      
      // Poi aggiorna lo stato React
      setIsAuthenticated(true);
      console.log("AuthProvider - Authentication state updated to:", true);
      
      // Reset del flag
      setTimeout(() => {
        authChangeInProgress.current = false;
      }, 100);
      
      return true;
    }
    
    console.log("AuthProvider - Credenziali non valide");
    return false;
  }, [adminCredentials]);

  // Funzione di logout
  const logout = useCallback(() => {
    if (authChangeInProgress.current) {
      console.log("AuthProvider - Logout already in progress, skipping");
      return;
    }
    
    authChangeInProgress.current = true;
    
    console.log("AuthProvider - Executing logout");
    
    // Prima rimuove dal localStorage
    localStorage.removeItem("adminAuth");
    
    // Poi aggiorna lo stato React
    setIsAuthenticated(false);
    console.log("AuthProvider - Authentication state updated to:", false);
    
    // Reset del flag
    setTimeout(() => {
      authChangeInProgress.current = false;
    }, 100);
  }, []);

  // Log dello stato corrente per debugging
  useEffect(() => {
    console.log("AuthProvider - Current authentication state updated:", isAuthenticated);
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, adminCredentials }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
