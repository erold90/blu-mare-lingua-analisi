import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Type definitions - matching the existing codebase interface
export interface Reservation {
  id: string;
  guestName: string; // mapped from guest_name
  adults: number;
  children: number;
  cribs: number;
  hasPets: boolean; // mapped from has_pets
  apartmentIds: string[]; // mapped from apartment_ids
  startDate: string; // mapped from start_date
  endDate: string; // mapped from end_date
  finalPrice: number; // mapped from final_price
  paymentMethod: "cash" | "bankTransfer" | "creditCard"; // mapped from payment_method
  paymentStatus: "notPaid" | "deposit" | "paid"; // mapped from payment_status
  depositAmount?: number; // mapped from deposit_amount
  notes?: string;
  hasLinen?: boolean; // mapped from linen_option
  deviceId?: string; // mapped from device_id
  lastUpdated?: number; // calculated from updated_at
  syncId?: string;
}

export interface Apartment {
  id: string;
  name: string;
  capacity: number;
  beds: number;
  bedrooms: number;
  description?: string;
  price?: number;
}

interface ReservationsContextType {
  reservations: Reservation[];
  apartments: Apartment[];
  loading: boolean;
  isLoading: boolean; // alias for compatibility
  addReservation: (reservation: Omit<Reservation, "id" | "lastUpdated" | "syncId" | "deviceId">) => Promise<void>;
  updateReservation: (reservation: Reservation) => Promise<void>;
  deleteReservation: (id: string) => Promise<void>;
  refreshData: () => Promise<void>; // alias for compatibility
  refreshReservations: () => Promise<void>;
  getApartmentAvailability: (apartmentId: string, startDate: Date, endDate: Date) => boolean;
}

const ReservationsContext = createContext<ReservationsContextType | undefined>(undefined);

export const ReservationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReservations = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) throw error;
      
      // Transform database data to match interface
      const transformedReservations: Reservation[] = (data || []).map(res => ({
        id: res.id,
        guestName: res.guest_name,
        adults: res.adults,
        children: res.children || 0,
        cribs: res.cribs || 0,
        hasPets: res.has_pets || false,
        apartmentIds: Array.isArray(res.apartment_ids) ? res.apartment_ids.map(String) : [],
        startDate: res.start_date,
        endDate: res.end_date,
        finalPrice: res.final_price ? Number(res.final_price) : 0,
        paymentMethod: res.payment_method as "cash" | "bankTransfer" | "creditCard",
        paymentStatus: res.payment_status as "notPaid" | "deposit" | "paid",
        depositAmount: res.deposit_amount ? Number(res.deposit_amount) : undefined,
        notes: res.notes || undefined,
        hasLinen: res.linen_option === 'yes',
        deviceId: res.device_id || undefined,
        lastUpdated: res.updated_at ? new Date(res.updated_at).getTime() : Date.now(),
      }));
      
      setReservations(transformedReservations);
    } catch (error) {
      console.error('Error loading reservations:', error);
      toast.error('Errore nel caricamento delle prenotazioni');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadApartments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('apartments')
        .select('*')
        .order('name');

      if (error) throw error;
      setApartments(data || []);
    } catch (error) {
      console.error('Error loading apartments:', error);
      toast.error('Errore nel caricamento degli appartamenti');
    }
  }, []);

  useEffect(() => {
    loadReservations();
    loadApartments();
  }, [loadReservations, loadApartments]);

  const addReservation = useCallback(async (reservationData: Omit<Reservation, "id" | "lastUpdated" | "syncId" | "deviceId">) => {
    try {
      // Transform interface data to database format
      const dbReservation = {
        guest_name: reservationData.guestName,
        adults: reservationData.adults,
        children: reservationData.children,
        cribs: reservationData.cribs,
        has_pets: reservationData.hasPets,
        apartment_ids: reservationData.apartmentIds as any,
        start_date: reservationData.startDate,
        end_date: reservationData.endDate,
        final_price: reservationData.finalPrice,
        payment_method: reservationData.paymentMethod,
        payment_status: reservationData.paymentStatus,
        deposit_amount: reservationData.depositAmount,
        notes: reservationData.notes,
        linen_option: reservationData.hasLinen ? 'yes' : 'no',
      };

      const { error } = await supabase
        .from('reservations')
        .insert(dbReservation as any);

      if (error) throw error;
      
      await loadReservations();
      toast.success('Prenotazione aggiunta con successo');
    } catch (error) {
      console.error('Error adding reservation:', error);
      toast.error('Errore nell\'aggiungere la prenotazione');
      throw error;
    }
  }, [loadReservations]);

  const updateReservation = useCallback(async (reservation: Reservation) => {
    try {
      // Transform interface data to database format
      const dbUpdates = {
        guest_name: reservation.guestName,
        adults: reservation.adults,
        children: reservation.children,
        cribs: reservation.cribs,
        has_pets: reservation.hasPets,
        apartment_ids: reservation.apartmentIds as any,
        start_date: reservation.startDate,
        end_date: reservation.endDate,
        final_price: reservation.finalPrice,
        payment_method: reservation.paymentMethod,
        payment_status: reservation.paymentStatus,
        deposit_amount: reservation.depositAmount,
        notes: reservation.notes,
        linen_option: reservation.hasLinen ? 'yes' : 'no',
      };

      const { error } = await supabase
        .from('reservations')
        .update(dbUpdates)
        .eq('id', reservation.id);

      if (error) throw error;
      
      await loadReservations();
      toast.success('Prenotazione aggiornata con successo');
    } catch (error) {
      console.error('Error updating reservation:', error);
      toast.error('Errore nell\'aggiornare la prenotazione');
      throw error;
    }
  }, [loadReservations]);

  const deleteReservation = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await loadReservations();
      toast.success('Prenotazione eliminata con successo');
    } catch (error) {
      console.error('Error deleting reservation:', error);
      toast.error('Errore nell\'eliminare la prenotazione');
      throw error;
    }
  }, [loadReservations]);

  const refreshData = useCallback(async () => {
    await loadReservations();
  }, [loadReservations]);

  const refreshReservations = useCallback(async () => {
    await loadReservations();
  }, [loadReservations]);

  // Check if an apartment is available for the given date range
  const getApartmentAvailability = useCallback((apartmentId: string, startDate: Date, endDate: Date): boolean => {
    const requestStart = new Date(startDate).getTime();
    const requestEnd = new Date(endDate).getTime();
    
    const hasConflict = reservations.some(reservation => {
      if (!reservation.apartmentIds.includes(apartmentId)) {
        return false;
      }
      
      const reservationStart = new Date(reservation.startDate).getTime();
      const reservationEnd = new Date(reservation.endDate).getTime();
      
      // Check for overlap (excluding transition days)
      const hasOverlap = (requestStart < reservationEnd && requestEnd > reservationStart);
      const isTransitionDay = (requestStart === reservationEnd || requestEnd === reservationStart);
      
      return hasOverlap && !isTransitionDay;
    });
    
    return !hasConflict;
  }, [reservations]);

  const value = {
    reservations,
    apartments,
    loading,
    isLoading: loading, // alias for compatibility
    addReservation,
    updateReservation,
    deleteReservation,
    refreshData,
    refreshReservations,
    getApartmentAvailability
  };

  return (
    <ReservationsContext.Provider value={value}>
      {children}
    </ReservationsContext.Provider>
  );
};

export const useReservations = () => {
  const context = useContext(ReservationsContext);
  if (context === undefined) {
    throw new Error('useReservations must be used within a ReservationsProvider');
  }
  return context;
};