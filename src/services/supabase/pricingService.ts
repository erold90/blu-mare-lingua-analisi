import { supabase } from "@/integrations/supabase/client";

export interface WeeklyPrice {
  id: string;
  apartment_id: string;
  year: number;
  week_start: string;
  week_end: string;
  week_number: number;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface DateBlock {
  id: string;
  apartment_id: string | null;
  start_date: string;
  end_date: string;
  block_reason: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SeasonConfig {
  id: string;
  year: number;
  season_start_month: number;
  season_start_day: number;
  season_end_month: number;
  season_end_day: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const pricingService = {
  // Weekly Prices
  getWeeklyPrices: async (year?: number, apartmentId?: string) => {
    let query = supabase
      .from('weekly_prices')
      .select('*')
      .order('year', { ascending: true })
      .order('week_number', { ascending: true });
    
    if (year) {
      query = query.eq('year', year);
    }
    
    if (apartmentId) {
      query = query.eq('apartment_id', apartmentId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  updateWeeklyPrice: async (id: string, updates: Partial<WeeklyPrice>) => {
    console.log('🔄 Service: Aggiornamento prezzo con ID:', id, 'Updates:', updates);
    
    const { data, error } = await supabase
      .from('weekly_prices')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    console.log('🔍 Service: Risultato query:', { data, error });
    
    if (error) {
      console.error('❌ Service: Errore database:', error);
      throw error;
    }
    
    console.log('✅ Service: Prezzo aggiornato con successo:', data);
    return data;
  },

  generateWeeklyPricesForYear: async (targetYear: number, copyFromYear?: number) => {
    console.log('🔄 Service: Chiamando RPC generate_weekly_prices_for_year con parametri:', {
      target_year: targetYear,
      copy_from_year: copyFromYear || null
    });
    
    const { data, error } = await supabase.rpc('generate_weekly_prices_for_year', {
      target_year: targetYear,
      copy_from_year: copyFromYear || null
    });
    
    console.log('🔍 Service: Risultato RPC:', { data, error });
    
    if (error) {
      console.error('❌ Service: Errore RPC:', error);
      throw new Error(`Database error: ${error.message} (${error.code})`);
    }
    
    return data;
  },

  // Date Blocks
  getDateBlocks: async () => {
    const { data, error } = await supabase
      .from('date_blocks')
      .select('*')
      .eq('is_active', true)
      .order('start_date', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  createDateBlock: async (block: Omit<DateBlock, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('date_blocks')
      .insert(block)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  updateDateBlock: async (id: string, updates: Partial<DateBlock>) => {
    const { data, error } = await supabase
      .from('date_blocks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  deleteeDateBlock: async (id: string) => {
    const { error } = await supabase
      .from('date_blocks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Season Configuration
  getSeasonConfigs: async () => {
    const { data, error } = await supabase
      .from('season_config')
      .select('*')
      .order('year', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  updateSeasonConfig: async (id: string, updates: Partial<SeasonConfig>) => {
    const { data, error } = await supabase
      .from('season_config')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  createSeasonConfig: async (config: Omit<SeasonConfig, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('season_config')
      .insert(config)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Utility functions
  getPriceForDateRange: async (apartmentId: string, startDate: Date, endDate: Date) => {
    const year = startDate.getFullYear();
    
    const { data, error } = await supabase
      .from('weekly_prices')
      .select('*')
      .eq('apartment_id', apartmentId)
      .eq('year', year)
      .gte('week_end', startDate.toISOString().split('T')[0])
      .lte('week_start', endDate.toISOString().split('T')[0]);
    
    if (error) throw error;
    return data;
  },

  isDateBlocked: async (apartmentId: string, checkDate: Date) => {
    const dateStr = checkDate.toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('date_blocks')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', dateStr)
      .gte('end_date', dateStr)
      .or(`apartment_id.is.null,apartment_id.eq.${apartmentId}`);
    
    if (error) throw error;
    return data && data.length > 0;
  },

  isDateInSeason: async (checkDate: Date) => {
    const year = checkDate.getFullYear();
    const month = checkDate.getMonth() + 1;
    const day = checkDate.getDate();
    
    const { data, error } = await supabase
      .from('season_config')
      .select('*')
      .eq('year', year)
      .eq('is_active', true)
      .single();
    
    if (error) return false; // If no season config, assume in season
    if (!data) return false;
    
    const seasonStart = new Date(year, data.season_start_month - 1, data.season_start_day);
    const seasonEnd = new Date(year, data.season_end_month - 1, data.season_end_day);
    
    return checkDate >= seasonStart && checkDate <= seasonEnd;
  }
};