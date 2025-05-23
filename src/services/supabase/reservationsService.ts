import { supabase } from "@/integrations/supabase/client";

export const reservationsService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('start_date', { ascending: false }); // Order by arrival date, most recent first
    
    if (error) throw error;
    return data;
  },

  create: async (reservation: any) => {
    const { data, error } = await supabase
      .from('reservations')
      .insert(reservation)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('reservations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
