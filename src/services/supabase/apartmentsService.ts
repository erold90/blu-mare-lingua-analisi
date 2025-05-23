
import { supabase } from "@/integrations/supabase/client";

export const apartmentsService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('apartments')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('apartments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('apartments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
