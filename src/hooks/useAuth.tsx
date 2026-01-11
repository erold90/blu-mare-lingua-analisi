import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Debug: verifica che supabase sia importato correttamente
console.log('[AUTH-DEBUG] Modulo useAuth caricato');
console.log('[AUTH-DEBUG] Supabase client:', supabase ? 'OK' : 'UNDEFINED');

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
  console.log('[AUTH-DEBUG] AuthProvider montato');

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isCheckingAdmin = useRef(false);

  // Funzione per verificare se l'utente è admin
  const checkAdminStatus = useCallback(async (userId: string): Promise<boolean> => {
    console.log('[AUTH] ====== checkAdminStatus START ======');
    console.log('[AUTH] userId:', userId);
    console.log('[AUTH] isCheckingAdmin.current:', isCheckingAdmin.current);
    console.log('[AUTH] current isAdmin state:', isAdmin);

    if (isCheckingAdmin.current) {
      console.log('[AUTH] Verifica già in corso, aspetto 200ms...');
      await new Promise(resolve => setTimeout(resolve, 200));
      console.log('[AUTH] Ritorno isAdmin corrente:', isAdmin);
      return isAdmin;
    }

    isCheckingAdmin.current = true;
    console.log('[AUTH] isCheckingAdmin settato a true');

    try {
      // METODO 1: Prova RPC is_admin
      console.log('[AUTH] >>> Tentativo RPC is_admin...');
      console.log('[AUTH] >>> Chiamata supabase.rpc("is_admin", { user_id:', userId, '})');

      const rpcPromise = supabase.rpc('is_admin', { user_id: userId });
      console.log('[AUTH] >>> Promise RPC creata, aspetto risultato...');

      // Timeout di 5 secondi per la chiamata RPC
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('RPC timeout dopo 5s')), 5000)
      );

      let rpcResult;
      try {
        rpcResult = await Promise.race([rpcPromise, timeoutPromise]) as any;
        console.log('[AUTH] >>> RPC completato:', JSON.stringify(rpcResult));
      } catch (timeoutErr) {
        console.error('[AUTH] >>> RPC TIMEOUT:', timeoutErr);
        rpcResult = { data: null, error: timeoutErr };
      }

      const { data: isAdminResult, error: rpcError } = rpcResult;
      console.log('[AUTH] >>> RPC result - isAdminResult:', isAdminResult, 'error:', rpcError);

      if (!rpcError && isAdminResult !== null && isAdminResult !== undefined) {
        console.log('[AUTH] >>> RPC successo! isAdmin =', isAdminResult);
        setIsAdmin(isAdminResult);
        isCheckingAdmin.current = false;
        return isAdminResult;
      }

      // METODO 2: Query diretta admin_profiles
      console.log('[AUTH] >>> RPC fallito, provo query diretta...');
      console.log('[AUTH] >>> Query: admin_profiles.select("id").eq("user_id",', userId, ')');

      const queryPromise = supabase
        .from('admin_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      console.log('[AUTH] >>> Promise query creata, aspetto risultato...');

      // Timeout di 5 secondi per la query
      const queryTimeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout dopo 5s')), 5000)
      );

      let queryResult;
      try {
        queryResult = await Promise.race([queryPromise, queryTimeoutPromise]) as any;
        console.log('[AUTH] >>> Query completata:', JSON.stringify(queryResult));
      } catch (timeoutErr) {
        console.error('[AUTH] >>> Query TIMEOUT:', timeoutErr);
        queryResult = { data: null, error: timeoutErr };
      }

      const { data: adminProfile, error } = queryResult;
      console.log('[AUTH] >>> Query result - adminProfile:', adminProfile, 'error:', error);

      const result = !!adminProfile;
      console.log('[AUTH] >>> Risultato finale isAdmin:', result);
      setIsAdmin(result);
      return result;

    } catch (err) {
      console.error('[AUTH] !!! ECCEZIONE in checkAdminStatus:', err);
      return false;
    } finally {
      isCheckingAdmin.current = false;
      console.log('[AUTH] ====== checkAdminStatus END ======');
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
    console.log('[AUTH] ====== useEffect MOUNT ======');
    let mounted = true;

    // Listener per cambiamenti di stato auth
    console.log('[AUTH] Registrazione onAuthStateChange listener...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('[AUTH] onAuthStateChange triggered - event:', event);
        console.log('[AUTH] onAuthStateChange - session:', currentSession ? 'presente' : 'null');

        if (!mounted) {
          console.log('[AUTH] Component unmounted, skip');
          return;
        }

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          console.log('[AUTH] onAuthStateChange - user presente, verifico admin...');
          const adminStatus = await checkAdminStatus(currentSession.user.id);
          console.log('[AUTH] onAuthStateChange - adminStatus:', adminStatus);
          if (mounted) {
            setIsAdmin(adminStatus);
            setLoading(false);
          }
        } else {
          console.log('[AUTH] onAuthStateChange - nessun user');
          if (mounted) {
            setIsAdmin(false);
            setLoading(false);
          }
        }
      }
    );
    console.log('[AUTH] onAuthStateChange listener registrato');

    // Verifica sessione esistente
    const initializeAuth = async () => {
      console.log('[AUTH] ====== initializeAuth START ======');
      try {
        // Prima prova refresh
        console.log('[AUTH] >>> Tentativo refreshSession...');
        const refreshResult = await supabase.auth.refreshSession();
        console.log('[AUTH] >>> refreshSession completato');
        console.log('[AUTH] >>> refreshSession result:', {
          hasSession: !!refreshResult.data?.session,
          userId: refreshResult.data?.session?.user?.id,
          error: refreshResult.error?.message
        });

        let currentSession = refreshResult.data?.session;

        // Se refresh fallisce, prova getSession
        if (!currentSession) {
          console.log('[AUTH] >>> Nessuna sessione da refresh, provo getSession...');
          const getResult = await supabase.auth.getSession();
          console.log('[AUTH] >>> getSession completato');
          console.log('[AUTH] >>> getSession result:', {
            hasSession: !!getResult.data?.session,
            userId: getResult.data?.session?.user?.id,
            error: getResult.error?.message
          });
          currentSession = getResult.data?.session;

          if (getResult.error) {
            console.error('[AUTH] !!! Errore getSession:', getResult.error);
            if (mounted) setLoading(false);
            return;
          }
        }

        if (!mounted) {
          console.log('[AUTH] >>> Component unmounted durante init');
          return;
        }

        console.log('[AUTH] >>> Setto session e user...');
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          console.log('[AUTH] >>> User trovato:', currentSession.user.id);
          console.log('[AUTH] >>> Chiamo checkAdminStatus...');
          const adminStatus = await checkAdminStatus(currentSession.user.id);
          console.log('[AUTH] >>> checkAdminStatus ritornato:', adminStatus);
          if (mounted) {
            setIsAdmin(adminStatus);
          }
        } else {
          console.log('[AUTH] >>> Nessuna sessione/user');
        }
      } catch (error) {
        console.error('[AUTH] !!! ECCEZIONE in initializeAuth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
          console.log('[AUTH] >>> Loading settato a false');
        }
        console.log('[AUTH] ====== initializeAuth END ======');
      }
    };

    initializeAuth();

    // Fallback timeout
    const fallbackTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.log('[AUTH] !!! Fallback timeout - forzo loading=false');
        setLoading(false);
      }
    }, 5000);

    return () => {
      console.log('[AUTH] ====== useEffect UNMOUNT ======');
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(fallbackTimeout);
    };
  }, [checkAdminStatus]);

  const signIn = async (email: string, password: string) => {
    console.log('[AUTH] signIn chiamato per:', email);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[AUTH] signIn errore:', error);
        toast.error(error.message);
        return { error };
      }

      console.log('[AUTH] signIn successo');
      toast.success('Accesso effettuato con successo');
      return { error: null };
    } catch (error) {
      console.error('[AUTH] signIn eccezione:', error);
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
    console.log('[AUTH] signOut chiamato');
    try {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[AUTH] signOut errore:', error);
        toast.error(error.message);
      } else {
        console.log('[AUTH] signOut successo');
        toast.success('Logout effettuato');
        setIsAdmin(false);
      }
    } catch {
      toast.error('Errore durante il logout');
    }
  };

  console.log('[AUTH-DEBUG] Render AuthProvider - loading:', loading, 'isAdmin:', isAdmin, 'user:', user?.id);

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
