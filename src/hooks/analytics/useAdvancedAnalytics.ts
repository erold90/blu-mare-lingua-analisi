
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  country?: string;
  deviceType?: string;
  page?: string;
}

export function useAdvancedAnalytics(filters: AnalyticsFilters = {}) {
  const [dailyAnalytics, setDailyAnalytics] = useState<any[]>([]);
  const [visitorSessions, setVisitorSessions] = useState<any[]>([]);
  const [pageViews, setPageViews] = useState<any[]>([]);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAdvancedData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

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

      const [
        { data: dailyData, error: dailyError },
        { data: sessionsData, error: sessionsError },
        { data: pageViewsData, error: pageViewsError },
        { data: interactionsData, error: interactionsError }
      ] = await Promise.all(promises);

      if (dailyError || sessionsError || pageViewsError || interactionsError) {
        throw new Error('Error loading advanced analytics data');
      }

      setDailyAnalytics(dailyData || []);
      setVisitorSessions(sessionsData || []);
      setPageViews(pageViewsData || []);
      setInteractions(interactionsData || []);

    } catch (error) {
      console.error('Error loading advanced analytics data:', error);
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
      await loadAdvancedData();
    } catch (error) {
      console.error('Error aggregating analytics:', error);
    }
  }, [loadAdvancedData]);

  useEffect(() => {
    loadAdvancedData();
  }, [loadAdvancedData]);

  return {
    dailyAnalytics,
    visitorSessions,
    pageViews,
    interactions,
    loading,
    error,
    refreshData: loadAdvancedData,
    aggregateDailyAnalytics
  };
}
