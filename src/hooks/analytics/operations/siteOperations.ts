
import { supabase } from '@/integrations/supabase/client';
import { SiteVisit } from '../useUnifiedAnalytics';

export const trackPageVisit = async (page: string) => {
  try {
    // Skip tracking per area admin
    if (page.includes('/area-riservata')) {
      console.log('🚫 Skipping admin area tracking:', page);
      return;
    }

    // Genera un ID unico per la visita con timestamp più preciso
    const visitId = `visit_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    console.log('📊 Tracking page visit:', page, 'ID:', visitId);
    
    // Tracking immediato e più robusto
    const visitData = {
      id: visitId,
      page: page,
      timestamp: new Date().toISOString()
    };

    console.log('📊 Attempting to save visit data:', visitData);
    
    // Prova il salvataggio con retry logic
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        const { data, error } = await supabase
          .from('site_visits')
          .insert(visitData)
          .select();

        if (error) {
          console.warn(`⚠️ Site visit tracking attempt ${attempts + 1} failed:`, error);
          if (attempts === maxAttempts - 1) {
            throw error;
          }
          attempts++;
          // Breve pausa prima del retry
          await new Promise(resolve => setTimeout(resolve, 500));
          continue;
        }

        console.log('✅ Site visit tracked successfully:', data);
        return data;
        
      } catch (retryError) {
        console.warn(`⚠️ Retry ${attempts + 1} failed:`, retryError);
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

  } catch (error) {
    console.error('❌ Critical error in trackPageVisit:', error);
    // Fallback: prova a salvare in localStorage per debug
    try {
      const fallbackData = {
        page,
        timestamp: new Date().toISOString(),
        error: error.message
      };
      localStorage.setItem('failed_tracking_' + Date.now(), JSON.stringify(fallbackData));
      console.log('💾 Saved failed tracking to localStorage for debugging');
    } catch (lsError) {
      console.warn('⚠️ Could not save to localStorage:', lsError);
    }
  }
};

export const loadSiteVisits = async () => {
  try {
    console.log('🔍 Loading site visits...');
    
    // Carica le visite degli ultimi 30 giorni
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    console.log('📅 Loading visits from:', thirtyDaysAgo.toISOString());
    
    const { data, error } = await supabase
      .from('site_visits')
      .select('id, timestamp, page')
      .gte('timestamp', thirtyDaysAgo.toISOString())
      .order('timestamp', { ascending: false })
      .limit(1000);

    if (error) {
      console.error('❌ Site visits query error:', error);
      return [];
    }

    console.log(`✅ Loaded ${data?.length || 0} site visits (last 30 days)`);
    
    // Log delle ultime 5 visite per debug
    if (data && data.length > 0) {
      console.log('📊 Recent visits:', data.slice(0, 5).map(v => ({ page: v.page, timestamp: v.timestamp })));
    }
    
    return data || [];
  } catch (error) {
    console.error('❌ Site visits loading failed:', error);
    return [];
  }
};

export const calculateVisitsCount = (
  siteVisits: SiteVisit[], 
  period: 'day' | 'month' | 'year'
): number => {
  if (!siteVisits || siteVisits.length === 0) {
    console.log(`📊 No visits found for period: ${period}`);
    return 0;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const filteredVisits = siteVisits.filter(visit => {
    try {
      const visitDate = new Date(visit.timestamp);
      const visitDay = new Date(visitDate.getFullYear(), visitDate.getMonth(), visitDate.getDate());
      
      if (period === 'day') {
        const isToday = visitDay.getTime() === today.getTime();
        if (isToday) {
          console.log(`📅 Found today's visit:`, visit.page, visit.timestamp);
        }
        return isToday;
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
      console.warn('⚠️ Error parsing visit date:', error, visit);
      return false;
    }
  });

  console.log(`📊 Visits count for ${period}:`, filteredVisits.length);
  return filteredVisits.length;
};

// Funzione di debug per controllare la connessione Supabase
export const testSupabaseConnection = async () => {
  try {
    console.log('🔗 Testing Supabase connection...');
    const { data, error } = await supabase
      .from('site_visits')
      .select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful, total visits:', data);
    return true;
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    return false;
  }
};
