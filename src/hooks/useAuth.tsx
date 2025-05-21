
import { useState, useEffect } from "react";

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
  }, []);

  const login = (username: string, password: string) => {
    if (username === adminCredentials.username && password === adminCredentials.password) {
      localStorage.setItem("adminAuth", "true");
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("adminAuth");
    setIsAuthenticated(false);
  };

  return { isAuthenticated, login, logout, adminCredentials };
};
