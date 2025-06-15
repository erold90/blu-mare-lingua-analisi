
import { useState, useEffect } from "react";
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { useReservations } from "@/hooks/useReservations";

export function useApartmentAvailability(apartments: Apartment[], formValues: FormValues) {
  const [availableApartments, setAvailableApartments] = useState<(Apartment & { booked?: boolean })[]>([]);
  const { getApartmentAvailability, refreshData } = useReservations();
  
  // Sync data on component mount to ensure latest availability
  useEffect(() => {
    const syncAvailability = async () => {
      try {
        await refreshData();
      } catch (error) {
        console.error("Error syncing availability data:", error);
      }
    };
    
    syncAvailability();
  }, []); // Only on mount
  
  // Update availability when form values change
  useEffect(() => {
    const filteredApartments = apartments.map(apartment => {
      // Verify if the apartment is already booked for the selected dates
      // Con la logica corretta, le date di check-in e check-out sono disponibili per altre prenotazioni
      const isAvailable = formValues.checkIn && formValues.checkOut ? 
        getApartmentAvailability(apartment.id, new Date(formValues.checkIn), new Date(formValues.checkOut)) :
        true;

      console.log(`Apartment ${apartment.name} (${apartment.id}): ${isAvailable ? 'AVAILABLE' : 'BOOKED'} for ${formValues.checkIn} to ${formValues.checkOut}`);

      return {
        ...apartment,
        booked: !isAvailable
      };
    });
    
    setAvailableApartments(filteredApartments);
  }, [apartments, formValues.checkIn, formValues.checkOut, getApartmentAvailability]);
  
  return { availableApartments };
}
