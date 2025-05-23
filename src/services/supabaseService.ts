
import { supabase } from "@/integrations/supabase/client";

export const supabaseService = {
  apartments: {
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
  },

  prices: {
    getByYear: async (year: number) => {
      const { data, error } = await supabase
        .from('prices')
        .select('*')
        .eq('year', year)
        .order('week_start');
      
      if (error) throw error;
      return data || [];
    },

    upsert: async (priceData: any) => {
      const { data, error } = await supabase
        .from('prices')
        .upsert(priceData, {
          onConflict: 'apartment_id,week_start,year'
        })
        .select();
      
      if (error) {
        console.error("Supabase upsert error:", error);
        throw error;
      }
      return data;
    },

    updateBatch: async (pricesArray: any[]) => {
      console.log("Inserting batch of prices:", pricesArray.length);
      
      const { data, error } = await supabase
        .from('prices')
        .upsert(pricesArray, {
          onConflict: 'apartment_id,week_start,year'
        })
        .select();
      
      if (error) {
        console.error("Batch upsert error:", error);
        throw error;
      }
      
      console.log("Successfully inserted/updated prices:", data?.length);
      return data;
    },

    deleteByYear: async (year: number) => {
      const { error } = await supabase
        .from('prices')
        .delete()
        .eq('year', year);
      
      if (error) throw error;
    }
  },

  reservations: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('start_date', { ascending: false });
      
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
  },

  cleaningTasks: {
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
    }
  }
};
