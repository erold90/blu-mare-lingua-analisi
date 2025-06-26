import { useState, useEffect, useCallback } from 'react';
import { FormValues } from '@/utils/quoteFormSchema';
import { saveQuoteLog, removeQuoteLog, loadQuoteLogs } from './operations/quoteOperations';
import { trackPageVisit, loadSiteVisits, calculateVisitsCount } from './operations/siteOperations';

export interface QuoteLog {
  id: string;
  timestamp: string;
  form_values: FormValues;
  step: number;
  completed: boolean;
}

export interface SiteVisit {
  id: string;
  timestamp: string;
  page: string;
  created_at: string; // Aggiunto il campo mancante
}

export function useUnifiedAnalytics() {
  const [quoteLogs, setQuoteLogs] = useState<QuoteLog[]>([]);
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Loading unified analytics data...');

      // Caricamento ultra-veloce con timeout aggressivi
      const loadWithTimeout = async () => {
        const [quoteLogsResult, siteVisitsResult] = await Promise.allSettled([
          Promise.race([
            loadQuoteLogs(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Quote logs timeout')), 2000))
          ]),
          Promise.race([
            loadSiteVisits(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Site visits timeout')), 1000))
          ])
        ]);

        return [quoteLogsResult, siteVisitsResult];
      };

      const [quoteLogsResult, siteVisitsResult] = await loadWithTimeout();

      // Gestisci risultati quote logs
      if (quoteLogsResult.status === 'fulfilled') {
        setQuoteLogs(quoteLogsResult.value as QuoteLog[]);
        console.log('✅ Loaded quote logs:', (quoteLogsResult.value as QuoteLog[]).length);
      } else {
        console.warn('⚠️ Quote logs failed to load:', quoteLogsResult.reason);
        setQuoteLogs([]);
      }

      // Gestisci risultati site visits
      if (siteVisitsResult.status === 'fulfilled') {
        setSiteVisits(siteVisitsResult.value as SiteVisit[]);
        console.log('✅ Loaded site visits:', (siteVisitsResult.value as SiteVisit[]).length);
      } else {
        console.warn('⚠️ Site visits failed to load:', siteVisitsResult.reason);
        setSiteVisits([]);
      }

      // Nessun errore critico se almeno uno dei due caricamenti funziona
      if (quoteLogsResult.status === 'rejected' && siteVisitsResult.status === 'rejected') {
        setError('Impossibile caricare i dati analytics. Riprova più tardi.');
      }

    } catch (error) {
      console.error('❌ Error loading unified analytics data:', error);
      setError('Errore nel caricamento dei dati analytics');
      setQuoteLogs([]);
      setSiteVisits([]);
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

    } catch (error) {
      console.error('❌ Error saving quote log:', error);
      throw error;
    }
  }, []);

  const deleteQuoteLog = useCallback(async (quoteId: string) => {
    try {
      await removeQuoteLog(quoteId);
      setQuoteLogs(prev => prev.filter(log => log.id !== quoteId));
    } catch (error) {
      console.error('❌ Error deleting quote log:', error);
      throw error;
    }
  }, []);

  const trackSiteVisit = useCallback(async (page: string) => {
    await trackPageVisit(page);
  }, []);

  const getVisitsCount = useCallback((period: 'day' | 'month' | 'year'): number => {
    return calculateVisitsCount(siteVisits, period);
  }, [siteVisits]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    quoteLogs,
    siteVisits,
    loading,
    error,
    refreshData: loadData,
    addQuoteLog,
    deleteQuoteLog,
    trackSiteVisit,
    getVisitsCount
  };
}
