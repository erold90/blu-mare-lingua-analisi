
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/utils/quoteFormSchema";
import { DateRange } from "react-day-picker";
import { differenceInDays, addDays, isSameDay } from "date-fns";
import { toast } from "sonner";
import { usePrices } from "@/hooks/usePrices";
import { apartments } from "@/data/apartments";

export function useDateSelection(form: UseFormReturn<FormValues>) {
  // Initialize prices hook to check for available prices
  const { getPriceForWeek } = usePrices();
  
  // Initialize date range from form values
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const checkIn = form.getValues("checkIn");
    const checkOut = form.getValues("checkOut");
    
    if (checkIn && checkOut) {
      return {
        from: new Date(checkIn),
        to: new Date(checkOut)
      };
    }
    
    return undefined;
  });
  
  // Calculate number of nights
  const numberOfNights = dateRange?.from && dateRange?.to
    ? differenceInDays(dateRange.to, dateRange.from)
    : 0;
  
  // Function to check if a date has a price for any apartment
  const hasAnyApartmentPrice = (date: Date): boolean => {
    for (const apartment of apartments) {
      const price = getPriceForWeek(apartment.id, date);
      if (price > 0) {
        return true;
      }
    }
    return false;
  };
  
  // Function to check if a date is disabled
  const isDateDisabled = (date: Date): boolean => {
    const day = date.getDay();
    
    // Se è sabato (6), controlla direttamente i prezzi
    if (day === 6) {
      return !hasAnyApartmentPrice(date);
    }
    
    // Per domenica (0) e lunedì (1), dobbiamo verificare se ci sono prezzi per il sabato precedente
    if (day === 0) {
      // Domenica - controlla se il sabato prima ha prezzi
      const saturdayBefore = addDays(date, -1);
      return !hasAnyApartmentPrice(saturdayBefore);
    }
    
    if (day === 1) {
      // Lunedì - controlla se il sabato prima ha prezzi
      const saturdayBefore = addDays(date, -2);
      return !hasAnyApartmentPrice(saturdayBefore);
    }
    
    // Qualsiasi altro giorno è disabilitato
    return true;
  };
  
  // Handle date range selection
  const handleDateChange = (range: DateRange | undefined) => {
    if (!range) {
      form.setValue("checkIn", undefined as any);
      form.setValue("checkOut", undefined as any);
      setDateRange(undefined);
      return;
    }
    
    // If only the start date is selected, update that
    if (range.from && !range.to) {
      setDateRange({ from: range.from, to: undefined });
      form.setValue("checkIn", range.from);
      return;
    }
    
    // If both dates are selected, check for min/max night constraints
    if (range.from && range.to) {
      const nights = differenceInDays(range.to, range.from);
      
      // Enforce minimum 5 nights
      if (nights < 5) {
        toast("Il soggiorno minimo è di 5 notti");
        return;
      }
      
      // Enforce maximum 28 nights
      if (nights > 28) {
        toast("Il soggiorno massimo è di 28 notti");
        return;
      }
    }
    
    // Update the date range state
    setDateRange(range);
    
    // Update form values
    if (range.from) {
      form.setValue("checkIn", range.from);
    }
    
    if (range.to) {
      form.setValue("checkOut", range.to);
    }
    
    // Trigger validation
    form.trigger(["checkIn", "checkOut"]);
  };
  
  return {
    dateRange,
    numberOfNights,
    isDateDisabled,
    handleDateChange
  };
}

