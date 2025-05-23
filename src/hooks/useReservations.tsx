
import React, { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { apartments } from "@/data/apartments";
import { discoveryStorage, DISCOVERY_STORAGE_KEYS } from "@/services/discoveryStorage";
import { toast } from "sonner";

// Type definitions
export interface Apartment {
  id: string;
  name: string;
}

export interface Reservation {
  id: string;
  guestName: string;
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
}

// Get apartments from the data file instead of hardcoded values
const defaultApartments: Apartment[] = apartments.map(apt => ({
  id: apt.id,
  name: apt.name
}));

interface ReservationsContextType {
  reservations: Reservation[];
  apartments: Apartment[];
  addReservation: (reservation: Omit<Reservation, "id">) => void;
  updateReservation: (reservation: Reservation) => void;
  deleteReservation: (id: string) => void;
  getApartmentAvailability: (apartmentId: string, startDate: Date, endDate: Date) => boolean;
  refreshData: () => void;
  isLoading: boolean;
}

const ReservationsContext = createContext<ReservationsContextType | undefined>(undefined);

export const ReservationsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [apartments] = useState<Apartment[]>(defaultApartments);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Function to load reservations from discovery storage
  const loadReservations = () => {
    setIsLoading(true);
    const savedReservations = discoveryStorage.getItem<Reservation[]>(DISCOVERY_STORAGE_KEYS.RESERVATIONS);
    if (savedReservations) {
      try {
        console.log(`Loaded ${savedReservations.length} reservations from storage`);
        setReservations(savedReservations);
      } catch (error) {
        console.error("Failed to parse saved reservations:", error);
        toast.error("Errore nel caricamento delle prenotazioni");
      }
    } else {
      console.log("No reservations found in storage");
    }
    setIsLoading(false);
  };
  
  // Force a refresh of data from the server
  const refreshData = async () => {
    setIsLoading(true);
    try {
      await discoveryStorage.syncFromServer(DISCOVERY_STORAGE_KEYS.RESERVATIONS);
      toast.success("Dati sincronizzati correttamente");
      loadReservations();
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Errore durante la sincronizzazione");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load reservations from discovery storage on mount
  useEffect(() => {
    loadReservations();
    
    // Listen for storage updates from other tabs/windows/devices
    const unsubscribe = discoveryStorage.subscribe(DISCOVERY_STORAGE_KEYS.RESERVATIONS, () => {
      console.log("Storage update detected, reloading reservations");
      loadReservations();
    });
    
    // Clean up subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);
  
  // Save reservations to discovery storage whenever they change
  useEffect(() => {
    if (!isLoading && reservations.length > 0) {
      console.log(`Saving ${reservations.length} reservations to discovery storage`);
      discoveryStorage.setItem(DISCOVERY_STORAGE_KEYS.RESERVATIONS, reservations);
    }
  }, [reservations, isLoading]);
  
  const addReservation = (reservationData: Omit<Reservation, "id">) => {
    const newReservation: Reservation = {
      ...reservationData,
      id: uuidv4(),
      startDate: new Date(reservationData.startDate).toISOString(),
      endDate: new Date(reservationData.endDate).toISOString()
    };
    
    setReservations(prev => [...prev, newReservation]);
  };
  
  const updateReservation = (updatedReservation: Reservation) => {
    const formatted: Reservation = {
      ...updatedReservation,
      startDate: new Date(updatedReservation.startDate).toISOString(),
      endDate: new Date(updatedReservation.endDate).toISOString()
    };
    
    setReservations(prev => 
      prev.map(res => res.id === formatted.id ? formatted : res)
    );
  };
  
  const deleteReservation = (id: string) => {
    setReservations(prev => prev.filter(res => res.id !== id));
  };
  
  // Check if an apartment is available for the given date range
  const getApartmentAvailability = (apartmentId: string, startDate: Date, endDate: Date): boolean => {
    // Convert dates to timestamps for easier comparison
    const start = startDate.getTime();
    const end = endDate.getTime();
    
    // Check for conflicts with existing reservations
    return !reservations.some(reservation => {
      // Skip if this reservation doesn't include the apartment
      if (!reservation.apartmentIds.includes(apartmentId)) return false;
      
      const reservationStart = new Date(reservation.startDate).getTime();
      const reservationEnd = new Date(reservation.endDate).getTime();
      
      // Check for overlap
      return (start < reservationEnd && end > reservationStart);
    });
  };
  
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

export const useReservations = () => {
  const context = useContext(ReservationsContext);
  
  if (context === undefined) {
    throw new Error("useReservations must be used within a ReservationsProvider");
  }
  
  return context;
};
