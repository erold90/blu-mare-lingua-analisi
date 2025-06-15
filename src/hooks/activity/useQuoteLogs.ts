
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FormValues } from "@/utils/quoteFormSchema";

export interface QuoteLog {
  id: string;
  timestamp: string;
  form_values: FormValues;
  step: number;
  completed: boolean;
}

// Helper function to serialize dates in FormValues
const serializeFormValues = (formValues: FormValues): any => {
  const serialized: any = { ...formValues };
  
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
  
  if (typeof deserialized.checkIn === 'string') {
    deserialized.checkIn = new Date(deserialized.checkIn);
  }
  
  if (typeof deserialized.checkOut === 'string') {
    deserialized.checkOut = new Date(deserialized.checkOut);
  }
  
  return deserialized as FormValues;
};

export function useQuoteLogs() {
  const [quoteLogs, setQuoteLogs] = useState<QuoteLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadQuoteLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('quote_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100); // Limit for performance
      
      if (error) {
        console.error('Error loading quote logs:', error);
        return;
      }
      
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

  const addQuoteLog = async (quoteData: Omit<QuoteLog, 'timestamp'> & { timestamp?: string }) => {
    try {
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

      setQuoteLogs(prev => {
        const existingIndex = prev.findIndex(log => log.id === quoteData.id);
        const updatedQuoteData = {
          ...quoteData,
          timestamp: logData.timestamp,
          form_values: quoteData.form_values
        };
        
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = updatedQuoteData;
          return updated;
        } else {
          return [updatedQuoteData, ...prev.slice(0, 99)]; // Keep only 100 most recent
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

  useEffect(() => {
    loadQuoteLogs();
  }, []);

  return {
    quoteLogs,
    loading,
    addQuoteLog,
    deleteQuoteLog,
    refreshQuoteLogs: loadQuoteLogs
  };
}
