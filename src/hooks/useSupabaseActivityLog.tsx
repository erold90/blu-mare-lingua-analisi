
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FormValues } from "@/utils/quoteFormSchema";
import { Json } from "@/integrations/supabase/types";

// Helper function to serialize dates in FormValues
const serializeFormValues = (formValues: FormValues): any => {
  const serialized: any = { ...formValues };
  
  // Convert Date objects to ISO strings for database storage
  if (serialized.checkIn instanceof Date) {
    serialized.checkIn = serialized.checkIn.toISOString();
  }
  
  if (serialized.checkOut instanceof Date) {
    serialized.checkOut = serialized.checkOut.toISOString();
  }
  
  return serialized;
};

// Helper function to deserialize dates from database
const deserializeFormValues = (dbFormValues: any): FormValues => {
  const deserialized: any = { ...dbFormValues };
  
  // Convert ISO strings back to Date objects
  if (typeof deserialized.checkIn === 'string') {
    deserialized.checkIn = new Date(deserialized.checkIn);
  }
  
  if (typeof deserialized.checkOut === 'string') {
    deserialized.checkOut = new Date(deserialized.checkOut);
  }
  
  return deserialized as FormValues;
};

export interface QuoteLog {
  id: string;
  timestamp: string;
  form_values: FormValues;
  step: number;
  completed: boolean;
}

export interface SiteVisit {
  id: string;
  timestamp: string;
  page: string;
}

// Interface for database data
interface DbQuoteLog {
  id: string;
  timestamp: string;
  form_values: any;
  step: number;
  completed: boolean;
}

export function useSupabaseActivityLog() {
  const [quoteLogs, setQuoteLogs] = useState<QuoteLog[]>([]);
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from Supabase on mount
  useEffect(() => {
    loadQuoteLogs();
    loadSiteVisits();
  }, []);

  const loadQuoteLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('quote_logs')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (error) {
        console.error('Error loading quote logs:', error);
        return;
      }
      
      // Convert database format to application format
      const formattedLogs: QuoteLog[] = (data || []).map(log => ({
        id: log.id,
        timestamp: log.timestamp,
        form_values: deserializeFormValues(log.form_values),
        step: log.step,
        completed: log.completed
      }));
      
      setQuoteLogs(formattedLogs);
    } catch (error) {
      console.error('Error loading quote logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSiteVisits = async () => {
    try {
      const { data, error } = await supabase
        .from('site_visits')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1000); // Limit to recent visits
      
      if (error) {
        console.error('Error loading site visits:', error);
        return;
      }
      
      setSiteVisits(data || []);
    } catch (error) {
      console.error('Error loading site visits:', error);
    }
  };

  const addQuoteLog = async (quoteData: Omit<QuoteLog, 'timestamp'> & { timestamp?: string }) => {
    try {
      // Prepare data for database
      const logData = {
        id: quoteData.id,
        timestamp: quoteData.timestamp || new Date().toISOString(),
        form_values: serializeFormValues(quoteData.form_values),
        step: quoteData.step,
        completed: quoteData.completed
      };

      const { error } = await supabase
        .from('quote_logs')
        .upsert(logData);
      
      if (error) {
        console.error('Error saving quote log:', error);
        return;
      }

      // Update local state with deserialized form values
      setQuoteLogs(prev => {
        const existingIndex = prev.findIndex(log => log.id === quoteData.id);
        const updatedQuoteData = {
          ...quoteData,
          timestamp: logData.timestamp,
          form_values: quoteData.form_values // Keep the original FormValues object
        };
        
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = updatedQuoteData;
          return updated;
        } else {
          return [updatedQuoteData, ...prev];
        }
      });
    } catch (error) {
      console.error('Error saving quote log:', error);
    }
  };

  const deleteQuoteLog = async (quoteId: string) => {
    try {
      const { error } = await supabase
        .from('quote_logs')
        .delete()
        .eq('id', quoteId);
      
      if (error) {
        console.error('Error deleting quote log:', error);
        return;
      }

      setQuoteLogs(prev => prev.filter(log => log.id !== quoteId));
    } catch (error) {
      console.error('Error deleting quote log:', error);
    }
  };

  const addSiteVisit = async (page: string) => {
    if (page.includes("/area-riservata")) {
      return; // Don't log admin area visits
    }

    try {
      const visitData = {
        id: Math.random().toString(36).substring(2, 11),
        page,
        timestamp: new Date().toISOString()
      };

      const { error } = await supabase
        .from('site_visits')
        .insert(visitData);
      
      if (error) {
        console.error('Error saving site visit:', error);
        return;
      }

      // Update local state
      setSiteVisits(prev => [visitData, ...prev.slice(0, 999)]); // Keep only 1000 most recent
    } catch (error) {
      console.error('Error saving site visit:', error);
    }
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

  return {
    quoteLogs,
    siteVisits,
    loading,
    addQuoteLog,
    deleteQuoteLog,
    addSiteVisit,
    getVisitsCount,
    refreshData: () => {
      loadQuoteLogs();
      loadSiteVisits();
    }
  };
}
