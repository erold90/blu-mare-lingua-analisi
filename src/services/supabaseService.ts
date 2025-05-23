
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
      console.log(`Fetching prices for year: ${year}`);
      
      try {
        // Verify authentication status before attempting to fetch data
        const { data: authData } = await supabase.auth.getSession();
        console.log("Auth session status:", authData?.session ? "Active" : "No active session");
        
        const { data, error } = await supabase
          .from('prices')
          .select('*')
          .eq('year', year)
          .order('week_start');
        
        if (error) {
          console.error("Error fetching prices:", error);
          throw error;
        }
        
        console.log(`Fetched ${data?.length || 0} prices from database`);
        return data || [];
      } catch (fetchError) {
        console.error("Exception during price fetch:", fetchError);
        throw fetchError;
      }
    },

    upsert: async (priceData: any) => {
      try {
        console.log("Upserting price data:", priceData);
        
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
        
        console.log("Price updated successfully:", data);
        return data;
      } catch (upsertError) {
        console.error("Exception during price upsert:", upsertError);
        throw upsertError;
      }
    },

    updateBatch: async (pricesArray: any[]) => {
      console.log("Inserting batch of prices:", pricesArray.length);
      
      try {
        // Log the first item to help with debugging
        if (pricesArray.length > 0) {
          console.log("First price item sample:", pricesArray[0]);
        }
        
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
      } catch (batchError) {
        console.error("Exception during batch upsert:", batchError);
        // Use a fallback approach: store in localStorage even if database fails
        try {
          const seasonalData = [{
            year: pricesArray[0]?.year || 2025,
            prices: pricesArray.map(p => ({
              apartmentId: p.apartment_id,
              weekStart: p.week_start,
              price: p.price
            }))
          }];
          localStorage.setItem("seasonalPricing", JSON.stringify(seasonalData));
          console.log("Fallback: Saved prices to localStorage instead");
        } catch (localStorageError) {
          console.error("Even localStorage fallback failed:", localStorageError);
        }
        throw batchError;
      }
    },

    deleteByYear: async (year: number) => {
      try {
        const { error } = await supabase
          .from('prices')
          .delete()
          .eq('year', year);
        
        if (error) {
          console.error("Error deleting prices for year", year, error);
          throw error;
        }
        
        console.log(`Successfully deleted all prices for year ${year}`);
      } catch (deleteError) {
        console.error("Exception during delete operation:", deleteError);
        throw deleteError;
      }
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
    },

    saveBatch: async (tasks: any[]) => {
      const { data, error } = await supabase
        .from('cleaning_tasks')
        .upsert(tasks)
        .select();
      
      if (error) throw error;
      return data;
    }
  }
};
