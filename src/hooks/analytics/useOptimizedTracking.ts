import { useEffect } from 'react';

// Simple analytics hook without complex dependencies
export const useOptimizedTracking = () => {
  const trackPageView = (page: string) => {
    // Simple page view tracking
    console.log('Page view:', page);
  };

  const trackEvent = (event: string, data?: any) => {
    // Simple event tracking
    console.log('Event:', event, data);
  };

  useEffect(() => {
    // Track initial page load
    trackPageView(window.location.pathname);
  }, []);

  return {
    trackPageView,
    trackEvent,
  };
};