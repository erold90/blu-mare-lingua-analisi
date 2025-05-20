
import { useState, useEffect } from "react";
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { useReservations } from "@/hooks/useReservations";

export function useApartmentAvailability(apartments: Apartment[], formValues: FormValues) {
  const [availableApartments, setAvailableApartments] = useState<(Apartment & { booked?: boolean })[]>([]);
  const { getApartmentAvailability } = useReservations();
  
  useEffect(() => {
    const filteredApartments = apartments.map(apartment => {
      // Verify if the apartment is already booked for the selected dates
      const isAvailable = formValues.checkIn && formValues.checkOut ? 
        getApartmentAvailability(apartment.id, new Date(formValues.checkIn), new Date(formValues.checkOut)) :
        true;

      return {
        ...apartment,
        booked: !isAvailable
      };
    });
    
    setAvailableApartments(filteredApartments);
  }, [apartments, formValues.checkIn, formValues.checkOut, getApartmentAvailability]);
  
  return { availableApartments };
}
