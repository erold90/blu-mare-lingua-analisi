
import { supabase } from '@/integrations/supabase/client';
import { SiteVisit } from '../useUnifiedAnalytics';
import { 
  isSupabaseResponse, 
  isSupabaseCountResponse,
  isOptimizedVisitCounts,
  isValidPageUrl,
  sanitizePageUrl,
  OptimizedVisitCounts
} from '../utils/typeGuards';

// Configurazione timeout unificata
export const UNIFIED_TIMEOUT = 4000; // 4 secondi per tutte le operazioni
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;

// Cache ottimizzata con TTL più lunghi
const queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

function getCachedResult(key: string): any | null {
  const cached = queryCache.get(key);
  if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
    return cached.data;
  }
  queryCache.delete(key);
  return null;
}

function setCachedResult(key: string, data: any, ttl: number = 300000): void { // 5 minuti default
  queryCache.set(key, { data, timestamp: Date.now(), ttl });
  
  // Cleanup cache se diventa troppo grande
  if (queryCache.size > 20) {
    const oldestEntry = Array.from(queryCache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0];
    queryCache.delete(oldestEntry[0]);
  }
}

// Utility per retry con exponential backoff
async function withRetry<T>(
  operation: () => Promise<T>,
  attempts: number = RETRY_ATTEMPTS,
  delay: number = RETRY_DELAY
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (attempts > 1) {
      console.warn(`⚠️ Operation failed, retrying in ${delay}ms... (${attempts - 1} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(operation, attempts - 1, delay * 2);
    }
    throw error;
  }
}

// Tracking ottimizzato con validazione
export const trackPageVisitOptimized = async (page: string): Promise<void> => {
  if (!isValidPageUrl(page)) {
    console.log('🚫 Skipping invalid page:', page);
    return;
  }

  const cleanPage = sanitizePageUrl(page);
  console.log('📊 Tracking optimized page visit:', cleanPage);

  try {
    await withRetry(async () => {
      const visitData = {
        id: `visit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        page: cleanPage,
        created_at: new Date().toISOString()
      };

      const result = await Promise.race([
        supabase.from('site_visits').insert(visitData).select(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Insert timeout')), UNIFIED_TIMEOUT)
        )
      ]);

      if (!isSupabaseResponse(result)) {
        throw new Error('Invalid response format');
      }

      if (result.error) {
        throw result.error;
      }

      console.log('✅ Page visit tracked successfully');
    });
  } catch (error) {
    console.error('❌ Failed to track page visit:', error);
    // Salva per retry più tardi
    saveFailedTracking(cleanPage, error);
    throw error;
  }
};

// Caricamento visite ottimizzato con paginazione
export const loadSiteVisitsOptimized = async (limit: number = 500): Promise<SiteVisit[]> => {
  const cacheKey = `site_visits_optimized_${limit}`;
  const cached = getCachedResult(cacheKey);
  
  if (cached) {
    console.log('✅ Using cached optimized site visits');
    return cached;
  }

  try {
    console.log('🔍 Loading optimized site visits...');
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await withRetry(async () => {
      return await Promise.race([
        supabase
          .from('site_visits')
          .select('id, page, created_at')
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(limit),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), UNIFIED_TIMEOUT)
        )
      ]);
    });

    if (!isSupabaseResponse(result)) {
      throw new Error('Invalid response format');
    }

    if (result.error) {
      throw result.error;
    }

    const visits = (result.data || []).map((visit: any) => ({
      id: visit.id,
      page: visit.page,
      created_at: visit.created_at,
      timestamp: visit.created_at
    })) as SiteVisit[];

    setCachedResult(cacheKey, visits, 600000); // 10 minuti cache per le visite
    console.log(`✅ Loaded ${visits.length} optimized site visits`);
    return visits;

  } catch (error) {
    console.error('❌ Optimized site visits loading failed:', error);
    throw error;
  }
};

// Usa la nuova funzione database per conteggi in una singola query
export const getOptimizedVisitCounts = async (): Promise<OptimizedVisitCounts> => {
  const cacheKey = 'optimized_visit_counts';
  const cached = getCachedResult(cacheKey);
  
  if (cached && isOptimizedVisitCounts(cached)) {
    console.log('✅ Using cached optimized visit counts');
    return cached;
  }

  try {
    console.log('📊 Getting optimized visit counts from database function...');
    
    const result = await withRetry(async () => {
      return await Promise.race([
        supabase.rpc('get_optimized_visit_counts'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('RPC timeout')), UNIFIED_TIMEOUT)
        )
      ]);
    });

    if (!isSupabaseResponse(result)) {
      throw new Error('Invalid response format');
    }

    if (result.error) {
      console.warn('⚠️ Database function failed, falling back to manual calculation');
      return await fallbackVisitCounts();
    }

    const counts = result.data?.[0];
    if (!isOptimizedVisitCounts(counts)) {
      console.warn('⚠️ Invalid counts format, using fallback');
      return await fallbackVisitCounts();
    }

    const optimizedCounts: OptimizedVisitCounts = {
      visits_today: Number(counts.visits_today) || 0,
      visits_month: Number(counts.visits_month) || 0,
      visits_year: Number(counts.visits_year) || 0
    };

    setCachedResult(cacheKey, optimizedCounts, 300000); // 5 minuti cache
    console.log('✅ Got optimized visit counts:', optimizedCounts);
    return optimizedCounts;

  } catch (error) {
    console.error('❌ Failed to get optimized visit counts:', error);
    return await fallbackVisitCounts();
  }
};

// Fallback per conteggi se la funzione database fallisce
async function fallbackVisitCounts(): Promise<OptimizedVisitCounts> {
  console.log('🔄 Using fallback visit counts calculation...');
  
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

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

    return {
      visits_today: dayResult.status === 'fulfilled' && isSupabaseCountResponse(dayResult.value) 
        ? dayResult.value.count || 0 : 0,
      visits_month: monthResult.status === 'fulfilled' && isSupabaseCountResponse(monthResult.value) 
        ? monthResult.value.count || 0 : 0,
      visits_year: yearResult.status === 'fulfilled' && isSupabaseCountResponse(yearResult.value) 
        ? yearResult.value.count || 0 : 0
    };
  } catch (error) {
    console.error('❌ Fallback counts also failed:', error);
    return { visits_today: 0, visits_month: 0, visits_year: 0 };
  }
}

// Gestione improved del failed tracking
function saveFailedTracking(page: string, error: any): void {
  try {
    const failedData = {
      page,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      retryable: true
    };
    
    const existing = JSON.parse(localStorage.getItem('failed_tracking_v2') || '[]');
    existing.push(failedData);
    
    // Mantieni solo gli ultimi 10 errori
    if (existing.length > 10) {
      existing.splice(0, existing.length - 10);
    }
    
    localStorage.setItem('failed_tracking_v2', JSON.stringify(existing));
  } catch (lsError) {
    console.warn('⚠️ Could not save failed tracking:', lsError);
  }
}

export const getFailedTrackingOptimized = (): any[] => {
  try {
    return JSON.parse(localStorage.getItem('failed_tracking_v2') || '[]');
  } catch (error) {
    console.warn('⚠️ Error reading failed tracking:', error);
    return [];
  }
};

export const clearFailedTrackingOptimized = (): void => {
  try {
    localStorage.removeItem('failed_tracking_v2');
    localStorage.removeItem('failed_tracking'); // Pulisci anche la vecchia versione
    console.log('🧹 Cleared optimized failed tracking data');
  } catch (error) {
    console.warn('⚠️ Error clearing failed tracking:', error);
  }
};

// Test connessione ottimizzato
export const testSupabaseConnectionOptimized = async (): Promise<boolean> => {
  try {
    console.log('🔗 Testing optimized Supabase connection...');
    
    const result = await Promise.race([
      supabase.from('site_visits').select('*', { count: 'exact', head: true }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), UNIFIED_TIMEOUT)
      )
    ]);
    
    if (!isSupabaseCountResponse(result)) {
      return false;
    }
    
    if (result.error) {
      console.error('❌ Connection test failed:', result.error);
      return false;
    }
    
    console.log('✅ Optimized Supabase connection successful');
    return true;
    
  } catch (error) {
    console.error('❌ Connection test error:', error);
    return false;
  }
};
