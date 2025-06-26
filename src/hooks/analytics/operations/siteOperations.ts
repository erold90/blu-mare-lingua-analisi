import { supabase } from '@/integrations/supabase/client';
import { SiteVisit } from '../useUnifiedAnalytics';

// Type guards ottimizzati e robusti
const isSupabaseResponse = (result: any): result is { data: any; error: any } => {
  return result && 
         typeof result === 'object' && 
         'data' in result && 
         'error' in result;
};

const isSupabaseCountResponse = (result: any): result is { data: any; error: any; count: number | null } => {
  return result && 
         typeof result === 'object' && 
         'data' in result && 
         'error' in result &&
         'count' in result;
};

// Configurazione timeout unificata e ottimizzata
const TIMEOUT_CONFIG = {
  TRACK_VISIT: 3000,      // Aumentato per maggiore affidabilità
  LOAD_VISITS: 5000,      // Aumentato per query complesse
  CONNECTION_TEST: 2000,
  BATCH_OPERATIONS: 8000  // Nuovo per operazioni batch
};

// Cache per evitare query duplicate
const queryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minuto

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
  
  // Pulisci cache se diventa troppo grande
  if (queryCache.size > 50) {
    const oldestKey = queryCache.keys().next().value;
    queryCache.delete(oldestKey);
  }
}

export const trackPageVisit = async (page: string) => {
  try {
    // Skip tracking per area admin - controllo migliorato
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

    if (isSupabaseResponse(result)) {
      const { data, error } = result;

      if (error) {
        console.error('❌ Site visit tracking error:', error);
        throw error;
      }

      console.log('✅ Site visit tracked successfully:', data);
      return data;
    }

    throw new Error('Invalid response format');

  } catch (error) {
    console.error('❌ Critical error in trackPageVisit:', error);
    
    // Fallback migliorato con retry
    try {
      const fallbackData = {
        page,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        retryable: true
      };
      
      const existingFailed = JSON.parse(localStorage.getItem('failed_tracking') || '[]');
      existingFailed.push(fallbackData);
      
      // Mantieni solo gli ultimi 20 errori
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
        .select('id, page, created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(1000), // Aumentato il limite
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), TIMEOUT_CONFIG.LOAD_VISITS)
      )
    ]);

    if (isSupabaseResponse(result)) {
      const { data, error } = result;

      if (error) {
        console.error('❌ Site visits query error:', error);
        throw error;
      }

      const visits = (data || []).map((visit: any) => ({
        id: visit.id,
        page: visit.page,
        created_at: visit.created_at,
        timestamp: visit.created_at
      })) as SiteVisit[];

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

// Funzione ottimizzata con batch queries per migliorare performance
export const calculateAllVisitsCounts = async (): Promise<{
  day: number;
  month: number;
  year: number;
}> => {
  try {
    const cacheKey = 'visits_counts_all';
    const cached = getCachedResult(cacheKey);
    
    if (cached) {
      console.log('✅ Using cached visits counts');
      return cached;
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Batch query per tutte le metriche insieme
    const [dayResult, monthResult, yearResult] = await Promise.allSettled([
      supabase
        .from('site_visits')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfDay.toISOString()),
      supabase
        .from('site_visits')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString()),
      supabase
        .from('site_visits')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfYear.toISOString())
    ]);

    const counts = {
      day: 0,
      month: 0,
      year: 0
    };

    if (dayResult.status === 'fulfilled' && isSupabaseCountResponse(dayResult.value)) {
      counts.day = dayResult.value.count || 0;
    }

    if (monthResult.status === 'fulfilled' && isSupabaseCountResponse(monthResult.value)) {
      counts.month = monthResult.value.count || 0;
    }

    if (yearResult.status === 'fulfilled' && isSupabaseCountResponse(yearResult.value)) {
      counts.year = yearResult.value.count || 0;
    }

    setCachedResult(cacheKey, counts);
    console.log('✅ Calculated all visits counts:', counts);
    return counts;

  } catch (error) {
    console.error('❌ Failed to calculate visits counts:', error);
    return { day: 0, month: 0, year: 0 };
  }
};

// Manteniamo la funzione legacy per compatibilità
export const calculateVisitsCount = async (period: 'day' | 'month' | 'year'): Promise<number> => {
  const counts = await calculateAllVisitsCounts();
  return counts[period];
};

// Funzione legacy per compatibilità - deprecata
export const calculateVisitsCountLegacy = (
  siteVisits: SiteVisit[], 
  period: 'day' | 'month' | 'year'
): number => {
  console.warn('⚠️ Using legacy calculateVisitsCount - consider migrating to database query version');
  
  if (!siteVisits || siteVisits.length === 0) {
    return 0;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const filteredVisits = siteVisits.filter(visit => {
    try {
      const visitDate = new Date(visit.created_at);
      const visitDay = new Date(visitDate.getFullYear(), visitDate.getMonth(), visitDate.getDate());
      
      if (period === 'day') {
        return visitDay.getTime() === today.getTime();
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
      console.warn('⚠️ Error parsing visit date:', error);
      return false;
    }
  });

  return filteredVisits.length;
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
    
    if (isSupabaseCountResponse(result)) {
      const { error, count } = result;
      
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

// Nuova funzione per statistiche ottimizzate usando la vista
export const loadOptimizedStats = async () => {
  try {
    console.log('📊 Loading optimized stats...');
    
    const { data, error } = await supabase
      .from('site_visits_stats')
      .select('*')
      .limit(50);

    if (error) {
      console.error('❌ Error loading optimized stats:', error);
      throw error;
    }

    console.log('✅ Loaded optimized stats:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('❌ Failed to load optimized stats:', error);
    throw error;
  }
};

// Funzione per pulizia dati vecchi
export const cleanupOldVisits = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🧹 Starting cleanup of old visits...');
    
    const { error } = await supabase.rpc('cleanup_old_site_visits');
    
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

// Funzione per retry dei tracking falliti
export const retryFailedTracking = async (): Promise<{ success: number; failed: number }> => {
  try {
    const failedTracking = getFailedTracking();
    const retryableTracking = failedTracking.filter(item => item.retryable !== false);
    
    if (retryableTracking.length === 0) {
      return { success: 0, failed: 0 };
    }

    console.log(`🔄 Retrying ${retryableTracking.length} failed tracking attempts...`);
    
    let success = 0;
    let failed = 0;

    for (const item of retryableTracking) {
      try {
        await trackPageVisit(item.page);
        success++;
      } catch (error) {
        failed++;
        console.warn('⚠️ Retry failed for:', item.page);
      }
    }

    // Aggiorna il localStorage rimuovendo quelli riusciti
    if (success > 0) {
      const remaining = failedTracking.slice(success);
      localStorage.setItem('failed_tracking', JSON.stringify(remaining));
    }

    console.log(`✅ Retry completed: ${success} success, ${failed} failed`);
    return { success, failed };

  } catch (error) {
    console.error('❌ Error during retry operation:', error);
    return { success: 0, failed: 0 };
  }
};

// Funzioni di utilità per il debugging
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

// Funzione per debug delle performance
export const getPerformanceMetrics = () => {
  return {
    timeouts: TIMEOUT_CONFIG,
    localStorage: {
      failedTracking: getFailedTracking().length
    },
    timestamp: new Date().toISOString()
  };
};
