
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

export function useTracking() {
  const location = useLocation();
  const sessionRef = useRef<string | null>(null);
  const pageStartTime = useRef<number>(Date.now());
  const maxScrollDepth = useRef<number>(0);
  const isTrackingEnabled = useRef<boolean>(true);

  // Generate or get session ID
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

  // Get device info
  const getDeviceInfo = useCallback((): Partial<VisitorSession> => {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)/i.test(userAgent);
    const device_type = isMobile ? (isTablet ? 'tablet' : 'mobile') : 'desktop';
    
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    else if (userAgent.includes('Opera')) browser = 'Opera';
    
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

  // Track interaction
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

  // Track page visit
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

  // Initialize session
  const initializeSession = useCallback(async () => {
    if (!isTrackingEnabled.current) return;
    
    try {
      const sessionId = getSessionId();
      const deviceInfo = getDeviceInfo();
      
      const sessionData = {
        session_id: sessionId,
        referrer: document.referrer || undefined,
        last_activity: new Date().toISOString(),
        ...deviceInfo,
      };

      const { error } = await supabase
        .from('visitor_sessions')
        .upsert(sessionData);

      if (error) {
        console.error('Error saving visitor session:', error);
      }
    } catch (error) {
      console.error('Error in initializeSession:', error);
    }
  }, [getSessionId, getDeviceInfo]);

  // Track page changes
  useEffect(() => {
    // Skip tracking for admin area
    if (location.pathname.includes('/area-riservata')) {
      isTrackingEnabled.current = false;
      return;
    }

    isTrackingEnabled.current = true;
    pageStartTime.current = Date.now();
    maxScrollDepth.current = 0;

    initializeSession();
    trackPageView();
  }, [location, initializeSession, trackPageView]);

  return {
    trackInteraction,
    getSessionId,
    isTrackingEnabled: isTrackingEnabled.current,
  };
}
