
import React, { createContext, useContext } from "react";
import { FormValues } from "@/utils/quoteFormSchema";
import { useSupabaseActivityLog } from "./useSupabaseActivityLog";

export interface QuoteLog {
  id: string;
  timestamp: string;
  formValues: FormValues;
  step: number;
  completed: boolean;
}

export interface SiteVisit {
  id: string;
  timestamp: string;
  page: string;
}

interface ActivityLogContextType {
  quoteLogs: QuoteLog[];
  siteVisits: SiteVisit[];
  loading: boolean;
  addQuoteLog: (quoteData: QuoteLog) => void;
  deleteQuoteLog: (quoteId: string) => void;
  addSiteVisit: (page: string) => void;
  getVisitsCount: (period: 'day' | 'month' | 'year') => number;
  getQuoteLogsForDay: (date: Date) => QuoteLog[];
  clearOldData: () => void;
  refreshData: () => void;
}

const ActivityLogContext = createContext<ActivityLogContextType | undefined>(undefined);

export const ActivityLogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    quoteLogs: supabaseQuoteLogs,
    siteVisits: supabaseSiteVisits,
    loading,
    addQuoteLog: supabaseAddQuoteLog,
    deleteQuoteLog: supabaseDeleteQuoteLog,
    addSiteVisit: supabaseAddSiteVisit,
    getVisitsCount: supabaseGetVisitsCount,
    refreshData
  } = useSupabaseActivityLog();

  // Transform data to match the expected interface
  const quoteLogs = supabaseQuoteLogs.map(log => ({
    id: log.id,
    timestamp: log.timestamp,
    formValues: log.form_values,
    step: log.step,
    completed: log.completed
  }));

  const addQuoteLog = (quoteData: QuoteLog) => {
    const transformedData = {
      id: quoteData.id,
      timestamp: quoteData.timestamp,
      form_values: quoteData.formValues,
      step: quoteData.step,
      completed: quoteData.completed
    };
    supabaseAddQuoteLog(transformedData);
  };

  const getQuoteLogsForDay = (date: Date): QuoteLog[] => {
    return quoteLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate.getDate() === date.getDate() &&
             logDate.getMonth() === date.getMonth() &&
             logDate.getFullYear() === date.getFullYear();
    });
  };

  const clearOldData = () => {
    // This is now handled by the database, we could implement cleanup queries if needed
    console.log("Data cleanup is now handled by the database");
  };

  return (
    <ActivityLogContext.Provider value={{
      quoteLogs,
      siteVisits: supabaseSiteVisits,
      loading,
      addQuoteLog,
      deleteQuoteLog: supabaseDeleteQuoteLog,
      addSiteVisit: supabaseAddSiteVisit,
      getVisitsCount: supabaseGetVisitsCount,
      getQuoteLogsForDay,
      clearOldData,
      refreshData
    }}>
      {children}
    </ActivityLogContext.Provider>
  );
};

export const useActivityLog = () => {
  const context = useContext(ActivityLogContext);
  
  if (context === undefined) {
    throw new Error("useActivityLog must be used within an ActivityLogProvider");
  }
  
  return context;
};
