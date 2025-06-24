
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FormValues } from '@/utils/quoteFormSchema';

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

// Helper functions for data serialization
const serializeFormValues = (formValues: FormValues): any => {
  const serialized: any = { ...formValues };
  
  if (serialized.checkIn instanceof Date) {
    serialized.checkIn = serialized.checkIn.toISOString();
  }
  
  if (serialized.checkOut instanceof Date) {
    serialized.checkOut = serialized.checkOut.toISOString();
  }
  
  return serialized;
};

const deserializeFormValues = (dbFormValues: any): FormValues => {
  const deserialized: any = { ...dbFormValues };
  
  if (typeof deserialized.checkIn === 'string') {
    deserialized.checkIn = new Date(deserialized.checkIn);
  }
  
  if (typeof deserialized.checkOut === 'string') {
    deserialized.checkOut = new Date(deserialized.checkOut);
  }
  
  return deserialized as FormValues;
};

export function useAnalytics() {
  const [quoteLogs, setQuoteLogs] = useState<QuoteLog[]>([]);
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        { data: quoteLogsData, error: quoteLogsError },
        { data: siteVisitsData, error: siteVisitsError }
      ] = await Promise.all([
        supabase.from('quote_logs').select('*').order('timestamp', { ascending: false }).limit(100),
        supabase.from('site_visits').select('*').order('timestamp', { ascending: false }).limit(1000)
      ]);

      if (quoteLogsError || siteVisitsError) {
        throw new Error('Error loading analytics data');
      }

      // Process quote logs
      const formattedQuoteLogs: QuoteLog[] = (quoteLogsData || []).map(log => ({
        id: log.id,
        timestamp: log.timestamp,
        form_values: deserializeFormValues(log.form_values),
        step: log.step,
        completed: log.completed
      }));
      setQuoteLogs(formattedQuoteLogs);

      setSiteVisits(siteVisitsData || []);

    } catch (error) {
      console.error('Error loading analytics data:', error);
      setError(error instanceof Error ? error.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  }, []);

  const addQuoteLog = useCallback(async (quoteData: Omit<QuoteLog, 'timestamp'> & { timestamp?: string }) => {
    try {
      const logData = {
        id: quoteData.id,
        timestamp: quoteData.timestamp || new Date().toISOString(),
        form_values: serializeFormValues(quoteData.form_values),
        step: quoteData.step,
        completed: quoteData.completed
      };

      const { error } = await supabase
        .from('quote_logs')
        .upsert(logData);
      
      if (error) throw error;

      setQuoteLogs(prev => {
        const existingIndex = prev.findIndex(log => log.id === quoteData.id);
        const updatedQuoteData = {
          ...quoteData,
          timestamp: logData.timestamp,
          form_values: quoteData.form_values
        };
        
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = updatedQuoteData;
          return updated;
        } else {
          return [updatedQuoteData, ...prev.slice(0, 99)];
        }
      });
    } catch (error) {
      console.error('Error saving quote log:', error);
    }
  }, []);

  const deleteQuoteLog = useCallback(async (quoteId: string) => {
    try {
      const { error } = await supabase
        .from('quote_logs')
        .delete()
        .eq('id', quoteId);
      
      if (error) throw error;
      setQuoteLogs(prev => prev.filter(log => log.id !== quoteId));
    } catch (error) {
      console.error('Error deleting quote log:', error);
    }
  }, []);

  const getVisitsCount = useCallback((period: 'day' | 'month' | 'year'): number => {
    const now = new Date();
    
    return siteVisits.filter(visit => {
      const visitDate = new Date(visit.timestamp);
      
      if (period === 'day') {
        return visitDate.getDate() === now.getDate() &&
               visitDate.getMonth() === now.getMonth() &&
               visitDate.getFullYear() === now.getFullYear();
      }
      
      if (period === 'month') {
        return visitDate.getMonth() === now.getMonth() &&
               visitDate.getFullYear() === now.getFullYear();
      }
      
      if (period === 'year') {
        return visitDate.getFullYear() === now.getFullYear();
      }
      
      return false;
    }).length;
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
    getVisitsCount
  };
}
