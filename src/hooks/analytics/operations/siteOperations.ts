
import { supabase } from '@/integrations/supabase/client';
import { SiteVisit } from '../useUnifiedAnalytics';

// Type guard robusto per le risposte Supabase
const isSupabaseResponse = (result: any): result is { data: any; error: any } => {
  return result && 
         typeof result === 'object' && 
         'data' in result && 
         'error' in result;
};

// Configurazione timeout unificata
const TIMEOUT_CONFIG = {
  TRACK_VISIT: 2000,
  LOAD_VISITS: 3000,
  CONNECTION_TEST: 2000
};

export const trackPageVisit = async (page: string) => {
  try {
    // Skip tracking per area admin
    if (page.includes('/area-riservata')) {
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
    
    // Fallback robusto - salva in localStorage per debug
    try {
      const fallbackData = {
        page,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      const existingFailed = JSON.parse(localStorage.getItem('failed_tracking') || '[]');
      existingFailed.push(fallbackData);
      
      // Mantieni solo gli ultimi 10 errori
      if (existingFailed.length > 10) {
        existingFailed.splice(0, existingFailed.length - 10);
      }
      
      localStorage.setItem('failed_tracking', JSON.stringify(existingFailed));
      console.log('💾 Saved failed tracking to localStorage');
    } catch (lsError) {
      console.warn('⚠️ Could not save to localStorage:', lsError);
    }
    
    throw error;
  }
};

export const loadSiteVisits = async (): Promise<SiteVisit[]> => {
  try {
    console.log('🔍 Loading site visits...');
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await Promise.race([
      supabase
        .from('site_visits')
        .select('id, page, created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(500),
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
        timestamp: visit.created_at // Per compatibilità con codice legacy
      })) as SiteVisit[];

      console.log(`✅ Loaded ${visits.length} site visits`);
      return visits;
    }

    throw new Error('Invalid response format');
    
  } catch (error) {
    console.error('❌ Site visits loading failed:', error);
    throw error;
  }
};

// Funzione ottimizzata per calcolare visite usando query database
export const calculateVisitsCount = async (period: 'day' | 'month' | 'year'): Promise<number> => {
  try {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        throw new Error(`Invalid period: ${period}`);
    }

    const { data, error } = await supabase
      .from('site_visits')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    if (error) {
      console.error(`❌ Error calculating ${period} visits:`, error);
      throw error;
    }

    return data ? (data as any).count || 0 : 0;
  } catch (error) {
    console.warn(`⚠️ Failed to calculate ${period} visits, using fallback`);
    return 0;
  }
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
    
    if (isSupabaseResponse(result)) {
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
