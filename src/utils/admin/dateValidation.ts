
import { Reservation } from "@/hooks/useSupabaseReservations";

// Normalizza una data per confronti (rimuove ore, minuti, secondi)
export const normalizeDate = (date: Date | string): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Verifica se due periodi si sovrappongono (esclusi i giorni di transizione)
export const hasDateOverlap = (
  start1: Date | string, 
  end1: Date | string, 
  start2: Date | string, 
  end2: Date | string
): boolean => {
  const normStart1 = normalizeDate(start1).getTime();
  const normEnd1 = normalizeDate(end1).getTime();
  const normStart2 = normalizeDate(start2).getTime();
  const normEnd2 = normalizeDate(end2).getTime();
  
  // C'è sovrapposizione se: start1 < end2 AND end1 > start2
  // MA escluso se una termina esattamente quando l'altra inizia (giorni di transizione)
  const hasOverlap = (normStart1 < normEnd2 && normEnd1 > normStart2);
  const isTransitionDay = (normStart1 === normEnd2 || normEnd1 === normStart2);
  
  return hasOverlap && !isTransitionDay;
};

// Verifica conflitti per una prenotazione
export const checkReservationConflicts = (
  newReservation: {
    apartmentIds: string[];
    startDate: Date | string;
    endDate: Date | string;
    id?: string; // Per escludere se stessa durante l'edit
  },
  existingReservations: Reservation[]
): { hasConflict: boolean; conflictingReservations: Reservation[] } => {
  const conflictingReservations = existingReservations.filter(reservation => {
    // Escludi se stessa durante l'edit
    if (newReservation.id && reservation.id === newReservation.id) {
      return false;
    }
    
    // Verifica se condividono almeno un appartamento
    const sharedApartments = newReservation.apartmentIds.some(aptId => 
      reservation.apartmentIds.includes(aptId)
    );
    
    if (!sharedApartments) return false;
    
    // Verifica sovrapposizione date
    return hasDateOverlap(
      newReservation.startDate,
      newReservation.endDate,
      reservation.startDate,
      reservation.endDate
    );
  });
  
  return {
    hasConflict: conflictingReservations.length > 0,
    conflictingReservations
  };
};

// Valida che la data di fine sia dopo quella di inizio
export const validateDateRange = (startDate: Date | string, endDate: Date | string): boolean => {
  const start = normalizeDate(startDate);
  const end = normalizeDate(endDate);
  return end > start;
};

// Calcola il numero di notti
export const calculateNights = (startDate: Date | string, endDate: Date | string): number => {
  const start = normalizeDate(startDate);
  const end = normalizeDate(endDate);
  return Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
};
