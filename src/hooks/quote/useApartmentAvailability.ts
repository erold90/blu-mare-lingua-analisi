
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
        console.log("🔄 Availability data synced successfully");
      } catch (error) {
        console.error("❌ Error syncing availability data:", error);
      }
    };
    
    syncAvailability();
  }, []); // Only on mount
  
  // Update availability when form values change
  useEffect(() => {
    console.log("🔍 APARTMENT AVAILABILITY CHECK - Form values:", {
      checkIn: formValues.checkIn,
      checkOut: formValues.checkOut,
      adults: formValues.adults,
      children: formValues.children
    });
    
    if (!formValues.checkIn || !formValues.checkOut) {
      console.log("⚠️ Missing check-in or check-out dates, marking all apartments as available");
      setAvailableApartments(apartments.map(apt => ({ ...apt, booked: false })));
      return;
    }
    
    // CORREZIONE DEL BUG: Usiamo direttamente le date originali invece di creare nuove Date()
    const checkInDate = formValues.checkIn instanceof Date ? formValues.checkIn : new Date(formValues.checkIn);
    const checkOutDate = formValues.checkOut instanceof Date ? formValues.checkOut : new Date(formValues.checkOut);
    
    console.log("🔍 Checking availability for dates:", checkInDate, "to", checkOutDate);
    console.log("🔍 Date conversion check - original checkIn:", formValues.checkIn, "converted:", checkInDate);
    console.log("🔍 Date conversion check - original checkOut:", formValues.checkOut, "converted:", checkOutDate);
    console.log("🔍 Current reservations count:", reservations.length);
    
    if (reservations.length > 0) {
      console.log("🔍 EXISTING RESERVATIONS:");
      reservations.forEach((res, index) => {
        console.log(`  ${index + 1}. Guest: ${res.guestName}, Apartments: [${res.apartmentIds.join(', ')}], Dates: ${res.startDate} to ${res.endDate}`);
      });
    } else {
      console.log("📝 No existing reservations found");
    }
    
    const filteredApartments = apartments.map(apartment => {
      console.log(`\n🏠 Checking apartment ${apartment.name} (${apartment.id}):`);
      
      // CORREZIONE: Passiamo le date corrette alla funzione
      const isAvailable = getApartmentAvailability(apartment.id, checkInDate, checkOutDate);

      console.log(`🏠 Apartment ${apartment.name} (${apartment.id}): ${isAvailable ? '✅ AVAILABLE' : '❌ BOOKED'} for ${checkInDate.toISOString().split('T')[0]} to ${checkOutDate.toISOString().split('T')[0]}`);

      return {
        ...apartment,
        booked: !isAvailable
      };
    });
    
    console.log("🎯 FINAL APARTMENT AVAILABILITY RESULTS:", filteredApartments.map(apt => ({
      name: apt.name,
      id: apt.id,
      booked: apt.booked
    })));
    
    setAvailableApartments(filteredApartments);
  }, [apartments, formValues.checkIn, formValues.checkOut, getApartmentAvailability, reservations]);
  
  return { availableApartments };
}
