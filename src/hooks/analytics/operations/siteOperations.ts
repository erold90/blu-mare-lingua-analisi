
import { supabase } from '@/integrations/supabase/client';
import { SiteVisit } from '../useAnalytics';

const TIMEOUT_CONFIG = {
  TRACK_VISIT: 3000,
  LOAD_VISITS: 5000,
  CONNECTION_TEST: 2000
};

const queryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60000;

function getCachedResult(key: string): any | null {
  const cached = queryCache.get(key);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }
  queryCache.delete(key);
  return null;
}

function setCachedResult(key: string, data: any): void {
  queryCache.set(key, { data, timestamp: Date.now() });
  
  if (queryCache.size > 50) {
    const oldestKey = queryCache.keys().next().value;
    queryCache.delete(oldestKey);
  }
}

export const trackPageVisit = async (page: string) => {
  try {
    if (page.includes('/area-riservata') || page.includes('/admin')) {
      console.log('🚫 Skipping admin area tracking:', page);
      return;
    }

    const visitId = `visit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    console.log('📊 Tracking page visit:', page, 'ID:', visitId);
    
    const visitData = {
      id: visitId,
      page: page,
      created_at: new Date().toISOString()
    };

    const result = await Promise.race([
      supabase
        .from('site_visits')
        .insert(visitData)
        .select(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Insert timeout')), TIMEOUT_CONFIG.TRACK_VISIT)
      )
    ]);

    console.log('✅ Site visit tracked successfully');
    return result;

  } catch (error) {
    console.error('❌ Critical error in trackPageVisit:', error);
    
    try {
      const fallbackData = {
        page,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        retryable: true
      };
      
      const existingFailed = JSON.parse(localStorage.getItem('failed_tracking') || '[]');
      existingFailed.push(fallbackData);
      
      if (existingFailed.length > 20) {
        existingFailed.splice(0, existingFailed.length - 20);
      }
      
      localStorage.setItem('failed_tracking', JSON.stringify(existingFailed));
      console.log('💾 Saved failed tracking to localStorage for retry');
    } catch (lsError) {
      console.warn('⚠️ Could not save to localStorage:', lsError);
    }
    
    throw error;
  }
};

export const loadSiteVisits = async (): Promise<SiteVisit[]> => {
  try {
    const cacheKey = 'site_visits_recent';
    const cached = getCachedResult(cacheKey);
    
    if (cached) {
      console.log('✅ Using cached site visits');
      return cached;
    }

    console.log('🔍 Loading site visits from database...');
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await Promise.race([
      supabase
        .from('site_visits')
        .select('id, page, created_at, user_agent, referrer, session_id, ip_address')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(1000),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), TIMEOUT_CONFIG.LOAD_VISITS)
      )
    ]);

    // Type guard per assicurarsi che result sia del tipo corretto
    if (result && typeof result === 'object' && 'data' in result && 'error' in result) {
      const { data, error } = result as { data: any[] | null; error: any };

      if (error) {
        console.error('❌ Site visits query error:', error);
        throw error;
      }

      const visits: SiteVisit[] = (data || []).map((visit: any) => ({
        id: visit.id,
        page: visit.page,
        created_at: visit.created_at,
        user_agent: visit.user_agent || undefined,
        referrer: visit.referrer || undefined,
        session_id: visit.session_id || undefined,
        ip_address: visit.ip_address ? String(visit.ip_address) : undefined
      }));

      setCachedResult(cacheKey, visits);
      console.log(`✅ Loaded ${visits.length} site visits`);
      return visits;
    }

    throw new Error('Invalid response format');
    
  } catch (error) {
    console.error('❌ Site visits loading failed:', error);
    throw error;
  }
};

export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('🔗 Testing Supabase connection...');
    
    const result = await Promise.race([
      supabase
        .from('site_visits')
        .select('*', { count: 'exact', head: true }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), TIMEOUT_CONFIG.CONNECTION_TEST)
      )
    ]);
    
    // Type guard per il risultato
    if (result && typeof result === 'object' && 'error' in result && 'count' in result) {
      const { error, count } = result as { error: any; count: number };
      
      if (error) {
        console.error('❌ Supabase connection test failed:', error);
        return false;
      }
      
      console.log('✅ Supabase connection successful, total visits:', count);
      return true;
    }

    throw new Error('Invalid response format');
    
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    return false;
  }
};

export const cleanupOldVisits = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🧹 Starting cleanup of old visits...');
    
    const { error } = await supabase.rpc('cleanup_old_analytics');
    
    if (error) {
      console.error('❌ Cleanup failed:', error);
      return { success: false, message: `Cleanup failed: ${error.message}` };
    }
    
    console.log('✅ Cleanup completed successfully');
    return { success: true, message: 'Old visits cleaned up successfully' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Cleanup error:', error);
    return { success: false, message: `Cleanup error: ${message}` };
  }
};

export const getFailedTracking = (): any[] => {
  try {
    return JSON.parse(localStorage.getItem('failed_tracking') || '[]');
  } catch (error) {
    console.warn('⚠️ Error reading failed tracking:', error);
    return [];
  }
};

export const clearFailedTracking = (): void => {
  try {
    localStorage.removeItem('failed_tracking');
    console.log('🧹 Cleared failed tracking data');
  } catch (error) {
    console.warn('⚠️ Error clearing failed tracking:', error);
  }
};
