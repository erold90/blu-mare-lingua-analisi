
import { useState, useEffect } from "react";
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { useReservations } from "@/hooks/useReservations";

export function useApartmentAvailability(apartments: Apartment[], formValues: FormValues) {
  const [availableApartments, setAvailableApartments] = useState<(Apartment & { booked?: boolean })[]>([]);
  const { getApartmentAvailability, reservations } = useReservations();
  
  // Update availability when form values or reservations change
  useEffect(() => {
    if (!formValues.checkIn || !formValues.checkOut) {
      setAvailableApartments(apartments.map(apt => ({ ...apt, booked: false })));
      return;
    }
    
    // Use dates directly without creating new Date objects for better performance
    const checkInDate = formValues.checkIn instanceof Date ? formValues.checkIn : new Date(formValues.checkIn);
    const checkOutDate = formValues.checkOut instanceof Date ? formValues.checkOut : new Date(formValues.checkOut);
    
    // Batch process all apartments for better performance
    const filteredApartments = apartments.map(apartment => {
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
