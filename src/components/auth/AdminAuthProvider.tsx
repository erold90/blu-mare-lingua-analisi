import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
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
    // Controlla se c'è una sessione Supabase esistente
    const checkSupabaseSession = async () => {
      try {
        console.log('🔍 Checking existing Supabase session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          console.log('✅ Found existing session for:', session.user.email);
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'admin'
          });
          setUserRole('admin');
        } else {
          console.log('❌ No existing session found');
        }
      } catch (error) {
        console.error('❌ Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSupabaseSession();

    // Ascolta i cambiamenti di autenticazione
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state change:', event, 'User:', session?.user?.email, 'Session:', !!session);
      
      if (event === 'SIGNED_IN' && session?.user) {
        const newUser = {
          id: session.user.id,
          email: session.user.email || '',
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'admin'
        };
        setUser(newUser);
        setUserRole('admin');
        setIsLoading(false);
        console.log('✅ User authenticated:', newUser);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserRole(null);
        setIsLoading(false);
        console.log('🚪 User signed out');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token refreshed');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithUsernamePassword = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        const adminEmail = 'erold@villamareblu.it';
        
        // Prova prima il login
        let { data, error } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: password,
        });

        // Se fallisce, prova a creare l'account
        if (error && error.message.includes('Invalid login credentials')) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: adminEmail,
            password: password,
            options: {
              data: {
                username: username,
                first_name: 'Erold',
                last_name: 'Admin'
              }
            }
          });

          if (signUpError) {
            console.error('Signup error:', signUpError);
            toast.error('Errore nella creazione dell\'account: ' + signUpError.message);
            return false;
          }

          if (signUpData.user) {
            toast.success('Account admin creato e login effettuato');
            return true;
          }
        } else if (error) {
          console.error('Login error:', error);
          toast.error('Errore durante il login: ' + error.message);
          return false;
        } else if (data.user) {
          toast.success('Login effettuato con successo');
          return true;
        }
      } else {
        toast.error('Credenziali non valide');
        return false;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Errore durante il login');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
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
  }, []);

  const value = useMemo(() => ({
    user,
    isLoading,
    userRole,
    isAuthenticated: !!user,
    signInWithUsernamePassword,
    signOut
  }), [user, isLoading, userRole, signInWithUsernamePassword, signOut]);

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