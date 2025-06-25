import { supabase } from '@/integrations/supabase/client';
import { SiteVisit } from '../useUnifiedAnalytics';

export const trackPageVisit = async (page: string) => {
  try {
    // Skip tracking for admin area
    if (page.includes('/area-riservata')) {
      return;
    }

    const visitId = `visit_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    
    // Fire and forget with very short timeout
    const trackingPromise = supabase
      .from('site_visits')
      .insert({
        id: visitId,
        page: page,
        timestamp: new Date().toISOString()
      });

    // Reduced timeout to 1 second for faster page loads
    Promise.race([
      trackingPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Tracking timeout')), 1000))
    ]).catch(error => {
      // Silent fail to not block UI
      console.debug('Site visit tracking failed (non-blocking):', error);
    });

  } catch (error) {
    console.debug('Error in trackSiteVisit (non-blocking):', error);
  }
};

export const loadSiteVisits = async () => {
  try {
    // Load only last 3 days for much faster loading
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const { data, error } = await supabase
      .from('site_visits')
      .select('*')
      .gte('timestamp', threeDaysAgo.toISOString())
      .order('timestamp', { ascending: false })
      .limit(50); // Drastically reduced limit

    if (error) {
      console.error('❌ Error loading site visits:', error);
      throw new Error(`Site visits error: ${error.message}`);
    }

    console.log(`✅ Loaded ${data?.length || 0} recent site visits`);
    return data || [];
  } catch (error) {
    console.error('❌ Error in loadSiteVisits:', error);
    return [];
  }
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
