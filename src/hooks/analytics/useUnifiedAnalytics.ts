
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

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  country?: string;
  deviceType?: string;
  page?: string;
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

export function useUnifiedAnalytics(filters: AnalyticsFilters = {}) {
  const [dailyAnalytics, setDailyAnalytics] = useState<any[]>([]);
  const [visitorSessions, setVisitorSessions] = useState<any[]>([]);
  const [pageViews, setPageViews] = useState<any[]>([]);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [quoteLogs, setQuoteLogs] = useState<QuoteLog[]>([]);
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load analytics data
      const promises = [];

      // Daily analytics
      let dailyQuery = supabase
        .from('daily_analytics')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

      if (filters.startDate) dailyQuery = dailyQuery.gte('date', filters.startDate);
      if (filters.endDate) dailyQuery = dailyQuery.lte('date', filters.endDate);
      promises.push(dailyQuery);

      // Visitor sessions
      let sessionsQuery = supabase
        .from('visitor_sessions')
        .select('*')
        .order('first_visit', { ascending: false })
        .limit(1000);

      if (filters.startDate) sessionsQuery = sessionsQuery.gte('first_visit', filters.startDate);
      if (filters.endDate) sessionsQuery = sessionsQuery.lte('first_visit', filters.endDate);
      if (filters.country) sessionsQuery = sessionsQuery.eq('country', filters.country);
      if (filters.deviceType) sessionsQuery = sessionsQuery.eq('device_type', filters.deviceType);
      promises.push(sessionsQuery);

      // Page views
      let pageViewsQuery = supabase
        .from('page_views')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1000);

      if (filters.startDate) pageViewsQuery = pageViewsQuery.gte('timestamp', filters.startDate);
      if (filters.endDate) pageViewsQuery = pageViewsQuery.lte('timestamp', filters.endDate);
      if (filters.page) pageViewsQuery = pageViewsQuery.ilike('page_url', `%${filters.page}%`);
      promises.push(pageViewsQuery);

      // Interactions
      let interactionsQuery = supabase
        .from('visitor_interactions')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(500);

      if (filters.startDate) interactionsQuery = interactionsQuery.gte('timestamp', filters.startDate);
      if (filters.endDate) interactionsQuery = interactionsQuery.lte('timestamp', filters.endDate);
      promises.push(interactionsQuery);

      // Quote logs
      const quoteLogsQuery = supabase
        .from('quote_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);
      promises.push(quoteLogsQuery);

      // Site visits
      const siteVisitsQuery = supabase
        .from('site_visits')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1000);
      promises.push(siteVisitsQuery);

      const [
        { data: dailyData, error: dailyError },
        { data: sessionsData, error: sessionsError },
        { data: pageViewsData, error: pageViewsError },
        { data: interactionsData, error: interactionsError },
        { data: quoteLogsData, error: quoteLogsError },
        { data: siteVisitsData, error: siteVisitsError }
      ] = await Promise.all(promises);

      if (dailyError || sessionsError || pageViewsError || interactionsError || quoteLogsError || siteVisitsError) {
        throw new Error('Error loading analytics data');
      }

      setDailyAnalytics(dailyData || []);
      setVisitorSessions(sessionsData || []);
      setPageViews(pageViewsData || []);
      setInteractions(interactionsData || []);

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
  }, [filters]);

  const aggregateDailyAnalytics = useCallback(async (date?: string) => {
    try {
      const { error } = await supabase.rpc('aggregate_daily_analytics', {
        target_date: date || new Date().toISOString().split('T')[0]
      });
      
      if (error) throw error;
      await loadAllData();
    } catch (error) {
      console.error('Error aggregating analytics:', error);
    }
  }, [loadAllData]);

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
    loadAllData();
  }, [loadAllData]);

  return {
    // Analytics data
    dailyAnalytics,
    visitorSessions,
    pageViews,
    interactions,
    
    // Legacy data
    quoteLogs,
    siteVisits,
    
    // State
    loading,
    error,
    
    // Actions
    refreshData: loadAllData,
    aggregateDailyAnalytics,
    addQuoteLog,
    deleteQuoteLog,
    getVisitsCount
  };
}
