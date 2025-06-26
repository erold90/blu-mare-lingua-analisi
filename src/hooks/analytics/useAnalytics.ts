
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FormValues } from '@/utils/quoteFormSchema';

export interface QuoteLog {
  id: string;
  form_data: FormValues;
  step: number;
  completed: boolean;
  total_price?: number;
  user_session?: string;
  created_at: string;
  updated_at: string;
}

export interface SiteVisit {
  id: string;
  page: string;
  user_agent?: string;
  ip_address?: string;
  referrer?: string;
  session_id?: string;
  created_at: string;
}

export interface AnalyticsMetrics {
  visitsToday: number;
  visitsWeek: number;
  visitsMonth: number;
  quotesToday: number;
  quotesCompleted: number;
}

export function useAnalytics() {
  const [quoteLogs, setQuoteLogs] = useState<QuoteLog[]>([]);
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    visitsToday: 0,
    visitsWeek: 0,
    visitsMonth: 0,
    quotesToday: 0,
    quotesCompleted: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carica metriche principali con funzione database ottimizzata
  const loadMetrics = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_analytics_counts');
      
      if (error) throw error;
      
      const result = data?.[0];
      if (result) {
        setMetrics({
          visitsToday: Number(result.visits_today) || 0,
          visitsWeek: Number(result.visits_week) || 0,
          visitsMonth: Number(result.visits_month) || 0,
          quotesToday: Number(result.quotes_today) || 0,
          quotesCompleted: Number(result.quotes_completed) || 0
        });
      }
    } catch (error) {
      console.error('❌ Error loading analytics metrics:', error);
    }
  }, []);

  // Carica visite recenti
  const loadSiteVisits = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('site_visits')
        .select('*')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      
      const visits = (data || []).map(visit => ({
        id: visit.id,
        page: visit.page,
        user_agent: visit.user_agent || undefined,
        ip_address: visit.ip_address?.toString() || undefined,
        referrer: visit.referrer || undefined,
        session_id: visit.session_id || undefined,
        created_at: visit.created_at
      }));
      
      setSiteVisits(visits);
    } catch (error) {
      console.error('❌ Error loading site visits:', error);
    }
  }, []);

  // Carica preventivi
  const loadQuoteLogs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('quote_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      const quotes = (data || []).map(quote => ({
        id: quote.id,
        form_data: quote.form_data as FormValues,
        step: quote.step,
        completed: quote.completed,
        total_price: quote.total_price || undefined,
        user_session: quote.user_session || undefined,
        created_at: quote.created_at,
        updated_at: quote.updated_at
      }));
      
      setQuoteLogs(quotes);
    } catch (error) {
      console.error('❌ Error loading quote logs:', error);
    }
  }, []);

  // Carica tutti i dati
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadMetrics(),
        loadSiteVisits(),
        loadQuoteLogs()
      ]);
    } catch (error) {
      console.error('❌ Error loading analytics data:', error);
      setError('Errore nel caricamento dei dati analytics');
    } finally {
      setLoading(false);
    }
  }, [loadMetrics, loadSiteVisits, loadQuoteLogs]);

  // Traccia visita pagina
  const trackSiteVisit = useCallback(async (page: string) => {
    try {
      // Genera session ID se non esiste
      let sessionId = sessionStorage.getItem('analytics_session');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem('analytics_session', sessionId);
      }

      const visitData = {
        id: `visit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        page: page.substring(0, 500), // Limita lunghezza
        user_agent: navigator?.userAgent?.substring(0, 500),
        referrer: document?.referrer?.substring(0, 500) || null,
        session_id: sessionId
      };

      const { error } = await supabase
        .from('site_visits')
        .insert(visitData);

      if (error) throw error;
      
      console.log('✅ Site visit tracked:', page);
      
      // Ricarica metriche per aggiornare conteggi
      await loadMetrics();
      
    } catch (error) {
      console.error('❌ Error tracking site visit:', error);
    }
  }, [loadMetrics]);

  // Salva preventivo
  const saveQuoteLog = useCallback(async (quoteData: Omit<QuoteLog, 'created_at' | 'updated_at'>) => {
    try {
      const dbData = {
        id: quoteData.id,
        form_data: quoteData.form_data,
        step: quoteData.step,
        completed: quoteData.completed,
        total_price: quoteData.total_price || null,
        user_session: quoteData.user_session || null
      };

      const { data, error } = await supabase
        .from('quote_logs')
        .upsert(dbData, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;
      
      const processedData: QuoteLog = {
        id: data.id,
        form_data: data.form_data as FormValues,
        step: data.step,
        completed: data.completed,
        total_price: data.total_price || undefined,
        user_session: data.user_session || undefined,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      // Aggiorna stato locale
      setQuoteLogs(prev => {
        const existingIndex = prev.findIndex(log => log.id === quoteData.id);
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = processedData;
          return updated;
        } else {
          return [processedData, ...prev.slice(0, 99)];
        }
      });

      // Ricarica metriche
      await loadMetrics();
      
      console.log('✅ Quote log saved:', quoteData.id);
      return processedData;
      
    } catch (error) {
      console.error('❌ Error saving quote log:', error);
      throw error;
    }
  }, [loadMetrics]);

  // Elimina preventivo
  const deleteQuoteLog = useCallback(async (quoteId: string) => {
    try {
      const { error } = await supabase
        .from('quote_logs')
        .delete()
        .eq('id', quoteId);

      if (error) throw error;
      
      setQuoteLogs(prev => prev.filter(log => log.id !== quoteId));
      await loadMetrics();
      
      console.log('✅ Quote log deleted:', quoteId);
      
    } catch (error) {
      console.error('❌ Error deleting quote log:', error);
      throw error;
    }
  }, [loadMetrics]);

  // Pulizia dati vecchi
  const cleanupOldData = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('cleanup_old_analytics');
      
      if (error) throw error;
      
      const result = data?.[0];
      console.log('🧹 Cleanup completed:', result);
      
      // Ricarica dati dopo pulizia
      await loadData();
      
      return result;
      
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
      throw error;
    }
  }, [loadData]);

  // Test connessione
  const testConnection = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('site_visits')
        .select('id')
        .limit(1);
      
      return !error;
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    // Dati
    quoteLogs,
    siteVisits,
    metrics,
    loading,
    error,
    
    // Azioni
    refreshData: loadData,
    trackSiteVisit,
    saveQuoteLog,
    deleteQuoteLog,
    cleanupOldData,
    testConnection
  };
}
