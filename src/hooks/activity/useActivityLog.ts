
import { useQuoteLogs } from "./useQuoteLogs";
import { useSiteVisits } from "./useSiteVisits";
import { useCallback } from "react";

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

  const refreshData = useCallback(async () => {
    try {
      // Refresh both data sources in parallel
      await Promise.all([
        refreshQuoteLogs(),
        refreshSiteVisits()
      ]);
    } catch (error) {
      console.error("Errore durante il refresh dei dati:", error);
      throw error; // Re-throw per permettere la gestione upstream
    }
  }, [refreshQuoteLogs, refreshSiteVisits]);

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
