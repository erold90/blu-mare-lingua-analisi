
import { supabase } from "@/integrations/supabase/client";

export const cleaningService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('cleaning_tasks')
      .select('*')
      .order('task_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  create: async (task: any) => {
    const { data, error } = await supabase
      .from('cleaning_tasks')
      .insert(task)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: any) => {
    const { data, error } = await supabase
      .from('cleaning_tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('cleaning_tasks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  saveBatch: async (tasks: any[]) => {
    const { data, error } = await supabase
      .from('cleaning_tasks')
      .upsert(tasks)
      .select();
    
    if (error) throw error;
    return data;
  }
};
