
import React, { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { apartments } from "@/data/apartments";

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
}

const ReservationsContext = createContext<ReservationsContextType | undefined>(undefined);

export const ReservationsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [apartments] = useState<Apartment[]>(defaultApartments);
  
  // Load reservations from localStorage on mount
  useEffect(() => {
    const savedReservations = localStorage.getItem("reservations");
    if (savedReservations) {
      try {
        setReservations(JSON.parse(savedReservations));
      } catch (error) {
        console.error("Failed to parse saved reservations:", error);
      }
    }
  }, []);
  
  // Save reservations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("reservations", JSON.stringify(reservations));
  }, [reservations]);
  
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
      getApartmentAvailability
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
