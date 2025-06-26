
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

      // Load data with very aggressive timeouts and fallbacks
      const loadWithTimeout = async () => {
        // Parallel loading with individual timeouts
        const [quoteLogsResult, siteVisitsResult] = await Promise.allSettled([
          Promise.race([
            loadQuoteLogs(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Quote logs timeout')), 3000))
          ]),
          Promise.race([
            loadSiteVisits(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Site visits timeout')), 1500))
          ])
        ]);

        return [quoteLogsResult, siteVisitsResult];
      };

      const [quoteLogs, siteVisits] = await loadWithTimeout();

      // Handle quote logs result
      if (quoteLogs.status === 'fulfilled') {
        setQuoteLogs(quoteLogs.value as QuoteLog[]);
        console.log('✅ Loaded quote logs:', (quoteLogs.value as QuoteLog[]).length);
      } else {
        console.warn('⚠️ Quote logs failed to load:', quoteLogs.reason);
        setQuoteLogs([]);
      }

      // Handle site visits result (always succeeds due to fallback in loadSiteVisits)
      if (siteVisits.status === 'fulfilled') {
        setSiteVisits(siteVisits.value as SiteVisit[]);
        console.log('✅ Loaded site visits:', (siteVisits.value as SiteVisit[]).length);
      } else {
        console.warn('⚠️ Site visits failed to load:', siteVisits.reason);
        setSiteVisits([]);
      }

      // Only show error if both operations failed
      const failedOperations = [];
      if (quoteLogs.status === 'rejected') failedOperations.push('preventivi');
      if (siteVisits.status === 'rejected' && (siteVisits.value as SiteVisit[]).length === 0) {
        failedOperations.push('visite');
      }
      
      if (failedOperations.length > 0) {
        setError(`Alcuni dati potrebbero non essere disponibili: ${failedOperations.join(', ')}`);
      }

    } catch (error) {
      console.error('❌ Error loading unified analytics data:', error);
      setError('Errore nel caricamento dei dati analytics');
      // Set empty arrays to prevent UI errors
      setQuoteLogs([]);
      setSiteVisits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addQuoteLog = useCallback(async (quoteData: Omit<QuoteLog, 'timestamp'> & { timestamp?: string }) => {
    try {
      const updatedQuoteData = await saveQuoteLog(quoteData);

      // Update local state
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
