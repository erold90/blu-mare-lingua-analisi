// Simple tracking hook
export const useSimpleTracking = () => {
  const addQuoteLog = (data: any) => {
    console.log('Quote log added:', data);
    return Promise.resolve();
  };

  const trackSiteVisit = (page: string) => {
    console.log('Site visit tracked:', page);
  };

  return {
    addQuoteLog,
    trackSiteVisit,
  };
};