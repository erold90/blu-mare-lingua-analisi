import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AdminUser {
  id: string;
  email: string;
  username: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  userRole: string | null;
  isAuthenticated: boolean;
  signInWithUsernamePassword: (username: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Credenziali hardcoded per il login locale
const ADMIN_CREDENTIALS = {
  username: 'erold',
  password: '205647',
  user: {
    id: 'admin-001',
    email: 'erold@villamareblu.it',
    username: 'erold'
  }
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Controlla prima il localStorage per compatibilità
    const checkLocalAuth = () => {
      try {
        const isAuth = localStorage.getItem('isAuthenticated');
        const currentUser = localStorage.getItem('currentUser');
        
        if (isAuth === 'true' && currentUser) {
          const userData = JSON.parse(currentUser);
          setUser(userData);
          setUserRole('admin');
        }
      } catch (error) {
        console.error('Error checking local auth:', error);
        // Pulisci localStorage se corrotto
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('currentUser');
      } finally {
        setIsLoading(false);
      }
    };

    checkLocalAuth();
  }, []);

  const signInWithUsernamePassword = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Prova prima il login locale per l'utente admin hardcoded
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // Usa direttamente le credenziali locali senza Supabase finché l'email non è abilitata
        setUser(ADMIN_CREDENTIALS.user);
        setUserRole('admin');
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('currentUser', JSON.stringify(ADMIN_CREDENTIALS.user));
        toast.success('Login effettuato con successo');
        return true;
      } else {
        toast.error('Credenziali non valide');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Errore durante il login');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserRole(null);
      // Pulisci anche localStorage per compatibilità
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('currentUser');
      toast.success('Logout effettuato con successo');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Errore durante il logout');
    }
  };

  const value = {
    user,
    isLoading,
    userRole,
    isAuthenticated: !!user,
    signInWithUsernamePassword,
    signOut
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};