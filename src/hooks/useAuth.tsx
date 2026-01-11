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

  // Refs per gestire race conditions
  const adminStatusRef = useRef<boolean>(false);
  const checkInProgressRef = useRef<Promise<boolean> | null>(null);
  const hasInitializedRef = useRef(false);

  // Funzione per verificare se l'utente è admin - SENZA timeout artificiali
  const checkAdminStatus = useCallback(async (userId: string): Promise<boolean> => {
    console.log('[AUTH] checkAdminStatus per:', userId);

    // Se c'è già una verifica in corso, aspetta quella
    if (checkInProgressRef.current) {
      console.log('[AUTH] Verifica già in corso, attendo...');
      try {
        const result = await checkInProgressRef.current;
        console.log('[AUTH] Verifica precedente completata:', result);
        return result;
      } catch {
        // Se fallisce, continua con una nuova verifica
      }
    }

    // Crea una nuova promise per questa verifica
    const checkPromise = (async () => {
      try {
        // Prova RPC is_admin (senza timeout artificiale)
        console.log('[AUTH] Chiamata RPC is_admin...');
        const { data: isAdminResult, error: rpcError } = await supabase.rpc('is_admin', { user_id: userId });

        if (!rpcError && isAdminResult !== null && isAdminResult !== undefined) {
          console.log('[AUTH] RPC successo:', isAdminResult);
          adminStatusRef.current = isAdminResult;
          setIsAdmin(isAdminResult);
          return isAdminResult;
        }

        console.log('[AUTH] RPC fallito, provo query diretta...', rpcError?.message);

        // Fallback: query diretta admin_profiles
        const { data: adminProfile, error } = await supabase
          .from('admin_profiles')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          console.error('[AUTH] Query fallita:', error.message);
          return false;
        }

        const result = !!adminProfile;
        console.log('[AUTH] Query risultato:', result);
        adminStatusRef.current = result;
        setIsAdmin(result);
        return result;

      } catch (err) {
        console.error('[AUTH] Eccezione in checkAdminStatus:', err);
        return false;
      } finally {
        checkInProgressRef.current = null;
      }
    })();

    checkInProgressRef.current = checkPromise;
    return checkPromise;
  }, []);

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

    // Inizializza auth UNA SOLA VOLTA
    const initializeAuth = async () => {
      if (hasInitializedRef.current) return;
      hasInitializedRef.current = true;

      console.log('[AUTH] Inizializzazione auth...');

      try {
        // Ottieni sessione corrente
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[AUTH] Errore getSession:', error);
          if (mounted) setLoading(false);
          return;
        }

        if (!mounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          console.log('[AUTH] Sessione trovata, verifico admin...');
          const adminStatus = await checkAdminStatus(currentSession.user.id);
          console.log('[AUTH] Admin status:', adminStatus);
          if (mounted) {
            setIsAdmin(adminStatus);
          }
        }
      } catch (error) {
        console.error('[AUTH] Eccezione in initializeAuth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
          console.log('[AUTH] Loading completato');
        }
      }
    };

    // Listener per cambiamenti di stato auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('[AUTH] onAuthStateChange:', event);

        if (!mounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          // Per SIGNED_IN, verifica admin
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            const adminStatus = await checkAdminStatus(currentSession.user.id);
            if (mounted) {
              setIsAdmin(adminStatus);
            }
          }
        } else {
          if (mounted) {
            setIsAdmin(false);
          }
        }

        // Assicura che loading sia false dopo qualsiasi evento auth
        if (mounted && loading) {
          setLoading(false);
        }
      }
    );

    initializeAuth();

    // Fallback timeout più lungo (20 secondi)
    const fallbackTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.log('[AUTH] Fallback timeout 20s');
        setLoading(false);
      }
    }, 20000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(fallbackTimeout);
    };
  }, [checkAdminStatus, loading]);

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
        adminStatusRef.current = false;
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
