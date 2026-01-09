// Simple tracking hook
export const useSimpleTracking = () => {
  const addQuoteLog = (data: any) => {
    return Promise.resolve();
  };

  const trackSiteVisit = (page: string) => {
  };

  return {
    addQuoteLog,
    trackSiteVisit,
  };
};