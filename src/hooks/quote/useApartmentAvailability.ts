
import { useState, useEffect } from "react";
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { useReservations } from "@/hooks/useReservations";

export function useApartmentAvailability(apartments: Apartment[], formValues: FormValues) {
  const [availableApartments, setAvailableApartments] = useState<(Apartment & { booked?: boolean })[]>([]);
  const { getApartmentAvailability, refreshData, reservations } = useReservations();
  
  // Sync data on component mount to ensure latest availability
  useEffect(() => {
    const syncAvailability = async () => {
      try {
        await refreshData();
      } catch (error) {
        console.error("❌ Error syncing availability data:", error);
      }
    };
    
    syncAvailability();
  }, []); // Only on mount
  
  // Update availability when form values change
  useEffect(() => {
    if (!formValues.checkIn || !formValues.checkOut) {
      setAvailableApartments(apartments.map(apt => ({ ...apt, booked: false })));
      return;
    }
    
    // CORREZIONE DEL BUG: Usiamo direttamente le date originali invece di creare nuove Date()
    const checkInDate = formValues.checkIn instanceof Date ? formValues.checkIn : new Date(formValues.checkIn);
    const checkOutDate = formValues.checkOut instanceof Date ? formValues.checkOut : new Date(formValues.checkOut);
    
    const filteredApartments = apartments.map(apartment => {
      // CORREZIONE: Passiamo le date corrette alla funzione
      const isAvailable = getApartmentAvailability(apartment.id, checkInDate, checkOutDate);

      return {
        ...apartment,
        booked: !isAvailable
      };
    });
    
    setAvailableApartments(filteredApartments);
  }, [apartments, formValues.checkIn, formValues.checkOut, getApartmentAvailability, reservations]);
  
  return { availableApartments };
}
