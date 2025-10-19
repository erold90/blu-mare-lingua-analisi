import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ArchivedReservation {
  id: string;
  guest_name: string;
  guest_phone?: string;
  start_date: string;
  end_date: string;
  apartment_ids: string[] | any;
  adults: number;
  children: number;
  cribs: number;
  has_pets: boolean;
  linen_option: string;
  final_price?: number;
  deposit_amount?: number;
  payment_status?: string;
  payment_method?: string;
  notes?: string;
  device_id?: string;
  created_at: string;
  updated_at: string;
  archived_at: string;
  archived_year: number;
}

export function useArchivedReservations(year?: number) {
  const [archivedReservations, setArchivedReservations] = useState<ArchivedReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArchivedReservations = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('archived_reservations')
        .select('*')
        .order('start_date', { ascending: false });

      if (year) {
        query = query.eq('archived_year', year);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transformedData = (data || []).map(reservation => ({
        ...reservation,
        apartment_ids: Array.isArray(reservation.apartment_ids) 
          ? reservation.apartment_ids 
          : JSON.parse(reservation.apartment_ids as string || '[]')
      }));

      setArchivedReservations(transformedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching archived reservations:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Get all reservations (active + archived) for revenue calculations
  const getAllReservationsForRevenue = async (filterYear?: number) => {
    try {
      // Fetch active reservations
      let activeQuery = supabase
        .from('reservations')
        .select('*');
      
      if (filterYear) {
        const startDate = `${filterYear}-01-01`;
        const endDate = `${filterYear}-12-31`;
        activeQuery = activeQuery
          .gte('start_date', startDate)
          .lte('start_date', endDate);
      }

      const { data: activeData, error: activeError } = await activeQuery;
      if (activeError) throw activeError;

      // Fetch archived reservations
      let archivedQuery = supabase
        .from('archived_reservations')
        .select('*');
      
      if (filterYear) {
        archivedQuery = archivedQuery.eq('archived_year', filterYear);
      }

      const { data: archivedData, error: archivedError } = await archivedQuery;
      if (archivedError) throw archivedError;

      // Combine both datasets
      const allReservations = [...(activeData || []), ...(archivedData || [])];

      return allReservations.map(reservation => ({
        ...reservation,
        apartment_ids: Array.isArray(reservation.apartment_ids) 
          ? reservation.apartment_ids 
          : JSON.parse(reservation.apartment_ids as string || '[]')
      }));
    } catch (err) {
      console.error('Error fetching all reservations:', err);
      return [];
    }
  };

  useEffect(() => {
    fetchArchivedReservations();
  }, [year]);

  return {
    archivedReservations,
    loading,
    error,
    fetchArchivedReservations,
    getAllReservationsForRevenue,
  };
}
