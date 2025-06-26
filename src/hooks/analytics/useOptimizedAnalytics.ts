
import { useState, useEffect, useCallback } from 'react';
import { FormValues } from '@/utils/quoteFormSchema';
import { saveQuoteLog, removeQuoteLog, loadQuoteLogs } from './operations/quoteOperations';
import { 
  trackPageVisitOptimized,
  loadSiteVisitsOptimized,
  getOptimizedVisitCounts,
  testSupabaseConnectionOptimized,
  getFailedTrackingOptimized,
  clearFailedTrackingOptimized
} from './operations/optimizedSiteOperations';

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

export interface OptimizedAnalyticsMetrics {
  visitsToday: number;
  visitsMonth: number;
  visitsYear: number;
  totalQuotes: number;
  completedQuotes: number;
  failedTracking: number;
}

export function useOptimizedAnalytics() {
  const [quoteLogs, setQuoteLogs] = useState<QuoteLog[]>([]);
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  const [metrics, setMetrics] = useState<OptimizedAnalyticsMetrics>({
    visitsToday: 0,
    visitsMonth: 0,
    visitsYear: 0,
    totalQuotes: 0,
    completedQuotes: 0,
    failedTracking: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Caricamento dati completamente ottimizzato
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🚀 Loading optimized analytics data...');

      // Caricamento parallelo con gestione errori migliorata
      const [quoteLogsResult, siteVisitsResult, visitsCountsResult] = await Promise.allSettled([
        loadQuoteLogs(),
        loadSiteVisitsOptimized(500), // Limite ragionevole
        getOptimizedVisitCounts()
      ]);

      // Gestisci quote logs
      let quotes: QuoteLog[] = [];
      if (quoteLogsResult.status === 'fulfilled') {
        quotes = quoteLogsResult.value as QuoteLog[];
        setQuoteLogs(quotes);
        console.log('✅ Loaded quote logs:', quotes.length);
      } else {
        console.warn('⚠️ Quote logs failed:', quoteLogsResult.reason);
        setQuoteLogs([]);
      }

      // Gestisci site visits
      let visits: SiteVisit[] = [];
      if (siteVisitsResult.status === 'fulfilled') {
        visits = siteVisitsResult.value as SiteVisit[];
        setSiteVisits(visits);
        console.log('✅ Loaded optimized site visits:', visits.length);
      } else {
        console.warn('⚠️ Site visits failed:', siteVisitsResult.reason);
        setSiteVisits([]);
      }

      // Gestisci conteggi ottimizzati
      let visitsCounts = { visits_today: 0, visits_month: 0, visits_year: 0 };
      if (visitsCountsResult.status === 'fulfilled') {
        visitsCounts = visitsCountsResult.value;
        console.log('✅ Loaded optimized visit counts:', visitsCounts);
      } else {
        console.warn('⚠️ Visit counts failed:', visitsCountsResult.reason);
      }

      const completedQuotes = quotes.filter(q => q.completed).length;
      const failedTracking = getFailedTrackingOptimized().length;

      setMetrics({
        visitsToday: visitsCounts.visits_today,
        visitsMonth: visitsCounts.visits_month,
        visitsYear: visitsCounts.visits_year,
        totalQuotes: quotes.length,
        completedQuotes,
        failedTracking
      });

      // Solo errore se tutti i caricamenti critici falliscono
      if (quoteLogsResult.status === 'rejected' && 
          siteVisitsResult.status === 'rejected' && 
          visitsCountsResult.status === 'rejected') {
        setError('Impossibile caricare i dati analytics principali');
      }

    } catch (error) {
      console.error('❌ Critical error loading optimized analytics:', error);
      setError('Errore critico nel caricamento analytics');
      
      // Reset sicuro
      setQuoteLogs([]);
      setSiteVisits([]);
      setMetrics({
        visitsToday: 0,
        visitsMonth: 0,
        visitsYear: 0,
        totalQuotes: 0,
        completedQuotes: 0,
        failedTracking: getFailedTrackingOptimized().length
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
          return [updatedQuoteData, ...prev.slice(0, 99)]; // Limite per performance
        }
      });

      // Aggiorna metriche atomicamente
      setMetrics(prev => {
        const existingQuote = quoteLogs.find(log => log.id === quoteData.id);
        const isNewQuote = !existingQuote;
        const wasCompleted = existingQuote?.completed || false;
        const isNowCompleted = quoteData.completed || false;
        
        return {
          ...prev,
          totalQuotes: prev.totalQuotes + (isNewQuote ? 1 : 0),
          completedQuotes: prev.completedQuotes + 
            (isNowCompleted && !wasCompleted ? 1 : 0) -
            (!isNowCompleted && wasCompleted ? 1 : 0)
        };
      });

    } catch (error) {
      console.error('❌ Error saving optimized quote log:', error);
      throw error;
    }
  }, [quoteLogs]);

  const deleteQuoteLog = useCallback(async (quoteId: string) => {
    try {
      await removeQuoteLog(quoteId);
      
      setQuoteLogs(prev => {
        const quoteBefore = prev.find(log => log.id === quoteId);
        const filtered = prev.filter(log => log.id !== quoteId);
        
        // Aggiorna metriche atomicamente
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
      console.error('❌ Error deleting optimized quote log:', error);
      throw error;
    }
  }, []);

  const trackSiteVisit = useCallback(async (page: string) => {
    await trackPageVisitOptimized(page);
  }, []);

  const testConnection = useCallback(async () => {
    return await testSupabaseConnectionOptimized();
  }, []);

  const clearFailedTracking = useCallback(() => {
    clearFailedTrackingOptimized();
    setMetrics(prev => ({ ...prev, failedTracking: 0 }));
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
    
    // Azioni ottimizzate
    refreshData: loadData,
    addQuoteLog,
    deleteQuoteLog,
    trackSiteVisit,
    testConnection,
    clearFailedTracking,
    
    // Utilities
    getFailedTracking: getFailedTrackingOptimized
  };
}
