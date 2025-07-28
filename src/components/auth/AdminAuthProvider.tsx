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
    // Controlla se c'è una sessione Supabase esistente
    const checkSupabaseSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          // Verifica se l'utente ha il ruolo admin
          const { data: roleData, error: roleError } = await supabase
            .rpc('get_current_user_role');

          if (roleError) {
            console.error('Error getting user role:', roleError);
          }

          if (roleData === 'admin' || session.user.email === 'erold@villamareblu.it') {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'admin'
            });
            setUserRole('admin');
          } else {
            console.log('User does not have admin role');
            await supabase.auth.signOut();
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSupabaseSession();

    // Ascolta i cambiamenti di autenticazione
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Verifica ruolo admin
        const { data: roleData } = await supabase.rpc('get_current_user_role');
        
        if (roleData === 'admin' || session.user.email === 'erold@villamareblu.it') {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'admin'
          });
          setUserRole('admin');
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithUsernamePassword = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Prova prima il login locale per l'utente admin hardcoded
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        // Crea o effettua login con Supabase per l'admin
        const adminEmail = 'erold@villamareblu.it';
        
        try {
          // Prova il login
          const { data, error } = await supabase.auth.signInWithPassword({
            email: adminEmail,
            password: password,
          });

          if (error && error.message.includes('Invalid login credentials')) {
            // Se l'utente non esiste, crealo
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
              toast.error('Errore nella creazione dell\'account admin');
              return false;
            }

            // Se la registrazione è riuscita, l'utente dovrebbe essere automaticamente loggato
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
        } catch (supabaseError) {
          console.error('Supabase auth error:', supabaseError);
          toast.error('Errore di autenticazione');
          return false;
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