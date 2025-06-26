
import { useState, useEffect, useCallback } from 'react';
import { FormValues } from '@/utils/quoteFormSchema';
import { saveQuoteLog, removeQuoteLog, loadQuoteLogs } from './operations/quoteOperations';
import { 
  trackPageVisit, 
  loadSiteVisits, 
  calculateAllVisitsCounts,
  cleanupOldVisits,
  loadOptimizedStats,
  retryFailedTracking
} from './operations/siteOperations';

export interface QuoteLog {
  id: string;
  timestamp: string;
  form_values: FormValues;
  step: number;
  completed: boolean;
}

export interface SiteVisit {
  id: string;
  page: string;
  created_at: string;
  timestamp: string;
}

export interface AnalyticsMetrics {
  visitsToday: number;
  visitsMonth: number;
  visitsYear: number;
  totalQuotes: number;
  completedQuotes: number;
}

export function useUnifiedAnalytics() {
  const [quoteLogs, setQuoteLogs] = useState<QuoteLog[]>([]);
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  const [metrics, setMetrics] = useState<AnalyticsMetrics>({
    visitsToday: 0,
    visitsMonth: 0,
    visitsYear: 0,
    totalQuotes: 0,
    completedQuotes: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Caricamento dati ottimizzato con gestione errori migliorata
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Loading unified analytics data with optimizations...');

      // Caricamento parallelo con timeout ottimizzato
      const [quoteLogsResult, siteVisitsResult, visitsCountsResult] = await Promise.allSettled([
        loadQuoteLogs(),
        loadSiteVisits(),
        calculateAllVisitsCounts()
      ]);

      // Gestisci risultati quote logs
      let quotes: QuoteLog[] = [];
      if (quoteLogsResult.status === 'fulfilled') {
        quotes = quoteLogsResult.value as QuoteLog[];
        setQuoteLogs(quotes);
        console.log('✅ Loaded quote logs:', quotes.length);
      } else {
        console.warn('⚠️ Quote logs failed to load:', quoteLogsResult.reason);
        setQuoteLogs([]);
      }

      // Gestisci risultati site visits
      if (siteVisitsResult.status === 'fulfilled') {
        const visits = siteVisitsResult.value as SiteVisit[];
        setSiteVisits(visits);
        console.log('✅ Loaded site visits:', visits.length);
      } else {
        console.warn('⚠️ Site visits failed to load:', siteVisitsResult.reason);
        setSiteVisits([]);
      }

      // Gestisci conteggi visite ottimizzati
      let visitsCounts = { day: 0, month: 0, year: 0 };
      if (visitsCountsResult.status === 'fulfilled') {
        visitsCounts = visitsCountsResult.value;
        console.log('✅ Loaded visits counts:', visitsCounts);
      } else {
        console.warn('⚠️ Visits counts failed to load:', visitsCountsResult.reason);
      }

      const completedQuotes = quotes.filter(q => q.completed).length;

      setMetrics({
        visitsToday: visitsCounts.day,
        visitsMonth: visitsCounts.month,
        visitsYear: visitsCounts.year,
        totalQuotes: quotes.length,
        completedQuotes
      });

      // Prova retry dei tracking falliti se disponibili
      try {
        const retryResult = await retryFailedTracking();
        if (retryResult.success > 0) {
          console.log(`🔄 Successfully retried ${retryResult.success} failed tracking attempts`);
        }
      } catch (retryError) {
        console.warn('⚠️ Failed tracking retry error:', retryError);
      }

      // Errore solo se tutti i caricamenti falliscono
      if (quoteLogsResult.status === 'rejected' && 
          siteVisitsResult.status === 'rejected' && 
          visitsCountsResult.status === 'rejected') {
        setError('Impossibile caricare i dati analytics. Riprova più tardi.');
      }

    } catch (error) {
      console.error('❌ Error loading unified analytics data:', error);
      setError('Errore nel caricamento dei dati analytics');
      setQuoteLogs([]);
      setSiteVisits([]);
      setMetrics({
        visitsToday: 0,
        visitsMonth: 0,
        visitsYear: 0,
        totalQuotes: 0,
        completedQuotes: 0
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const addQuoteLog = useCallback(async (quoteData: Omit<QuoteLog, 'timestamp'> & { timestamp?: string }) => {
    try {
      const updatedQuoteData = await saveQuoteLog(quoteData);

      setQuoteLogs(prev => {
        const existingIndex = prev.findIndex(log => log.id === quoteData.id);
        
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = updatedQuoteData;
          return updated;
        } else {
          return [updatedQuoteData, ...prev.slice(0, 99)];
        }
      });

      // Aggiorna metriche
      setMetrics(prev => {
        const existingIndex = quoteLogs.findIndex(log => log.id === quoteData.id);
        return {
          ...prev,
          totalQuotes: prev.totalQuotes + (existingIndex === -1 ? 1 : 0),
          completedQuotes: prev.completedQuotes + (quoteData.completed ? 1 : 0)
        };
      });

    } catch (error) {
      console.error('❌ Error saving quote log:', error);
      throw error;
    }
  }, [quoteLogs]);

  const deleteQuoteLog = useCallback(async (quoteId: string) => {
    try {
      await removeQuoteLog(quoteId);
      
      setQuoteLogs(prev => {
        const quoteBefore = prev.find(log => log.id === quoteId);
        const filtered = prev.filter(log => log.id !== quoteId);
        
        // Aggiorna metriche
        if (quoteBefore) {
          setMetrics(prev => ({
            ...prev,
            totalQuotes: Math.max(0, prev.totalQuotes - 1),
            completedQuotes: Math.max(0, prev.completedQuotes - (quoteBefore.completed ? 1 : 0))
          }));
        }
        
        return filtered;
      });
    } catch (error) {
      console.error('❌ Error deleting quote log:', error);
      throw error;
    }
  }, []);

  const trackSiteVisit = useCallback(async (page: string) => {
    await trackPageVisit(page);
  }, []);

  // Funzione legacy per compatibilità
  const getVisitsCount = useCallback((period: 'day' | 'month' | 'year'): number => {
    return calculateVisitsCountLegacy(siteVisits, period);
  }, [siteVisits]);

  // Nuove funzioni ottimizzate
  const getOptimizedVisitsCount = useCallback(async (): Promise<{ day: number; month: number; year: number }> => {
    return await calculateAllVisitsCounts();
  }, []);

  const performCleanup = useCallback(async () => {
    return await cleanupOldVisits();
  }, []);

  const getOptimizedStats = useCallback(async () => {
    return await loadOptimizedStats();
  }, []);

  const retryFailedOperations = useCallback(async () => {
    return await retryFailedTracking();
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
    
    // Azioni base
    refreshData: loadData,
    addQuoteLog,
    deleteQuoteLog,
    trackSiteVisit,
    
    // Nuove funzioni ottimizzate
    getOptimizedVisitsCount,
    performCleanup,
    getOptimizedStats,
    retryFailedOperations
  };
}
