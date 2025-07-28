import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminAuthContextType {
  user: User | null;
  isLoading: boolean;
  userRole: string | null;
  isAuthenticated: boolean;
  signInWithUsernamePassword: (username: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Controlla se c'è una sessione esistente
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else if (session?.user) {
          setUser(session.user);
          await fetchUserRole(session.user.id);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Ascolta i cambiamenti di autenticazione
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserRole(session.user.id);
          // Sincronizza con localStorage per compatibilità
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('currentUser', JSON.stringify({
            id: session.user.id,
            email: session.user.email,
            role: 'admin'
          }));
        } else {
          setUserRole(null);
          localStorage.removeItem('isAuthenticated');
          localStorage.removeItem('currentUser');
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_current_user_role');
      
      if (error) {
        console.error('Error fetching user role:', error);
        setUserRole('admin'); // Default per ora
      } else {
        setUserRole(data || 'admin');
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      setUserRole('admin');
    }
  };

  const signInWithUsernamePassword = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Prima ottieni l'email dall'username
      const { data: userData, error: userError } = await supabase
        .rpc('login_with_username', {
          username_input: username,
          password_input: password
        });

      if (userError || !userData || userData.length === 0) {
        toast.error('Username non trovato');
        return false;
      }

      const email = userData[0].email;

      // Ora fai il login con Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast.error('Credenziali non valide');
        return false;
      }

      if (data.user) {
        toast.success('Login effettuato con successo');
        return true;
      }

      return false;
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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
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