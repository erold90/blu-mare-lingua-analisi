
import { supabase } from '@/integrations/supabase/client';
import { SiteVisit } from '../useUnifiedAnalytics';

export const trackPageVisit = async (page: string) => {
  try {
    // Skip tracking for admin area
    if (page.includes('/area-riservata')) {
      return;
    }

    const visitId = `visit_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    
    const { error } = await supabase
      .from('site_visits')
      .insert({
        id: visitId,
        page: page,
        timestamp: new Date().toISOString()
      });

    if (error) {
      console.error('❌ Error tracking site visit:', error);
      return;
    }

    console.log('✅ Site visit tracked:', page);
  } catch (error) {
    console.error('❌ Error in trackSiteVisit:', error);
  }
};

export const loadSiteVisits = async () => {
  const { data, error } = await supabase
    .from('site_visits')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(1000);

  if (error) {
    console.error('❌ Error loading site visits:', error);
    throw new Error(`Site visits error: ${error.message}`);
  }

  return data || [];
};

export const calculateVisitsCount = (
  siteVisits: SiteVisit[], 
  period: 'day' | 'month' | 'year'
): number => {
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
