
import { supabase } from '@/integrations/supabase/client';
import { SiteVisit } from '../useUnifiedAnalytics';

export const trackPageVisit = async (page: string) => {
  try {
    // Skip tracking for admin area
    if (page.includes('/area-riservata')) {
      return;
    }

    const visitId = `visit_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    
    // Use timeout for tracking to avoid blocking UI
    const trackingPromise = supabase
      .from('site_visits')
      .insert({
        id: visitId,
        page: page,
        timestamp: new Date().toISOString()
      });

    // Don't wait for tracking to complete, fire and forget with timeout
    Promise.race([
      trackingPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Tracking timeout')), 2000))
    ]).catch(error => {
      console.warn('⚠️ Site visit tracking failed (non-blocking):', error);
    });

  } catch (error) {
    console.warn('⚠️ Error in trackSiteVisit (non-blocking):', error);
  }
};

export const loadSiteVisits = async () => {
  try {
    // Load only recent visits (last 7 days) for faster loading
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data, error } = await supabase
      .from('site_visits')
      .select('*')
      .gte('timestamp', sevenDaysAgo.toISOString())
      .order('timestamp', { ascending: false })
      .limit(200); // Reduced limit for faster loading

    if (error) {
      console.error('❌ Error loading site visits:', error);
      throw new Error(`Site visits error: ${error.message}`);
    }

    console.log(`✅ Loaded ${data?.length || 0} recent site visits`);
    return data || [];
  } catch (error) {
    console.error('❌ Error in loadSiteVisits:', error);
    // Return empty array on error to prevent app crash
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
