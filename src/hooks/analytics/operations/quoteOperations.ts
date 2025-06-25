
import { supabase } from '@/integrations/supabase/client';
import { QuoteLog } from '../useUnifiedAnalytics';
import { serializeFormValues, deserializeFormValues } from '../utils/serialization';

export const saveQuoteLog = async (quoteData: Omit<QuoteLog, 'timestamp'> & { timestamp?: string }) => {
  console.log('🔍 Saving quote log:', quoteData.id);
  
  const logData = {
    id: quoteData.id,
    timestamp: quoteData.timestamp || new Date().toISOString(),
    form_values: serializeFormValues(quoteData.form_values),
    step: quoteData.step,
    completed: quoteData.completed
  };

  const { error } = await supabase
    .from('quote_logs')
    .upsert(logData, { onConflict: 'id' });
  
  if (error) {
    console.error('❌ Error saving quote log:', error);
    throw error;
  }

  console.log('✅ Quote log saved successfully');
  return {
    ...quoteData,
    timestamp: logData.timestamp,
    form_values: quoteData.form_values
  };
};

export const removeQuoteLog = async (quoteId: string) => {
  console.log('🔍 Deleting quote log:', quoteId);
  
  const { error } = await supabase
    .from('quote_logs')
    .delete()
    .eq('id', quoteId);
  
  if (error) {
    console.error('❌ Error deleting quote log:', error);
    throw error;
  }

  console.log('✅ Quote log deleted successfully');
};

export const loadQuoteLogs = async () => {
  const { data, error } = await supabase
    .from('quote_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(100);

  if (error) {
    console.error('❌ Error loading quote logs:', error);
    throw new Error(`Quote logs error: ${error.message}`);
  }

  return (data || []).map(log => ({
    id: log.id,
    timestamp: log.timestamp,
    form_values: deserializeFormValues(log.form_values),
    step: log.step,
    completed: log.completed
  }));
};
