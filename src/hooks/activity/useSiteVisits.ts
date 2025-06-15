
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SiteVisit {
  id: string;
  timestamp: string;
  page: string;
}

export function useSiteVisits() {
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSiteVisits = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_visits')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(500); // Reduced limit for performance
      
      if (error) {
        console.error('Error loading site visits:', error);
        return;
      }
      
      setSiteVisits(data || []);
    } catch (error) {
      console.error('Error loading site visits:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSiteVisit = async (page: string) => {
    if (page.includes("/area-riservata")) {
      return; // Don't log admin area visits
    }

    try {
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

      setSiteVisits(prev => [visitData, ...prev.slice(0, 499)]);
    } catch (error) {
      console.error('Error saving site visit:', error);
    }
  };

  const getVisitsCount = (period: 'day' | 'month' | 'year'): number => {
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
  };

  useEffect(() => {
    loadSiteVisits();
  }, []);

  return {
    siteVisits,
    loading,
    addSiteVisit,
    getVisitsCount,
    refreshSiteVisits: loadSiteVisits
  };
}
