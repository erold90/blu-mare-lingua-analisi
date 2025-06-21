
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SiteVisit {
  id: string;
  timestamp: string;
  page: string;
}

export function useSiteVisits() {
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSiteVisits = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Loading site visits from database...");
      
      // Optimize query: load only recent visits and limit results
      const { data, error } = await supabase
        .from('site_visits')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(500) // Reduced limit for better performance
        .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days only
      
      if (error) {
        console.error('Error loading site visits:', error);
        // Don't throw, just log and continue with empty data
        setSiteVisits([]);
        return;
      }
      
      console.log("Site visits loaded:", data?.length || 0);
      setSiteVisits(data || []);
    } catch (error) {
      console.error('Error loading site visits:', error);
      setSiteVisits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addSiteVisit = useCallback(async (page: string) => {
    // Don't log admin area visits
    if (page.includes("/area-riservata")) {
      console.log("Skipping admin area visit:", page);
      return;
    }

    try {
      console.log("Adding site visit for page:", page);
      
      const visitData = {
        id: Math.random().toString(36).substring(2, 11),
        page,
        timestamp: new Date().toISOString()
      };

      const { error } = await supabase
        .from('site_visits')
        .insert(visitData);
      
      if (error) {
        console.error('Error saving site visit:', error);
        return;
      }

      console.log("Site visit saved successfully:", visitData);
      
      // Update local state immediately but don't exceed limit
      setSiteVisits(prev => [visitData, ...prev.slice(0, 499)]);
    } catch (error) {
      console.error('Error saving site visit:', error);
    }
  }, []);

  const getVisitsCount = useCallback((period: 'day' | 'month' | 'year'): number => {
    const now = new Date();
    
    const filteredVisits = siteVisits.filter(visit => {
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
    });

    return filteredVisits.length;
  }, [siteVisits]);

  // Load data only once on mount
  useEffect(() => {
    loadSiteVisits();
  }, []); // Empty dependency array to prevent loops

  return {
    siteVisits,
    loading,
    addSiteVisit,
    getVisitsCount,
    refreshSiteVisits: loadSiteVisits
  };
}
