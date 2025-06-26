
import { supabase } from '@/integrations/supabase/client';
import { SiteVisit } from '../useUnifiedAnalytics';

export const trackPageVisit = async (page: string) => {
  try {
    // Skip tracking per area admin
    if (page.includes('/area-riservata')) {
      console.log('🚫 Skipping admin area tracking:', page);
      return;
    }

    // Genera un ID unico per la visita
    const visitId = `visit_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    
    console.log('📊 Tracking page visit:', page, 'ID:', visitId);
    
    // Traccia la visita in background senza bloccare l'UI
    const trackingPromise = supabase
      .from('site_visits')
      .insert({
        id: visitId,
        page: page,
        timestamp: new Date().toISOString()
      });

    // Timeout ridotto per non bloccare il caricamento della pagina
    Promise.race([
      trackingPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Tracking timeout')), 1000))
    ]).then(() => {
      console.log('✅ Site visit tracked successfully:', page);
    }).catch(error => {
      // Fail silenzioso per non bloccare l'UI
      console.warn('⚠️ Site visit tracking failed (non-blocking):', error);
    });

  } catch (error) {
    console.warn('⚠️ Error in trackPageVisit (non-blocking):', error);
  }
};

export const loadSiteVisits = async () => {
  try {
    console.log('🔍 Loading site visits...');
    
    // Carica le visite degli ultimi 30 giorni per avere dati significativi
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data, error } = await supabase
      .from('site_visits')
      .select('id, timestamp, page')
      .gte('timestamp', thirtyDaysAgo.toISOString())
      .order('timestamp', { ascending: false })
      .limit(1000); // Limite ragionevole per performance

    if (error) {
      console.warn('⚠️ Site visits query error:', error);
      return [];
    }

    console.log(`✅ Loaded ${data?.length || 0} site visits (last 30 days)`);
    return data || [];
  } catch (error) {
    console.warn('⚠️ Site visits loading failed:', error);
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
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return siteVisits.filter(visit => {
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
  }).length;
};
