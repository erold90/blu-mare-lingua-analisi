import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Reservation {
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
}

interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

const DEFAULT_PAGE_SIZE = 20;

export function useReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch reservations from Supabase with pagination
  const fetchReservations = useCallback(async (page = 1, pageSize = DEFAULT_PAGE_SIZE) => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);

      // Get total count first
      const { count, error: countError } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      // Calculate offset
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('start_date', { ascending: false })
        .range(from, to);

      if (error) throw error;

      // Transform data to match our interface
      const transformedData = (data || []).map(reservation => ({
        ...reservation,
        apartment_ids: Array.isArray(reservation.apartment_ids)
          ? reservation.apartment_ids
          : JSON.parse(reservation.apartment_ids as string || '[]')
      }));

      setReservations(transformedData);
      setPagination({
        page,
        pageSize,
        total: count || 0
      });
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Request was cancelled, ignore
      }
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  }, []);

  // Check apartment availability for given dates
  const getApartmentAvailability = useCallback((apartmentId: string, checkIn: Date, checkOut: Date): boolean => {
    const hasConflict = reservations.some(reservation => {
      const apartmentIds = Array.isArray(reservation.apartment_ids)
        ? reservation.apartment_ids
        : JSON.parse(reservation.apartment_ids || '[]');

      if (!apartmentIds.includes(apartmentId)) {
        return false;
      }

      const reservationStart = new Date(reservation.start_date);
      const reservationEnd = new Date(reservation.end_date);

      return (checkIn < reservationEnd && checkOut > reservationStart);
    });

    return !hasConflict;
  }, [reservations]);

  // Add a new reservation
  const addReservation = useCallback(async (reservation: any) => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .insert([reservation])
        .select()
        .single();

      if (error) throw error;

      // Refresh the list to maintain correct pagination
      await fetchReservations(pagination.page, pagination.pageSize);
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Errore sconosciuto' };
    }
  }, [fetchReservations, pagination.page, pagination.pageSize]);

  // Update a reservation
  const updateReservation = useCallback(async (id: string, updates: Partial<Reservation>) => {
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
      return { data: null, error: err instanceof Error ? err.message : 'Errore sconosciuto' };
    }
  }, []);

  // Delete a reservation
  const deleteReservation = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Refresh to maintain correct pagination
      await fetchReservations(pagination.page, pagination.pageSize);
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Errore sconosciuto' };
    }
  }, [fetchReservations, pagination.page, pagination.pageSize]);

  // Change page
  const goToPage = useCallback((page: number) => {
    fetchReservations(page, pagination.pageSize);
  }, [fetchReservations, pagination.pageSize]);

  // Change page size
  const setPageSize = useCallback((pageSize: number) => {
    fetchReservations(1, pageSize);
  }, [fetchReservations]);

  // Load reservations on mount
  useEffect(() => {
    fetchReservations();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchReservations]);

  return {
    reservations,
    loading,
    error,
    pagination,
    fetchReservations,
    getApartmentAvailability,
    addReservation,
    updateReservation,
    deleteReservation,
    goToPage,
    setPageSize,
    totalPages: Math.ceil(pagination.total / pagination.pageSize)
  };
}
