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
    console.log('Quote started');
  };

  const trackQuoteComplete = (data: any) => {
    console.log('Quote completed:', data);
  };

  const trackQuoteStep = (step: number) => {
    console.log('Quote step:', step);
  };

  const addQuoteLog = (data: any) => {
    console.log('Quote log added:', data);
    return Promise.resolve();
  };

  return {
    trackQuoteStart,
    trackQuoteComplete,
    trackQuoteStep,
    addQuoteLog,
  };
};