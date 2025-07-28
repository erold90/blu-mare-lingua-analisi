import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Reservation {
  id: string;
  guest_name: string;
  start_date: string;
  end_date: string;
  apartment_ids: string[] | any; // Allow Json type from Supabase
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
}

export function useReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch reservations from Supabase
  const fetchReservations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });

      // Transform data to match our interface
      const transformedData = (data || []).map(reservation => ({
        ...reservation,
        apartment_ids: Array.isArray(reservation.apartment_ids) 
          ? reservation.apartment_ids 
          : JSON.parse(reservation.apartment_ids as string || '[]')
      }));

      setReservations(transformedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Check apartment availability for given dates
  const getApartmentAvailability = (apartmentId: string, checkIn: Date, checkOut: Date): boolean => {
    // Check if any reservation conflicts with the given dates
    const hasConflict = reservations.some(reservation => {
      // Check if this apartment is booked in this reservation
      const apartmentIds = Array.isArray(reservation.apartment_ids) 
        ? reservation.apartment_ids 
        : JSON.parse(reservation.apartment_ids || '[]');
      
      if (!apartmentIds.includes(apartmentId)) {
        return false; // This reservation doesn't involve our apartment
      }

      const reservationStart = new Date(reservation.start_date);
      const reservationEnd = new Date(reservation.end_date);

      // Check for date overlap
      return (
        (checkIn < reservationEnd && checkOut > reservationStart)
      );
    });

    return !hasConflict; // Available if no conflicts
  };

  // Add a new reservation
  const addReservation = async (reservation: any) => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .insert([reservation])
        .select()
        .single();

      if (error) throw error;

      setReservations(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err) {
      console.error('Error adding reservation:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  // Update a reservation
  const updateReservation = async (id: string, updates: Partial<Reservation>) => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setReservations(prev => 
        prev.map(reservation => 
          reservation.id === id ? { ...reservation, ...data } : reservation
        )
      );
      
      return { data, error: null };
    } catch (err) {
      console.error('Error updating reservation:', err);
      return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  // Delete a reservation
  const deleteReservation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setReservations(prev => prev.filter(reservation => reservation.id !== id));
      return { error: null };
    } catch (err) {
      console.error('Error deleting reservation:', err);
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  // Load reservations on mount
  useEffect(() => {
    fetchReservations();
  }, []);

  return {
    reservations,
    loading,
    error,
    fetchReservations,
    getApartmentAvailability,
    addReservation,
    updateReservation,
    deleteReservation,
  };
}