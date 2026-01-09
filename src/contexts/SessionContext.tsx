/**
 * SessionContext - Context per session tracking globale
 *
 * Fornisce accesso al session tracker in tutta l'app
 */

import React, { createContext, useContext, useEffect, useRef, useCallback, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Costanti
const SESSION_STORAGE_KEY = 'vmb_session_id';
const VISITOR_STORAGE_KEY = 'vmb_visitor_id';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minuti
const LAST_ACTIVITY_KEY = 'vmb_last_activity';

// Tipi per eventi funnel
export type FunnelEventType =
  | 'form_start'
  | 'form_opened'
  | 'step_guests'
  | 'step_dates'
  | 'step_apartments'
  | 'step_extras'
  | 'step_summary'
  | 'step_contact'
  | 'step_back'
  | 'form_complete'
  | 'quote_created'
  | 'whatsapp_clicked';

interface SessionContextType {
  trackFunnelEvent: (eventType: FunnelEventType, eventData?: Record<string, unknown>, quoteId?: number) => Promise<void>;
  getSessionId: () => string | null;
  getVisitorId: () => string | null;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

/**
 * Parse user agent per estrarre info device
 */
function parseUserAgent() {
  const ua = navigator.userAgent;

  // Device type
  let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua)) {
    deviceType = 'tablet';
  } else if (/Mobile|iPhone|iPod|Android.*Mobile|webOS|BlackBerry|Opera Mini|IEMobile/i.test(ua)) {
    deviceType = 'mobile';
  }

  // Browser detection
  let browser = 'Unknown';
  let browserVersion = '';

  if (/Chrome\/(\d+)/.test(ua) && !/Edg/.test(ua)) {
    browser = 'Chrome';
    browserVersion = ua.match(/Chrome\/(\d+)/)?.[1] || '';
  } else if (/Safari\/(\d+)/.test(ua) && !/Chrome/.test(ua)) {
    browser = 'Safari';
    browserVersion = ua.match(/Version\/(\d+)/)?.[1] || '';
  } else if (/Firefox\/(\d+)/.test(ua)) {
    browser = 'Firefox';
    browserVersion = ua.match(/Firefox\/(\d+)/)?.[1] || '';
  } else if (/Edg\/(\d+)/.test(ua)) {
    browser = 'Edge';
    browserVersion = ua.match(/Edg\/(\d+)/)?.[1] || '';
  }

  // OS detection
  let os = 'Unknown';
  let osVersion = '';

  if (/Windows NT/.test(ua)) {
    os = 'Windows';
    osVersion = ua.match(/Windows NT (\d+\.\d+)/)?.[1] || '';
  } else if (/Mac OS X/.test(ua)) {
    os = 'macOS';
    osVersion = ua.match(/Mac OS X (\d+[._]\d+)/)?.[1]?.replace('_', '.') || '';
  } else if (/iPhone|iPad/.test(ua)) {
    os = 'iOS';
    osVersion = ua.match(/OS (\d+)/)?.[1] || '';
  } else if (/Android/.test(ua)) {
    os = 'Android';
    osVersion = ua.match(/Android (\d+)/)?.[1] || '';
  } else if (/Linux/.test(ua)) {
    os = 'Linux';
  }

  return { deviceType, browser, browserVersion, os, osVersion };
}

/**
 * Estrae UTM params dalla URL
 */
function getUTMParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    utm_term: params.get('utm_term') || undefined,
    utm_content: params.get('utm_content') || undefined,
  };
}

/**
 * Genera UUID v4
 */
function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Verifica se la sessione è scaduta
 */
function isSessionExpired(): boolean {
  const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
  if (!lastActivity) return true;
  const elapsed = Date.now() - parseInt(lastActivity, 10);
  return elapsed > SESSION_TIMEOUT_MS;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const sessionIdRef = useRef<string | null>(null);
  const visitorIdRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);

  /**
   * Inizializza o recupera session_id e visitor_id
   */
  const initSession = useCallback(async () => {
    // Skip per area admin
    if (location.pathname.startsWith('/area-riservata')) return;

    // Visitor ID (persistente)
    let visitorId = localStorage.getItem(VISITOR_STORAGE_KEY);
    if (!visitorId) {
      visitorId = generateUUID();
      localStorage.setItem(VISITOR_STORAGE_KEY, visitorId);
    }
    visitorIdRef.current = visitorId;

    // Session ID (scade dopo inattività)
    let sessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
    const needsNewSession = !sessionId || isSessionExpired();

    if (needsNewSession) {
      sessionId = generateUUID();
      sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);

      try {
        // Conta sessioni precedenti
        const { count } = await supabase
          .from('analytics_sessions')
          .select('id', { count: 'exact', head: true })
          .eq('visitor_id', visitorId);

        const previousSessions = count || 0;

        // Device e UTM info
        const deviceInfo = parseUserAgent();
        const utmParams = getUTMParams();

        // Crea nuova sessione
        await supabase.from('analytics_sessions').insert({
          session_id: sessionId,
          visitor_id: visitorId,
          device_type: deviceInfo.deviceType,
          browser: deviceInfo.browser,
          browser_version: deviceInfo.browserVersion,
          os: deviceInfo.os,
          os_version: deviceInfo.osVersion,
          referrer: document.referrer || null,
          landing_page: window.location.pathname,
          is_returning: previousSessions > 0,
          previous_sessions: previousSessions,
          ...utmParams,
        });
      } catch {
        // Silently fail - tabella potrebbe non esistere ancora
      }
    }

    sessionIdRef.current = sessionId;
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  }, [location.pathname]);

  /**
   * Traccia visita pagina
   */
  const trackPageView = useCallback(async (page: string) => {
    const sessionId = sessionIdRef.current;
    if (!sessionId) return;

    try {
      // Aggiorna counter pagine
      await supabase
        .from('analytics_sessions')
        .update({ pages_viewed: supabase.sql`pages_viewed + 1` })
        .eq('session_id', sessionId);

      // Invia alla edge function con session_id
      await supabase.functions.invoke('track-visit', {
        body: {
          page,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
          sessionId,
        },
      });
    } catch {
      // Silently fail
    }
  }, []);

  /**
   * Traccia evento funnel preventivo
   */
  const trackFunnelEvent = useCallback(async (
    eventType: FunnelEventType,
    eventData?: Record<string, unknown>,
    quoteId?: number
  ) => {
    const sessionId = sessionIdRef.current;
    if (!sessionId) return;

    try {
      // Inserisci evento
      await supabase.from('quote_funnel_events').insert({
        session_id: sessionId,
        event_type: eventType,
        event_data: eventData || null,
        quote_id: quoteId || null,
      });

      // Aggiorna stato sessione
      const updateData: Record<string, unknown> = {};

      if (eventType === 'form_opened' || eventType === 'form_start') {
        updateData.opened_quote_form = true;
      }

      // Map step names to numbers
      const stepNumberMap: Record<string, number> = {
        'step_guests': 1,
        'step_dates': 2,
        'step_apartments': 3,
        'step_extras': 4,
        'step_summary': 5,
        'step_contact': 6,
      };

      const stepNumber = stepNumberMap[eventType];
      if (stepNumber) {
        updateData.reached_step = stepNumber;
      }

      if (eventType === 'quote_created' || eventType === 'form_complete') {
        updateData.completed_quote = true;
      }

      if (eventType === 'whatsapp_clicked') {
        updateData.sent_whatsapp = true;
      }

      if (Object.keys(updateData).length > 0) {
        await supabase
          .from('analytics_sessions')
          .update(updateData)
          .eq('session_id', sessionId);
      }
    } catch {
      // Silently fail
    }
  }, []);

  const getSessionId = useCallback(() => sessionIdRef.current, []);
  const getVisitorId = useCallback(() => visitorIdRef.current, []);

  // Inizializzazione
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;
    initSession();
  }, [initSession]);

  // Traccia cambio pagina
  useEffect(() => {
    if (!sessionIdRef.current) return;
    if (location.pathname.startsWith('/area-riservata')) return;
    trackPageView(location.pathname);
  }, [location.pathname, trackPageView]);

  // Traccia attività utente
  useEffect(() => {
    const handleActivity = () => {
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    };

    window.addEventListener('click', handleActivity, { passive: true });
    window.addEventListener('scroll', handleActivity, { passive: true });

    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, []);

  return (
    <SessionContext.Provider value={{ trackFunnelEvent, getSessionId, getVisitorId }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}
