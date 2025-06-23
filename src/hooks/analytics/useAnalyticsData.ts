
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsData {
  dailyAnalytics: any[];
  visitorSessions: any[];
  pageViews: any[];
  interactions: any[];
  loading: boolean;
  error: string | null;
}

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  country?: string;
  deviceType?: string;
  page?: string;
}

export function useAnalyticsData(filters: AnalyticsFilters = {}) {
  const [data, setData] = useState<AnalyticsData>({
    dailyAnalytics: [],
    visitorSessions: [],
    pageViews: [],
    interactions: [],
    loading: true,
    error: null,
  });

  const loadAnalyticsData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      // Carica analytics giornalieri
      let dailyQuery = supabase
        .from('daily_analytics')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

      if (filters.startDate) {
        dailyQuery = dailyQuery.gte('date', filters.startDate);
      }
      if (filters.endDate) {
        dailyQuery = dailyQuery.lte('date', filters.endDate);
      }

      const { data: dailyData, error: dailyError } = await dailyQuery;
      if (dailyError) throw dailyError;

      // Carica sessioni visitatori
      let sessionsQuery = supabase
        .from('visitor_sessions')
        .select('*')
        .order('first_visit', { ascending: false })
        .limit(1000);

      if (filters.startDate) {
        sessionsQuery = sessionsQuery.gte('first_visit', filters.startDate);
      }
      if (filters.endDate) {
        sessionsQuery = sessionsQuery.lte('first_visit', filters.endDate);
      }
      if (filters.country) {
        sessionsQuery = sessionsQuery.eq('country', filters.country);
      }
      if (filters.deviceType) {
        sessionsQuery = sessionsQuery.eq('device_type', filters.deviceType);
      }

      const { data: sessionsData, error: sessionsError } = await sessionsQuery;
      if (sessionsError) throw sessionsError;

      // Carica page views
      let pageViewsQuery = supabase
        .from('page_views')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1000);

      if (filters.startDate) {
        pageViewsQuery = pageViewsQuery.gte('timestamp', filters.startDate);
      }
      if (filters.endDate) {
        pageViewsQuery = pageViewsQuery.lte('timestamp', filters.endDate);
      }
      if (filters.page) {
        pageViewsQuery = pageViewsQuery.ilike('page_url', `%${filters.page}%`);
      }

      const { data: pageViewsData, error: pageViewsError } = await pageViewsQuery;
      if (pageViewsError) throw pageViewsError;

      // Carica interazioni
      let interactionsQuery = supabase
        .from('visitor_interactions')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(500);

      if (filters.startDate) {
        interactionsQuery = interactionsQuery.gte('timestamp', filters.startDate);
      }
      if (filters.endDate) {
        interactionsQuery = interactionsQuery.lte('timestamp', filters.endDate);
      }

      const { data: interactionsData, error: interactionsError } = await interactionsQuery;
      if (interactionsError) throw interactionsError;

      setData({
        dailyAnalytics: dailyData || [],
        visitorSessions: sessionsData || [],
        pageViews: pageViewsData || [],
        interactions: interactionsData || [],
        loading: false,
        error: null,
      });

    } catch (error) {
      console.error('Error loading analytics data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto',
      }));
    }
  }, [filters]);

  const aggregateDailyAnalytics = useCallback(async (date?: string) => {
    try {
      const { error } = await supabase.rpc('aggregate_daily_analytics', {
        target_date: date || new Date().toISOString().split('T')[0]
      });
      
      if (error) throw error;
      
      // Ricarica i dati dopo l'aggregazione
      await loadAnalyticsData();
    } catch (error) {
      console.error('Error aggregating analytics:', error);
    }
  }, [loadAnalyticsData]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  return {
    ...data,
    refreshData: loadAnalyticsData,
    aggregateDailyAnalytics,
  };
}
