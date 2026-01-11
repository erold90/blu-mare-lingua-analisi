/**
 * useSessionTracker - Hook per tracciamento sessioni e analytics
 *
 * Gestisce:
 * - Creazione/recupero session_id
 * - Tracking visite pagine
 * - Tracking eventi funnel preventivi
 * - Device detection
 * - UTM parameters
 */

import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

// Costanti
const SESSION_STORAGE_KEY = 'vmb_session_id';
const VISITOR_STORAGE_KEY = 'vmb_visitor_id';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minuti
const LAST_ACTIVITY_KEY = 'vmb_last_activity';

// Tipi per eventi funnel
export type FunnelEventType =
  | 'form_opened'
  | 'step_1_dates'
  | 'step_2_guests'
  | 'step_3_apartments'
  | 'step_4_services'
  | 'step_5_summary'
  | 'quote_created'
  | 'whatsapp_clicked';

interface DeviceInfo {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
}

interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

/**
 * Lista di bot/crawler noti da escludere dal tracking
 */
const BOT_PATTERNS = [
  // Search engines
  /googlebot/i,
  /bingbot/i,
  /yandexbot/i,
  /duckduckbot/i,
  /baiduspider/i,
  /sogou/i,

  // Social media crawlers
  /facebookexternalhit/i,
  /facebot/i,
  /twitterbot/i,
  /linkedinbot/i,
  /pinterest/i,
  /whatsapp/i,
  /telegrambot/i,

  // SEO & monitoring tools
  /semrushbot/i,
  /ahrefsbot/i,
  /mj12bot/i,
  /dotbot/i,
  /rogerbot/i,
  /screaming frog/i,
  /gtmetrix/i,
  /pingdom/i,
  /uptimerobot/i,

  // Generic bot patterns
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /headless/i,
  /phantom/i,
  /selenium/i,
  /puppeteer/i,
  /playwright/i,

  // Preview/fetchers
  /preview/i,
  /fetch/i,
  /curl/i,
  /wget/i,
  /python-requests/i,
  /axios/i,
  /node-fetch/i,
  /go-http-client/i,

  // Other known bots
  /applebot/i,
  /slurp/i,
  /ia_archiver/i,
  /archive\.org/i,
];

/**
 * Verifica se lo user agent è un bot
 */
function isBot(): boolean {
  const ua = navigator.userAgent;

  // Se user agent è vuoto o molto corto, probabilmente è un bot
  if (!ua || ua.length < 20) return true;

  // Controlla se matcha uno dei pattern bot
  return BOT_PATTERNS.some(pattern => pattern.test(ua));
}

/**
 * Parse user agent per estrarre info device
 */
function parseUserAgent(): DeviceInfo {
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
  } else if (/MSIE|Trident/.test(ua)) {
    browser = 'IE';
    browserVersion = ua.match(/(?:MSIE |rv:)(\d+)/)?.[1] || '';
  }

  // OS detection
  let os = 'Unknown';
  let osVersion = '';

  if (/Windows NT (\d+\.\d+)/.test(ua)) {
    os = 'Windows';
    const ntVersion = ua.match(/Windows NT (\d+\.\d+)/)?.[1];
    osVersion = ntVersion === '10.0' ? '10/11' : ntVersion || '';
  } else if (/Mac OS X (\d+[._]\d+)/.test(ua)) {
    os = 'macOS';
    osVersion = ua.match(/Mac OS X (\d+[._]\d+)/)?.[1]?.replace('_', '.') || '';
  } else if (/iPhone OS (\d+)/.test(ua) || /iPad.*OS (\d+)/.test(ua)) {
    os = 'iOS';
    osVersion = ua.match(/(?:iPhone|iPad).*OS (\d+)/)?.[1] || '';
  } else if (/Android (\d+)/.test(ua)) {
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
function getUTMParams(): UTMParams {
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

/**
 * Hook principale per session tracking
 */
export function useSessionTracker() {
  const location = useLocation();
  const sessionIdRef = useRef<string | null>(null);
  const visitorIdRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);

  /**
   * Inizializza o recupera session_id e visitor_id
   */
  const initSession = useCallback(async () => {
    // Skip bot tracking
    if (isBot()) {
      console.log('[Session] Bot detected, skipping tracking');
      return null;
    }

    // Visitor ID (persistente, non scade mai)
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

      // Conta sessioni precedenti per questo visitor
      const { count } = await supabase
        .from('analytics_sessions')
        .select('id', { count: 'exact', head: true })
        .eq('visitor_id', visitorId);

      const previousSessions = count || 0;

      // Device e UTM info
      const deviceInfo = parseUserAgent();
      const utmParams = getUTMParams();

      // Crea nuova sessione nel database
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
    }

    sessionIdRef.current = sessionId;
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());

    return sessionId;
  }, []);

  /**
   * Aggiorna attività sessione
   */
  const updateActivity = useCallback(async () => {
    const sessionId = sessionIdRef.current;
    if (!sessionId) return;

    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());

    await supabase
      .from('analytics_sessions')
      .update({
        last_activity: new Date().toISOString(),
        pages_viewed: supabase.rpc('increment_pages_viewed', { sid: sessionId }),
      })
      .eq('session_id', sessionId);
  }, []);

  /**
   * Traccia visita pagina
   */
  const trackPageView = useCallback(async (page: string) => {
    const sessionId = sessionIdRef.current;
    if (!sessionId) return;

    // Aggiorna counter pagine nella sessione
    await supabase
      .from('analytics_sessions')
      .update({ pages_viewed: supabase.sql`pages_viewed + 1` })
      .eq('session_id', sessionId);

    // Invia alla edge function esistente con session_id
    try {
      await supabase.functions.invoke('track-visit', {
        body: {
          page,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
          sessionId,
        },
      });
    } catch {
      // Silently fail - non bloccare l'utente
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

    // Inserisci evento nel funnel
    await supabase.from('quote_funnel_events').insert({
      session_id: sessionId,
      event_type: eventType,
      event_data: eventData || null,
      quote_id: quoteId || null,
    });

    // Aggiorna stato sessione basato sull'evento
    const updateData: Record<string, unknown> = {};

    if (eventType === 'form_opened') {
      updateData.opened_quote_form = true;
    }

    // Estrai numero step dall'evento
    const stepMatch = eventType.match(/step_(\d)/);
    if (stepMatch) {
      const stepNum = parseInt(stepMatch[1], 10);
      updateData.reached_step = stepNum;
    }

    if (eventType === 'quote_created') {
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
  }, []);

  /**
   * Ottieni session_id corrente
   */
  const getSessionId = useCallback(() => {
    return sessionIdRef.current;
  }, []);

  /**
   * Ottieni visitor_id corrente
   */
  const getVisitorId = useCallback(() => {
    return visitorIdRef.current;
  }, []);

  // Inizializzazione al mount
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    // Skip tracking per area admin
    if (location.pathname.startsWith('/area-riservata')) return;

    initSession().then(() => {
      trackPageView(location.pathname);
    });
  }, []);

  // Traccia cambio pagina
  useEffect(() => {
    if (!isInitializedRef.current) return;
    if (location.pathname.startsWith('/area-riservata')) return;

    trackPageView(location.pathname);
    updateActivity();
  }, [location.pathname, trackPageView, updateActivity]);

  // Traccia attività utente
  useEffect(() => {
    const handleActivity = () => {
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    };

    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('keydown', handleActivity);

    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, []);

  return {
    trackFunnelEvent,
    trackPageView,
    getSessionId,
    getVisitorId,
  };
}

// Export per uso globale
export type { DeviceInfo, UTMParams };
