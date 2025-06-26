
import { useAnalytics } from './useAnalytics';

// Simple wrapper that maps the old interface to the new one
export function useUnifiedAnalytics() {
  const analytics = useAnalytics();
  
  return {
    // Map the old method names to new ones
    addQuoteLog: analytics.saveQuoteLog,
    deleteQuoteLog: analytics.deleteQuoteLog,
    trackSiteVisit: analytics.trackSiteVisit,
    // Provide any other methods that were expected
    ...analytics
  };
}

// Re-export types for compatibility
export type { QuoteLog, SiteVisit } from './useAnalytics';
