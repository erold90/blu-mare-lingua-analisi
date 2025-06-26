
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

    // Reduced timeout to 500ms for even faster page loads
    Promise.race([
      trackingPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Tracking timeout')), 500))
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
    // Load only last 24 hours for ultra-fast loading
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    // Ultra-optimized query with minimal timeout
    const { data, error } = await supabase
      .from('site_visits')
      .select('id, timestamp, page')
      .gte('timestamp', oneDayAgo.toISOString())
      .order('timestamp', { ascending: false })
      .limit(20) // Drastically reduced limit for speed
      .abortSignal(AbortSignal.timeout(2000)); // 2 second timeout

    if (error) {
      console.warn('⚠️ Site visits query timeout/error (non-critical):', error);
      // Return empty array instead of throwing to prevent UI errors
      return [];
    }

    console.log(`✅ Loaded ${data?.length || 0} recent site visits (last 24h)`);
    return data || [];
  } catch (error) {
    console.warn('⚠️ Site visits loading failed (non-critical):', error);
    // Always return empty array to prevent UI crashes
    return [];
  }
};

export const calculateVisitsCount = (
  siteVisits: SiteVisit[], 
  period: 'day' | 'month' | 'year'
): number => {
  if (!siteVisits || siteVisits.length === 0) {
    return 0;
  }

  const now = new Date();
  
  return siteVisits.filter(visit => {
    try {
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
    } catch (error) {
      console.debug('Error parsing visit date:', error);
      return false;
    }
  }).length;
};
