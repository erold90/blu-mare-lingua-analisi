import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Timeout sessione: 30 minuti di inattività
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isCheckingAdmin = useRef(false);

  // Funzione per verificare se l'utente è admin
  const checkAdminStatus = useCallback(async (userId: string): Promise<boolean> => {
    // Evita chiamate multiple, ma aspetta il risultato invece di ritornare false
    if (isCheckingAdmin.current) {
      // Aspetta che la verifica in corso finisca
      await new Promise(resolve => setTimeout(resolve, 100));
      return isAdmin;
    }

    isCheckingAdmin.current = true;
    try {
      const { data: adminProfile, error } = await supabase
        .from('admin_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Errore verifica admin:', error);
        return false;
      }

      const result = !!adminProfile;
      setIsAdmin(result); // Aggiorna subito lo stato
      return result;
    } catch (err) {
      console.error('Errore verifica admin:', err);
      return false;
    } finally {
      isCheckingAdmin.current = false;
    }
  }, [isAdmin]);

  // Reset del timer di inattività
  const resetActivityTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (session) {
      timeoutRef.current = setTimeout(async () => {
        toast.warning('Sessione scaduta per inattività');
        await supabase.auth.signOut();
      }, SESSION_TIMEOUT_MS);
    }
  }, [session]);

  // Gestione eventi di attività utente
  useEffect(() => {
    if (!session) return;

    const handleActivity = () => resetActivityTimer();

    ACTIVITY_EVENTS.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Avvia il timer iniziale
    resetActivityTimer();

    return () => {
      ACTIVITY_EVENTS.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [session, resetActivityTimer]);

  useEffect(() => {
    let mounted = true;

    // Listener per cambiamenti di stato auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          const adminStatus = await checkAdminStatus(currentSession.user.id);
          if (mounted) {
            setIsAdmin(adminStatus);
            setLoading(false);
          }
        } else {
          if (mounted) {
            setIsAdmin(false);
            setLoading(false);
          }
        }
      }
    );

    // Verifica sessione esistente con error handling
    const initializeAuth = async () => {
      try {
        const { data: { session: existingSession }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        if (!mounted) return;

        setSession(existingSession);
        setUser(existingSession?.user ?? null);

        if (existingSession?.user) {
          const adminStatus = await checkAdminStatus(existingSession.user.id);
          if (mounted) {
            setIsAdmin(adminStatus);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Fallback: ensure loading is false after 5 seconds max
    const fallbackTimeout = setTimeout(() => {
      if (mounted && loading) {
        setLoading(false);
      }
    }, 5000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(fallbackTimeout);
    };
  }, [checkAdminStatus]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return { error };
      }

      toast.success('Accesso effettuato con successo');
      return { error: null };
    } catch (error) {
      toast.error('Errore durante l\'accesso');
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Questo indirizzo email è già registrato');
        } else {
          toast.error(error.message);
        }
        return { error };
      }

      toast.success('Registrazione completata! Controlla la tua email per confermare l\'account.');
      return { error: null };
    } catch (error) {
      toast.error('Errore durante la registrazione');
      return { error };
    }
  };

  const signOut = async () => {
    try {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Logout effettuato');
        setIsAdmin(false);
      }
    } catch {
      toast.error('Errore durante il logout');
    }
  };

  const value = {
    user,
    session,
    isAdmin,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
