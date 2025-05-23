
import React, { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { apartments } from "@/data/apartments";
import { toast } from "sonner";
import { externalStorage, DataType } from "@/services/externalStorage";

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
  lastUpdated?: number; // Timestamp dell'ultima modifica
  syncId?: string; // ID per sincronizzazione
  deviceId?: string; // ID del dispositivo di origine
}

// Get apartments from the data file instead of hardcoded values
const defaultApartments: Apartment[] = apartments.map(apt => ({
  id: apt.id,
  name: apt.name
}));

interface ReservationsContextType {
  reservations: Reservation[];
  apartments: Apartment[];
  addReservation: (reservation: Omit<Reservation, "id" | "lastUpdated" | "syncId" | "deviceId">) => void;
  updateReservation: (reservation: Reservation) => void;
  deleteReservation: (id: string) => void;
  getApartmentAvailability: (apartmentId: string, startDate: Date, endDate: Date) => boolean;
  refreshData: () => Promise<void>;
  isLoading: boolean;
}

const ReservationsContext = createContext<ReservationsContextType | undefined>(undefined);

export const ReservationsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [apartments] = useState<Apartment[]>(defaultApartments);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [deviceId] = useState<string>(localStorage.getItem('vmb_device_id') || '');
  
  // Function to load reservations from external storage
  const loadReservations = async () => {
    setIsLoading(true);
    try {
      const loadedReservations = await externalStorage.loadData<Reservation[]>(DataType.RESERVATIONS);
      if (loadedReservations) {
        console.log(`Loaded ${loadedReservations.length} reservations from external storage`);
        setReservations(loadedReservations);
      } else {
        console.log("No reservations found in external storage");
        setReservations([]);
      }
    } catch (error) {
      console.error("Failed to load reservations:", error);
      toast.error("Errore nel caricamento delle prenotazioni");
      setReservations([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Force a refresh of data from external storage
  const refreshData = async () => {
    setIsLoading(true);
    try {
      await externalStorage.synchronize(DataType.RESERVATIONS);
      await loadReservations();
      toast.success("Dati sincronizzati correttamente");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Errore durante la sincronizzazione");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load reservations on mount and set up subscription
  useEffect(() => {
    loadReservations();
    
    // Subscribe to updates
    const unsubscribe = externalStorage.subscribe(DataType.RESERVATIONS, () => {
      console.log("Reservation data updated externally, reloading");
      loadReservations();
    });
    
    // Clean up subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);
  
  // Save reservations to external storage whenever they change
  useEffect(() => {
    if (!isLoading && reservations.length >= 0) {
      console.log(`Saving ${reservations.length} reservations to external storage`);
      externalStorage.saveData(DataType.RESERVATIONS, reservations)
        .catch(error => console.error("Failed to save reservations:", error));
    }
  }, [reservations, isLoading]);
  
  const addReservation = (reservationData: Omit<Reservation, "id" | "lastUpdated" | "syncId" | "deviceId">) => {
    const newReservation: Reservation = {
      ...reservationData,
      id: uuidv4(),
      startDate: new Date(reservationData.startDate).toISOString(),
      endDate: new Date(reservationData.endDate).toISOString(),
      lastUpdated: Date.now(),
      syncId: uuidv4(),
      deviceId: deviceId
    };
    
    setReservations(prev => [...prev, newReservation]);
  };
  
  const updateReservation = (updatedReservation: Reservation) => {
    const formatted: Reservation = {
      ...updatedReservation,
      startDate: new Date(updatedReservation.startDate).toISOString(),
      endDate: new Date(updatedReservation.endDate).toISOString(),
      lastUpdated: Date.now(),
      syncId: updatedReservation.syncId || uuidv4(),
      deviceId: deviceId
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
