
import { supabase } from "@/integrations/supabase/client";
import { ServiceResponse } from "./types";

export const pricesService = {
  getByYear: async (year: number) => {
    
    try {
      // Verify authentication status before attempting to fetch data
      const { data: authData } = await supabase.auth.getSession();
      
      const { data, error } = await supabase
        .from('prices')
        .select('*')
        .eq('year', year)
        .order('week_start');
      
      if (error) {
        return []; // Return empty array instead of throwing error
      }
      
      return data || [];
    } catch (fetchError) {
      return []; // Return empty array instead of throwing error
    }
  },

  upsert: async (priceData: any) => {
    try {
      
      const { data, error } = await supabase
        .from('prices')
        .upsert(priceData, {
          onConflict: 'apartment_id,week_start,year'
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (upsertError) {
      throw upsertError;
    }
  },

  updateBatch: async (pricesArray: any[]) => {
    
    try {
      // Log the first item to help with debugging
      if (pricesArray.length > 0) {
      }
      
      const { data, error } = await supabase
        .from('prices')
        .upsert(pricesArray, {
          onConflict: 'apartment_id,week_start,year'
        })
        .select();
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (batchError) {
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
        return [];
      } catch (localStorageError) {
      }
      return [];
    }
  },

  deleteByYear: async (year: number) => {
    try {
      const { error } = await supabase
        .from('prices')
        .delete()
        .eq('year', year);
      
      if (error) {
        throw error;
      }
      
    } catch (deleteError) {
      throw deleteError;
    }
  }
};
