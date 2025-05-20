
import React, { createContext, useContext, useState, useEffect } from "react";
import { FormValues } from "@/utils/quoteFormSchema";

export interface QuoteLog {
  id: string;
  timestamp: string; // ISO date string
  formValues: FormValues;
  step: number;
  completed: boolean;
}

export interface SiteVisit {
  id: string;
  timestamp: string; // ISO date string
  page: string;
}

interface ActivityLogContextType {
  quoteLogs: QuoteLog[];
  siteVisits: SiteVisit[];
  addQuoteLog: (quoteData: QuoteLog) => void;
  addSiteVisit: (page: string) => void;
  getVisitsCount: (period: 'day' | 'month' | 'year') => number;
  getQuoteLogsForDay: (date: Date) => QuoteLog[];
}

const ActivityLogContext = createContext<ActivityLogContextType | undefined>(undefined);

export const ActivityLogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quoteLogs, setQuoteLogs] = useState<QuoteLog[]>(() => {
    const savedLogs = localStorage.getItem("quoteLogs");
    if (savedLogs) {
      try {
        return JSON.parse(savedLogs);
      } catch (error) {
        console.error("Failed to parse saved quote logs:", error);
        return [];
      }
    }
    return [];
  });
  
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>(() => {
    const savedVisits = localStorage.getItem("siteVisits");
    if (savedVisits) {
      try {
        return JSON.parse(savedVisits);
      } catch (error) {
        console.error("Failed to parse saved site visits:", error);
        return [];
      }
    }
    return [];
  });
  
  // Save logs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("quoteLogs", JSON.stringify(quoteLogs));
  }, [quoteLogs]);
  
  useEffect(() => {
    localStorage.setItem("siteVisits", JSON.stringify(siteVisits));
  }, [siteVisits]);
  
  const addQuoteLog = (quoteData: QuoteLog) => {
    setQuoteLogs(prev => {
      // Check if an entry with this ID already exists
      const existingIndex = prev.findIndex(log => log.id === quoteData.id);
      
      if (existingIndex !== -1) {
        // Update existing entry
        const updatedLogs = [...prev];
        updatedLogs[existingIndex] = quoteData;
        return updatedLogs;
      } else {
        // Add new entry
        return [...prev, quoteData];
      }
    });
  };
  
  const addSiteVisit = (page: string) => {
    if (page.includes("/area-riservata")) {
      return; // Don't log admin area visits
    }
    
    setSiteVisits(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 11),
        timestamp: new Date().toISOString(),
        page
      }
    ]);
  };
  
  const getVisitsCount = (period: 'day' | 'month' | 'year'): number => {
    const now = new Date();
    
    return siteVisits.filter(visit => {
      const visitDate = new Date(visit.timestamp);
      
      if (period === 'day') {
        return visitDate.getDate() === now.getDate() &&
               visitDate.getMonth() === now.getMonth() &&
               visitDate.getFullYear() === now.getFullYear();
      }
      
      if (period === 'month') {
        return visitDate.getMonth() === now.getMonth() &&
               visitDate.getFullYear() === now.getFullYear();
      }
      
      if (period === 'year') {
        return visitDate.getFullYear() === now.getFullYear();
      }
      
      return false;
    }).length;
  };
  
  const getQuoteLogsForDay = (date: Date): QuoteLog[] => {
    return quoteLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate.getDate() === date.getDate() &&
             logDate.getMonth() === date.getMonth() &&
             logDate.getFullYear() === date.getFullYear();
    });
  };
  
  return (
    <ActivityLogContext.Provider value={{
      quoteLogs,
      siteVisits,
      addQuoteLog,
      addSiteVisit,
      getVisitsCount,
      getQuoteLogsForDay
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
