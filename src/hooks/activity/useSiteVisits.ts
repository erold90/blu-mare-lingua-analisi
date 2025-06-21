
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
      console.log("Loading site visits from database...");
      
      const { data, error } = await supabase
        .from('site_visits')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1000); // Increased limit to get more data
      
      if (error) {
        console.error('Error loading site visits:', error);
        return;
      }
      
      console.log("Site visits loaded:", data?.length || 0);
      setSiteVisits(data || []);
    } catch (error) {
      console.error('Error loading site visits:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSiteVisit = async (page: string) => {
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
      
      // Update local state immediately
      setSiteVisits(prev => [visitData, ...prev.slice(0, 999)]);
    } catch (error) {
      console.error('Error saving site visit:', error);
    }
  };

  const getVisitsCount = (period: 'day' | 'month' | 'year'): number => {
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

    console.log(`Visits for ${period}:`, filteredVisits.length);
    return filteredVisits.length;
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
