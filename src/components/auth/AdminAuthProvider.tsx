import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

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
    // Controlla se c'è una sessione locale esistente
    const checkLocalSession = () => {
      try {
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        const userData = localStorage.getItem('currentUser');
        
        if (isAuthenticated && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setUserRole('admin');
        }
      } catch (error) {
        console.error('Error checking local session:', error);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('currentUser');
      } finally {
        setIsLoading(false);
      }
    };

    checkLocalSession();
  }, []);

  const signInWithUsernamePassword = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Verifica credenziali locali
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        const adminUser = ADMIN_CREDENTIALS.user;
        
        // Salva sessione locale
        setUser(adminUser);
        setUserRole('admin');
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
        
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
      setUser(null);
      setUserRole(null);
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