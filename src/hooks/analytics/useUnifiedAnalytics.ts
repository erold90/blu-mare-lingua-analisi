
import { useState, useEffect, useCallback } from 'react';
import { FormValues } from '@/utils/quoteFormSchema';
import { saveQuoteLog, removeQuoteLog, loadQuoteLogs } from './operations/quoteOperations';
import { 
  trackPageVisit, 
  loadSiteVisits, 
  calculateVisitsCount,
  calculateVisitsCountLegacy,
  cleanupOldVisits,
  loadOptimizedStats
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
  timestamp: string; // Per compatibilità legacy
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

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Loading unified analytics data...');

      // Caricamento parallelo con timeout ottimizzati
      const [quoteLogsResult, siteVisitsResult, metricsResults] = await Promise.allSettled([
        Promise.race([
          loadQuoteLogs(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Quote logs timeout')), 2000))
        ]),
        Promise.race([
          loadSiteVisits(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Site visits timeout')), 3000))
        ]),
        // Caricamento metriche ottimizzato usando query database
        Promise.allSettled([
          calculateVisitsCount('day'),
          calculateVisitsCount('month'),
          calculateVisitsCount('year')
        ])
      ]);

      // Gestisci risultati quote logs
      if (quoteLogsResult.status === 'fulfilled') {
        const logs = quoteLogsResult.value as QuoteLog[];
        setQuoteLogs(logs);
        console.log('✅ Loaded quote logs:', logs.length);
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

      // Calcola metriche ottimizzate
      let visitsToday = 0, visitsMonth = 0, visitsYear = 0;
      
      if (metricsResults.status === 'fulfilled') {
        const [todayResult, monthResult, yearResult] = metricsResults.value;
        visitsToday = todayResult.status === 'fulfilled' ? todayResult.value : 0;
        visitsMonth = monthResult.status === 'fulfilled' ? monthResult.value : 0;
        visitsYear = yearResult.status === 'fulfilled' ? yearResult.value : 0;
      }

      const quotes = quoteLogsResult.status === 'fulfilled' ? quoteLogsResult.value as QuoteLog[] : [];
      const completedQuotes = quotes.filter(q => q.completed).length;

      setMetrics({
        visitsToday,
        visitsMonth,
        visitsYear,
        totalQuotes: quotes.length,
        completedQuotes
      });

      // Nessun errore critico se almeno uno dei caricamenti funziona
      if (quoteLogsResult.status === 'rejected' && siteVisitsResult.status === 'rejected') {
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
      setMetrics(prev => ({
        ...prev,
        totalQuotes: prev.totalQuotes + (existingIndex === -1 ? 1 : 0),
        completedQuotes: prev.completedQuotes + (quoteData.completed ? 1 : 0)
      }));

    } catch (error) {
      console.error('❌ Error saving quote log:', error);
      throw error;
    }
  }, []);

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
  const getOptimizedVisitsCount = useCallback(async (period: 'day' | 'month' | 'year'): Promise<number> => {
    return await calculateVisitsCount(period);
  }, []);

  const performCleanup = useCallback(async () => {
    return await cleanupOldVisits();
  }, []);

  const getOptimizedStats = useCallback(async () => {
    return await loadOptimizedStats();
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
    
    // Funzioni legacy (deprecate)
    getVisitsCount,
    
    // Nuove funzioni ottimizzate
    getOptimizedVisitsCount,
    performCleanup,
    getOptimizedStats
  };
}
