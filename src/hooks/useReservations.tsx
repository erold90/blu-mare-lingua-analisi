
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { apartments } from "@/data/apartments";
import { toast } from "sonner";
import { DataType } from "@/services/externalStorage";
import { databaseProxy } from "@/services/databaseProxy";

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
  addReservation: (reservation: Omit<Reservation, "id" | "lastUpdated" | "syncId" | "deviceId">) => Promise<void>;
  updateReservation: (reservation: Reservation) => Promise<void>;
  deleteReservation: (id: string) => Promise<void>;
  getApartmentAvailability: (apartmentId: string, startDate: Date, endDate: Date) => boolean;
  refreshData: () => Promise<void>;
  isLoading: boolean;
}

const ReservationsContext = createContext<ReservationsContextType | undefined>(undefined);

export const ReservationsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [apartments] = useState<Apartment[]>(defaultApartments);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [deviceId] = useState<string>(() => {
    // Ottieni o genera un ID dispositivo univoco
    let id = localStorage.getItem('vmb_device_id');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('vmb_device_id', id);
    }
    return id;
  });
  
  // Function to load reservations from database
  const loadReservations = useCallback(async () => {
    setIsLoading(true);
    try {
      const loadedReservations = await databaseProxy.loadData<Reservation[]>(DataType.RESERVATIONS);
      if (loadedReservations && Array.isArray(loadedReservations)) {
        console.log(`Loaded ${loadedReservations.length} reservations from database`);
        setReservations(loadedReservations);
      } else {
        console.log("No reservations found in database or invalid data format");
        setReservations([]);
      }
    } catch (error) {
      console.error("Failed to load reservations:", error);
      toast.error("Errore nel caricamento delle prenotazioni");
      setReservations([]);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Force a refresh of data from database
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      await databaseProxy.synchronize(DataType.RESERVATIONS);
      await loadReservations();
      toast.success("Dati sincronizzati correttamente");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Errore durante la sincronizzazione");
      // Ricarica comunque i dati locali in caso di errore
      await loadReservations();
    } finally {
      setIsLoading(false);
    }
  }, [loadReservations]);
  
  // Load reservations on mount
  useEffect(() => {
    loadReservations();
    
    // Set up interval for periodic synchronization
    const intervalId = setInterval(() => {
      databaseProxy.synchronize(DataType.RESERVATIONS)
        .then(() => loadReservations())
        .catch(error => console.error("Error during periodic sync:", error));
    }, 60000); // Sync every minute
    
    // Clean up interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [loadReservations]);
  
  // Save reservations to database whenever they change
  useEffect(() => {
    const saveReservations = async () => {
      if (!isLoading && reservations.length >= 0) {
        console.log(`Saving ${reservations.length} reservations to database`);
        try {
          await databaseProxy.saveData(DataType.RESERVATIONS, reservations);
          console.log("Reservations saved successfully");
        } catch (error) {
          console.error("Failed to save reservations:", error);
        }
      }
    };
    
    saveReservations();
  }, [reservations, isLoading]);
  
  const addReservation = useCallback(async (reservationData: Omit<Reservation, "id" | "lastUpdated" | "syncId" | "deviceId">) => {
    try {
      const newReservation: Reservation = {
        ...reservationData,
        id: uuidv4(),
        startDate: new Date(reservationData.startDate).toISOString(),
        endDate: new Date(reservationData.endDate).toISOString(),
        lastUpdated: Date.now(),
        syncId: uuidv4(),
        deviceId: deviceId
      };
      
      console.log("Adding new reservation:", newReservation);
      
      // Aggiorna lo stato per l'interfaccia utente immediatamente
      setReservations(prev => [...prev, newReservation]);
      
      // Forza il salvataggio e la sincronizzazione dopo un'aggiunta
      try {
        await databaseProxy.saveData(DataType.RESERVATIONS, [...reservations, newReservation]);
        console.log("New reservation saved to database");
      } catch (error) {
        console.error("Failed to save new reservation:", error);
        toast.error("Errore nel salvare la prenotazione");
      }
      
      // Aggiorna i dati dopo il salvataggio per assicurarsi che tutto sia sincronizzato
      setTimeout(() => {
        refreshData().catch(err => console.error("Error refreshing after add:", err));
      }, 1000);
    } catch (error) {
      console.error("Error in addReservation:", error);
      throw error;
    }
  }, [reservations, deviceId, refreshData]);
  
  const updateReservation = useCallback(async (updatedReservation: Reservation) => {
    try {
      const formatted: Reservation = {
        ...updatedReservation,
        startDate: new Date(updatedReservation.startDate).toISOString(),
        endDate: new Date(updatedReservation.endDate).toISOString(),
        lastUpdated: Date.now(),
        syncId: updatedReservation.syncId || uuidv4(),
        deviceId: deviceId
      };
      
      console.log("Updating reservation:", formatted);
      
      const updatedReservations = reservations.map(res => 
        res.id === formatted.id ? formatted : res
      );
      
      // Aggiorna lo stato per l'interfaccia utente immediatamente
      setReservations(updatedReservations);
      
      // Forza il salvataggio dopo un aggiornamento
      try {
        await databaseProxy.saveData(DataType.RESERVATIONS, updatedReservations);
        console.log("Reservations updated in database");
      } catch (error) {
        console.error("Failed to update reservation:", error);
        toast.error("Errore nell'aggiornare la prenotazione");
      }
      
      // Aggiorna i dati dopo il salvataggio per assicurarsi che tutto sia sincronizzato
      setTimeout(() => {
        refreshData().catch(err => console.error("Error refreshing after update:", err));
      }, 1000);
    } catch (error) {
      console.error("Error in updateReservation:", error);
      throw error;
    }
  }, [reservations, deviceId, refreshData]);
  
  const deleteReservation = useCallback(async (id: string) => {
    try {
      console.log("Deleting reservation:", id);
      
      const updatedReservations = reservations.filter(res => res.id !== id);
      
      // Aggiorna lo stato per l'interfaccia utente immediatamente
      setReservations(updatedReservations);
      
      // Forza il salvataggio dopo un'eliminazione
      try {
        await databaseProxy.saveData(DataType.RESERVATIONS, updatedReservations);
        console.log("Reservations updated in database after delete");
      } catch (error) {
        console.error("Failed to delete reservation:", error);
        toast.error("Errore nell'eliminare la prenotazione");
      }
      
      // Aggiorna i dati dopo il salvataggio per assicurarsi che tutto sia sincronizzato
      setTimeout(() => {
        refreshData().catch(err => console.error("Error refreshing after delete:", err));
      }, 1000);
    } catch (error) {
      console.error("Error in deleteReservation:", error);
      throw error;
    }
  }, [reservations, refreshData]);
  
  // Check if an apartment is available for the given date range
  const getApartmentAvailability = useCallback((apartmentId: string, startDate: Date, endDate: Date): boolean => {
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

export const useReservations = () => {
  const context = useContext(ReservationsContext);
  
  if (context === undefined) {
    throw new Error("useReservations must be used within a ReservationsProvider");
  }
  
  return context;
};
