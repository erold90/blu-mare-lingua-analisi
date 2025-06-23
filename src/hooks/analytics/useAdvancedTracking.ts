
import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface VisitorSession {
  session_id: string;
  visitor_ip?: string;
  user_agent: string;
  device_type: string;
  browser: string;
  operating_system: string;
  screen_resolution: string;
  language: string;
  timezone: string;
  country?: string;
  city?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

interface PageView {
  session_id: string;
  page_url: string;
  page_title: string;
  time_on_page?: number;
  scroll_depth?: number;
  exit_page?: boolean;
}

interface VisitorInteraction {
  session_id: string;
  interaction_type: string;
  element_id?: string;
  element_class?: string;
  element_text?: string;
  page_url: string;
  additional_data?: any;
}

export function useAdvancedTracking() {
  const location = useLocation();
  const sessionRef = useRef<string | null>(null);
  const pageStartTime = useRef<number>(Date.now());
  const maxScrollDepth = useRef<number>(0);
  const isTrackingEnabled = useRef<boolean>(true);

  // Genera o recupera session ID
  const getSessionId = useCallback(() => {
    if (sessionRef.current) return sessionRef.current;
    
    let sessionId = sessionStorage.getItem('visitor_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      sessionStorage.setItem('visitor_session_id', sessionId);
    }
    sessionRef.current = sessionId;
    return sessionId;
  }, []);

  // Rileva informazioni del dispositivo e browser
  const getDeviceInfo = useCallback((): Partial<VisitorSession> => {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    
    // Rileva device type
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)/i.test(userAgent);
    const device_type = isMobile ? (isTablet ? 'tablet' : 'mobile') : 'desktop';
    
    // Rileva browser
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    else if (userAgent.includes('Opera')) browser = 'Opera';
    
    // Rileva OS
    let operating_system = 'Unknown';
    if (platform.includes('Win')) operating_system = 'Windows';
    else if (platform.includes('Mac')) operating_system = 'macOS';
    else if (platform.includes('Linux')) operating_system = 'Linux';
    else if (userAgent.includes('Android')) operating_system = 'Android';
    else if (userAgent.includes('iOS')) operating_system = 'iOS';
    
    return {
      user_agent: userAgent,
      device_type,
      browser,
      operating_system,
      screen_resolution: `${screen.width}x${screen.height}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }, []);

  // Estrae parametri UTM dall'URL
  const getUtmParameters = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      utm_source: urlParams.get('utm_source') || undefined,
      utm_medium: urlParams.get('utm_medium') || undefined,
      utm_campaign: urlParams.get('utm_campaign') || undefined,
      utm_term: urlParams.get('utm_term') || undefined,
      utm_content: urlParams.get('utm_content') || undefined,
    };
  }, []);

  // Crea o aggiorna sessione visitatore
  const createOrUpdateSession = useCallback(async () => {
    if (!isTrackingEnabled.current) return;
    
    try {
      const sessionId = getSessionId();
      const deviceInfo = getDeviceInfo();
      const utmParams = getUtmParameters();
      
      const sessionData = {
        session_id: sessionId,
        referrer: document.referrer || undefined,
        last_activity: new Date().toISOString(),
        ...deviceInfo,
        ...utmParams,
      };

      const { error } = await supabase
        .from('visitor_sessions')
        .upsert(sessionData);

      if (error) {
        console.error('Error saving visitor session:', error);
      }
    } catch (error) {
      console.error('Error in createOrUpdateSession:', error);
    }
  }, [getSessionId, getDeviceInfo, getUtmParameters]);

  // Traccia visualizzazione pagina
  const trackPageView = useCallback(async () => {
    if (!isTrackingEnabled.current) return;
    
    try {
      const sessionId = getSessionId();
      
      const pageViewData = {
        session_id: sessionId,
        page_url: location.pathname + location.search,
        page_title: document.title,
      };

      const { error } = await supabase
        .from('page_views')
        .insert(pageViewData);

      if (error) {
        console.error('Error saving page view:', error);
      }
    } catch (error) {
      console.error('Error in trackPageView:', error);
    }
  }, [location, getSessionId]);

  // Traccia interazione
  const trackInteraction = useCallback(async (interactionData: Omit<VisitorInteraction, 'session_id' | 'page_url'>) => {
    if (!isTrackingEnabled.current) return;
    
    try {
      const sessionId = getSessionId();
      
      const fullInteractionData: VisitorInteraction = {
        ...interactionData,
        session_id: sessionId,
        page_url: location.pathname + location.search,
      };

      const { error } = await supabase
        .from('visitor_interactions')
        .insert(fullInteractionData);

      if (error) {
        console.error('Error saving interaction:', error);
      }
    } catch (error) {
      console.error('Error in trackInteraction:', error);
    }
  }, [location, getSessionId]);

  // Traccia scroll depth
  const trackScrollDepth = useCallback(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    const scrollPercentage = Math.round((scrollTop + windowHeight) / documentHeight * 100);
    
    if (scrollPercentage > maxScrollDepth.current) {
      maxScrollDepth.current = Math.min(scrollPercentage, 100);
    }
  }, []);

  // Setup scroll tracking
  useEffect(() => {
    const handleScroll = () => trackScrollDepth();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [trackScrollDepth]);

  // Setup click tracking globale
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target) return;

      // Filtra click su elementi di admin area
      if (target.closest('[data-no-track]') || 
          window.location.pathname.includes('/area-riservata')) {
        return;
      }

      const elementData = {
        interaction_type: 'click',
        element_id: target.id || undefined,
        element_class: target.className || undefined,
        element_text: target.textContent?.slice(0, 100) || undefined,
        additional_data: {
          tag_name: target.tagName,
          href: target instanceof HTMLAnchorElement ? target.href : undefined,
        }
      };

      trackInteraction(elementData);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [trackInteraction]);

  // Traccia cambio pagina
  useEffect(() => {
    // Skip tracking per admin area
    if (location.pathname.includes('/area-riservata')) {
      isTrackingEnabled.current = false;
      return;
    }

    isTrackingEnabled.current = true;
    pageStartTime.current = Date.now();
    maxScrollDepth.current = 0;

    createOrUpdateSession();
    trackPageView();

    // Cleanup al unmount
    return () => {
      if (isTrackingEnabled.current) {
        const timeOnPage = Math.round((Date.now() - pageStartTime.current) / 1000);
        
        // Aggiorna la page view con tempo di permanenza e scroll depth
        const sessionId = getSessionId();
        supabase
          .from('page_views')
          .update({
            time_on_page: timeOnPage,
            scroll_depth: maxScrollDepth.current,
            exit_page: true,
          })
          .eq('session_id', sessionId)
          .eq('page_url', location.pathname + location.search)
          .order('timestamp', { ascending: false })
          .limit(1);
      }
    };
  }, [location, createOrUpdateSession, trackPageView, getSessionId]);

  return {
    trackInteraction,
    getSessionId,
    isTrackingEnabled: isTrackingEnabled.current,
  };
}
