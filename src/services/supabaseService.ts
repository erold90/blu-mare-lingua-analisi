
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

// Types from Supabase
type Apartment = Database['public']['Tables']['apartments']['Row'];
type Reservation = Database['public']['Tables']['reservations']['Row'];
type CleaningTask = Database['public']['Tables']['cleaning_tasks']['Row'];
type Price = Database['public']['Tables']['prices']['Row'];

export const supabaseService = {
  // Apartments
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

    update: async (id: string, apartment: Partial<Apartment>) => {
      const { data, error } = await supabase
        .from('apartments')
        .update({ ...apartment, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  // Reservations
  reservations: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('start_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },

    create: async (reservation: Omit<Reservation, 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('reservations')
        .insert([reservation])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    update: async (id: string, reservation: Partial<Reservation>) => {
      const { data, error } = await supabase
        .from('reservations')
        .update({ ...reservation, updated_at: new Date().toISOString() })
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

  // Cleaning Tasks
  cleaningTasks: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('cleaning_tasks')
        .select('*')
        .order('task_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('cleaning_tasks')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },

    create: async (task: Omit<CleaningTask, 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('cleaning_tasks')
        .insert([task])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    update: async (id: string, task: Partial<CleaningTask>) => {
      const { data, error } = await supabase
        .from('cleaning_tasks')
        .update({ ...task, updated_at: new Date().toISOString() })
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

    saveBatch: async (tasks: Omit<CleaningTask, 'created_at' | 'updated_at'>[]) => {
      const { data, error } = await supabase
        .from('cleaning_tasks')
        .upsert(tasks)
        .select();
      
      if (error) throw error;
      return data;
    }
  },

  // Prices
  prices: {
    getByYear: async (year: number) => {
      const { data, error } = await supabase
        .from('prices')
        .select('*')
        .eq('year', year)
        .order('week_start');
      
      if (error) throw error;
      return data;
    },

    upsert: async (price: Omit<Price, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('prices')
        .upsert([{ ...price, updated_at: new Date().toISOString() }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    updateBatch: async (prices: Omit<Price, 'id' | 'created_at' | 'updated_at'>[]) => {
      const { data, error } = await supabase
        .from('prices')
        .upsert(prices.map(p => ({ ...p, updated_at: new Date().toISOString() })))
        .select();
      
      if (error) throw error;
      return data;
    }
  }
};
