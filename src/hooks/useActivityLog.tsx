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
  clearOldData: () => void;
}

// Maximum number of site visits to store
const MAX_SITE_VISITS = 1000;

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
        // Only load up to MAX_SITE_VISITS most recent visits
        const parsedVisits = JSON.parse(savedVisits);
        return Array.isArray(parsedVisits) 
          ? parsedVisits.slice(-MAX_SITE_VISITS) 
          : [];
      } catch (error) {
        console.error("Failed to parse saved site visits:", error);
        return [];
      }
    }
    return [];
  });
  
  // Save logs to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem("quoteLogs", JSON.stringify(quoteLogs));
    } catch (error) {
      console.error("Failed to save quote logs to localStorage:", error);
      // If we can't save, try to reduce the data size
      if (quoteLogs.length > 50) {
        setQuoteLogs(prev => prev.slice(-50)); // Keep only the 50 most recent logs
      }
    }
  }, [quoteLogs]);
  
  useEffect(() => {
    try {
      // Only store up to MAX_SITE_VISITS most recent visits
      const visitsToStore = siteVisits.slice(-MAX_SITE_VISITS);
      localStorage.setItem("siteVisits", JSON.stringify(visitsToStore));
    } catch (error) {
      console.error("Failed to save site visits to localStorage:", error);
      // If we still can't save, reduce the limit by half
      setSiteVisits(prev => prev.slice(-(MAX_SITE_VISITS / 2)));
    }
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
        // Add new entry, but limit to 100 most recent if getting large
        const newLogs = [...prev, quoteData];
        return newLogs.length > 100 ? newLogs.slice(-100) : newLogs;
      }
    });
  };
  
  const addSiteVisit = (page: string) => {
    if (page.includes("/area-riservata")) {
      return; // Don't log admin area visits
    }
    
    setSiteVisits(prev => {
      // Only keep up to MAX_SITE_VISITS - 1 previous visits + the new one
      const limitedPrev = prev.length >= MAX_SITE_VISITS 
        ? prev.slice(-(MAX_SITE_VISITS - 1)) 
        : prev;
        
      return [
        ...limitedPrev,
        {
          id: Math.random().toString(36).substring(2, 11),
          timestamp: new Date().toISOString(),
          page
        }
      ];
    });
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
  
  // Function to clear old data
  const clearOldData = () => {
    // Keep only the last 30 days of site visits
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    setSiteVisits(prev => 
      prev.filter(visit => new Date(visit.timestamp) > thirtyDaysAgo)
    );
    
    // Keep only the last 50 quote logs
    if (quoteLogs.length > 50) {
      setQuoteLogs(prev => prev.slice(-50));
    }
  };
  
  return (
    <ActivityLogContext.Provider value={{
      quoteLogs,
      siteVisits,
      addQuoteLog,
      addSiteVisit,
      getVisitsCount,
      getQuoteLogsForDay,
      clearOldData
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
