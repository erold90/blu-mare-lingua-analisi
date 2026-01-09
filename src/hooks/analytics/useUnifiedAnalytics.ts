// Simple unified analytics hook
export interface QuoteLog {
  id: string;
  step: number;
  completed: boolean;
  form_data: any;
  created_at: string;
}

export interface SiteVisit {
  id: string;
  page: string;
  created_at: string;
}

export const useUnifiedAnalytics = () => {
  const trackQuoteStart = () => {
  };

  const trackQuoteComplete = (data: any) => {
  };

  const trackQuoteStep = (step: number) => {
  };

  const addQuoteLog = (data: any) => {
    return Promise.resolve();
  };

  return {
    trackQuoteStart,
    trackQuoteComplete,
    trackQuoteStep,
    addQuoteLog,
  };
};