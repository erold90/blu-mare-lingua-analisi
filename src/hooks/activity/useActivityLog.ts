
import { useQuoteLogs } from "./useQuoteLogs";
import { useSiteVisits } from "./useSiteVisits";

export function useActivityLog() {
  const { 
    quoteLogs, 
    loading: quoteLoading, 
    addQuoteLog, 
    deleteQuoteLog, 
    refreshQuoteLogs 
  } = useQuoteLogs();

  const { 
    siteVisits, 
    loading: visitsLoading, 
    addSiteVisit, 
    getVisitsCount, 
    refreshSiteVisits 
  } = useSiteVisits();

  const refreshData = () => {
    refreshQuoteLogs();
    refreshSiteVisits();
  };

  return {
    quoteLogs,
    siteVisits,
    loading: quoteLoading || visitsLoading,
    addQuoteLog,
    deleteQuoteLog,
    addSiteVisit,
    getVisitsCount,
    refreshData
  };
}
