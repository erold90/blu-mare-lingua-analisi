
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { apartments } from "@/data/apartments";
import { toast } from "sonner";
import { supabaseService } from "@/services/supabaseService";

// Type definitions
export interface Apartment {
  id: string;
  name: string;
}

export interface Reservation {
  id: string;
  guestName: string; // This is required
  adults: number;
  children: number;
  cribs: number;
  hasPets: boolean;
  apartmentIds: string[];
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  finalPrice: number;
  paymentMethod: "cash" | "bankTransfer" | "creditCard";
  paymentStatus: "notPaid" | "deposit" | "paid";
  depositAmount?: number;
  notes?: string;
  hasLinen?: boolean;
  lastUpdated?: number; // Timestamp dell'ultima modifica
  syncId?: string; // ID per sincronizzazione
  deviceId?: string; // ID del dispositivo di origine
}

// Helper function to format date for database (avoiding timezone issues)
const formatDateForDatabase = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get apartments from the data file instead of hardcoded values
const defaultApartments: Apartment[] = apartments.map(apt => ({
  id: apt.id,
  name: apt.name
}));

interface ReservationsContextType {
  reservations: Reservation[];
  apartments: Apartment[];
  addReservation: (reservation: Omit<Reservation, "id" | "lastUpdated" | "syncId" | "deviceId">) => Promise<void>;
  updateReservation: (reservation: Reservation) => Promise<void>;
  deleteReservation: (id: string) => Promise<void>;
  getApartmentAvailability: (apartmentId: string, startDate: Date, endDate: Date) => boolean;
  refreshData: () => Promise<void>;
  isLoading: boolean;
}

const ReservationsContext = createContext<ReservationsContextType | undefined>(undefined);

export const SupabaseReservationsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [apartments] = useState<Apartment[]>(defaultApartments);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [deviceId] = useState<string>(() => {
    let id = localStorage.getItem('vmb_device_id');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('vmb_device_id', id);
    }
    return id;
  });
  
  // Function to load reservations from Supabase
  const loadReservations = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await supabaseService.reservations.getAll();
      
      // Transform Supabase data to match our interface
      const transformedReservations: Reservation[] = data.map(res => ({
        id: res.id,
        guestName: res.guest_name,
        adults: res.adults,
        children: res.children || 0,
        cribs: res.cribs || 0,
        hasPets: res.has_pets || false,
        apartmentIds: Array.isArray(res.apartment_ids) ? res.apartment_ids as string[] : [],
        startDate: res.start_date,
        endDate: res.end_date,
        finalPrice: res.final_price ? Number(res.final_price) : 0,
        paymentMethod: res.payment_method as "cash" | "bankTransfer" | "creditCard",
        paymentStatus: res.payment_status as "notPaid" | "deposit" | "paid",
        depositAmount: res.deposit_amount ? Number(res.deposit_amount) : undefined,
        notes: res.notes || undefined,
        hasLinen: res.linen_option === 'yes', // Convert string to boolean
        lastUpdated: res.updated_at ? new Date(res.updated_at).getTime() : Date.now(),
        deviceId: res.device_id || undefined
      }));
      
      // Sort reservations by arrival date - upcoming dates first, then past dates
      const sortedReservations = transformedReservations.sort((a, b) => {
        const dateA = new Date(a.startDate).getTime();
        const dateB = new Date(b.startDate).getTime();
        const today = new Date().getTime();
        
        // Separate upcoming and past reservations
        const aIsUpcoming = dateA >= today;
        const bIsUpcoming = dateB >= today;
        
        if (aIsUpcoming && !bIsUpcoming) return -1; // A is upcoming, B is past
        if (!aIsUpcoming && bIsUpcoming) return 1;  // A is past, B is upcoming
        
        if (aIsUpcoming && bIsUpcoming) {
          return dateA - dateB; // Both upcoming: earliest first
        } else {
          return dateB - dateA; // Both past: most recent first
        }
      });
      
      setReservations(sortedReservations);
      console.log(`Loaded ${sortedReservations.length} reservations from Supabase, sorted by arrival date (upcoming first)`);
    } catch (error) {
      console.error("Failed to load reservations:", error);
      toast.error("Errore nel caricamento delle prenotazioni");
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Force a refresh of data from database
  const refreshData = useCallback(async () => {
    await loadReservations();
    // Removed success toast notification
  }, [loadReservations]);
  
  // Load reservations on mount
  useEffect(() => {
    loadReservations();
  }, [loadReservations]);
  
  const addReservation = useCallback(async (reservationData: Omit<Reservation, "id" | "lastUpdated" | "syncId" | "deviceId">) => {
    try {
      const newReservation = {
        id: uuidv4(),
        guest_name: reservationData.guestName,
        adults: reservationData.adults,
        children: reservationData.children,
        cribs: reservationData.cribs,
        has_pets: reservationData.hasPets,
        apartment_ids: reservationData.apartmentIds,
        start_date: formatDateForDatabase(new Date(reservationData.startDate)),
        end_date: formatDateForDatabase(new Date(reservationData.endDate)),
        final_price: reservationData.finalPrice,
        payment_method: reservationData.paymentMethod,
        payment_status: reservationData.paymentStatus,
        deposit_amount: reservationData.depositAmount,
        notes: reservationData.notes,
        linen_option: reservationData.hasLinen ? 'yes' : 'no', // Convert boolean to string
        device_id: deviceId
      };
      
      await supabaseService.reservations.create(newReservation);
      await loadReservations(); // Reload to get updated data
      toast.success("Prenotazione aggiunta con successo");
    } catch (error) {
      console.error("Error in addReservation:", error);
      toast.error("Errore nell'aggiungere la prenotazione");
      throw error;
    }
  }, [deviceId, loadReservations]);
  
  const updateReservation = useCallback(async (updatedReservation: Reservation) => {
    try {
      const supabaseReservation = {
        guest_name: updatedReservation.guestName,
        adults: updatedReservation.adults,
        children: updatedReservation.children,
        cribs: updatedReservation.cribs,
        has_pets: updatedReservation.hasPets,
        apartment_ids: updatedReservation.apartmentIds,
        start_date: formatDateForDatabase(new Date(updatedReservation.startDate)),
        end_date: formatDateForDatabase(new Date(updatedReservation.endDate)),
        final_price: updatedReservation.finalPrice,
        payment_method: updatedReservation.paymentMethod,
        payment_status: updatedReservation.paymentStatus,
        deposit_amount: updatedReservation.depositAmount,
        notes: updatedReservation.notes,
        linen_option: updatedReservation.hasLinen ? 'yes' : 'no', // Convert boolean to string
        device_id: deviceId
      };
      
      await supabaseService.reservations.update(updatedReservation.id, supabaseReservation);
      await loadReservations(); // Reload to get updated data
      toast.success("Prenotazione aggiornata con successo");
    } catch (error) {
      console.error("Error in updateReservation:", error);
      toast.error("Errore nell'aggiornare la prenotazione");
      throw error;
    }
  }, [deviceId, loadReservations]);
  
  const deleteReservation = useCallback(async (id: string) => {
    try {
      await supabaseService.reservations.delete(id);
      await loadReservations(); // Reload to get updated data
      toast.success("Prenotazione eliminata con successo");
    } catch (error) {
      console.error("Error in deleteReservation:", error);
      toast.error("Errore nell'eliminare la prenotazione");
      throw error;
    }
  }, [loadReservations]);
  
  // Check if an apartment is available for the given date range
  // MODIFICATO: Le date di check-in e check-out sono ora disponibili per altre prenotazioni
  const getApartmentAvailability = useCallback((apartmentId: string, startDate: Date, endDate: Date): boolean => {
    // Convert dates to timestamps for easier comparison
    const start = startDate.getTime();
    const end = endDate.getTime();
    
    // Check for conflicts with existing reservations
    // IMPORTANTE: Una prenotazione si sovrappone solo se ci sono giorni di soggiorno in comune
    // Le date di check-in e check-out sono giorni di transizione e sono disponibili
    return !reservations.some(reservation => {
      // Skip if this reservation doesn't include the apartment
      if (!reservation.apartmentIds.includes(apartmentId)) return false;
      
      const reservationStart = new Date(reservation.startDate).getTime();
      const reservationEnd = new Date(reservation.endDate).getTime();
      
      // Check for overlap: una prenotazione si sovrappone solo se i periodi di soggiorno si intersecano
      // startDate < reservationEnd AND endDate > reservationStart
      // Ma escludiamo i casi dove una finisce quando l'altra inizia (giorni di transizione)
      return (start < reservationEnd && end > reservationStart) && 
             !(start === reservationEnd || end === reservationStart);
    });
  }, [reservations]);
  
  return (
    <ReservationsContext.Provider value={{
      reservations,
      apartments,
      addReservation,
      updateReservation,
      deleteReservation,
      getApartmentAvailability,
      refreshData,
      isLoading
    }}>
      {children}
    </ReservationsContext.Provider>
  );
};

export const useSupabaseReservations = () => {
  const context = useContext(ReservationsContext);
  
  if (context === undefined) {
    throw new Error("useSupabaseReservations must be used within a SupabaseReservationsProvider");
  }
  
  return context;
};
