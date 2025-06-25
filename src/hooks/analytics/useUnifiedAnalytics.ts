
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

      // Load data with improved timeout handling
      const loadWithTimeout = async () => {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout during data loading')), 8000)
        );

        const dataPromise = Promise.all([
          loadQuoteLogs(),
          loadSiteVisits()
        ]);

        return Promise.race([dataPromise, timeoutPromise]);
      };

      try {
        const [quoteLogs, siteVisits] = await loadWithTimeout() as [QuoteLog[], SiteVisit[]];
        console.log('✅ Loaded quote logs:', quoteLogs.length);
        console.log('✅ Loaded site visits:', siteVisits.length);
        setQuoteLogs(quoteLogs);
        setSiteVisits(siteVisits);
      } catch (timeoutError) {
        console.warn('⚠️ Timeout loading complete data, trying fallback...');
        
        // Enhanced fallback: try to load each dataset separately
        try {
          const quoteLogs = await Promise.race([
            loadQuoteLogs(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Quote logs timeout')), 4000))
          ]) as QuoteLog[];
          setQuoteLogs(quoteLogs);
          console.log('✅ Fallback: Loaded quote logs:', quoteLogs.length);
        } catch (quoteError) {
          console.error('❌ Could not load quote logs:', quoteError);
          setQuoteLogs([]);
        }

        try {
          const siteVisits = await Promise.race([
            loadSiteVisits(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Site visits timeout')), 4000))
          ]) as SiteVisit[];
          setSiteVisits(siteVisits);
          console.log('✅ Fallback: Loaded site visits:', siteVisits.length);
        } catch (visitsError) {
          console.error('❌ Could not load site visits:', visitsError);
          setSiteVisits([]);
        }

        setError('Alcuni dati potrebbero non essere disponibili (timeout database)');
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
