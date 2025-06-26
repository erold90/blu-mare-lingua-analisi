
import { supabase } from '@/integrations/supabase/client';
import { SiteVisit } from '../useUnifiedAnalytics';

export const trackPageVisit = async (page: string) => {
  try {
    // Skip tracking per area admin
    if (page.includes('/area-riservata')) {
      console.log('🚫 Skipping admin area tracking:', page);
      return;
    }

    // Genera un ID unico per la visita più semplice e affidabile
    const visitId = `visit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    console.log('📊 Tracking page visit:', page, 'ID:', visitId);
    
    const visitData = {
      id: visitId,
      page: page,
      timestamp: new Date().toISOString()
    };

    console.log('📊 Attempting to save visit data:', visitData);
    
    // Tracking ottimizzato con timeout più breve
    const { data, error } = await Promise.race([
      supabase
        .from('site_visits')
        .insert(visitData)
        .select(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Insert timeout')), 3000)
      )
    ]);

    if (error) {
      console.error('❌ Site visit tracking error:', error);
      throw error;
    }

    console.log('✅ Site visit tracked successfully:', data);
    return data;

  } catch (error) {
    console.error('❌ Critical error in trackPageVisit:', error);
    
    // Fallback più robusto - salva in localStorage per debug
    try {
      const fallbackData = {
        page,
        timestamp: new Date().toISOString(),
        error: error.message || 'Unknown error'
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

export const loadSiteVisits = async () => {
  try {
    console.log('🔍 Loading site visits...');
    
    // Query ottimizzata con limite e timeout
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data, error } = await Promise.race([
      supabase
        .from('site_visits')
        .select('id, timestamp, page')
        .gte('timestamp', thirtyDaysAgo.toISOString())
        .order('timestamp', { ascending: false })
        .limit(500), // Ridotto per migliori performance
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 5000)
      )
    ]);

    if (error) {
      console.error('❌ Site visits query error:', error);
      throw error;
    }

    console.log(`✅ Loaded ${data?.length || 0} site visits`);
    return data || [];
    
  } catch (error) {
    console.error('❌ Site visits loading failed:', error);
    throw error;
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
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const filteredVisits = siteVisits.filter(visit => {
    try {
      const visitDate = new Date(visit.timestamp);
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

export const testSupabaseConnection = async () => {
  try {
    console.log('🔗 Testing Supabase connection...');
    
    // Test di connessione più semplice e veloce
    const { data, error, count } = await Promise.race([
      supabase
        .from('site_visits')
        .select('*', { count: 'exact', head: true }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 3000)
      )
    ]);
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful, total visits:', count);
    return true;
    
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    return false;
  }
};

// Funzione per recuperare tracking falliti dal localStorage
export const getFailedTracking = () => {
  try {
    return JSON.parse(localStorage.getItem('failed_tracking') || '[]');
  } catch (error) {
    console.warn('⚠️ Error reading failed tracking:', error);
    return [];
  }
};

// Funzione per pulire i tracking falliti
export const clearFailedTracking = () => {
  try {
    localStorage.removeItem('failed_tracking');
    console.log('🧹 Cleared failed tracking data');
  } catch (error) {
    console.warn('⚠️ Error clearing failed tracking:', error);
  }
};
