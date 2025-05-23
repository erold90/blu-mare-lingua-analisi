
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/utils/quoteFormSchema";
import { DateRange } from "react-day-picker";
import { differenceInDays, addDays, isSameDay, startOfWeek, getWeek, getYear } from "date-fns";
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
  
  // Function to check if a date is in the last week of October
  const isLastWeekOfOctober = (date: Date): boolean => {
    const month = date.getMonth();
    const year = date.getFullYear();
    
    if (month !== 9) return false; // October is month 9 (0-indexed)
    
    // Get the last Saturday of October
    const lastDayOfOctober = new Date(year, 10, 0); // Last day of October
    let lastSaturday = new Date(lastDayOfOctober);
    
    // Find the last Saturday
    while (lastSaturday.getDay() !== 6) {
      lastSaturday.setDate(lastSaturday.getDate() - 1);
    }
    
    // Check if the date is in the last week (from last Saturday to end of month)
    return date >= lastSaturday && date <= lastDayOfOctober;
  };
  
  // Function to check if a date has a price for any apartment
  const hasAnyApartmentPrice = (date: Date): boolean => {
    // Get Saturday of the week containing this date
    const weekStart = startOfWeek(date, { weekStartsOn: 6 });
    
    for (const apartment of apartments) {
      const price = getPriceForWeek(apartment.id, weekStart);
      if (price > 0) {
        return true;
      }
    }
    return false;
  };
  
  // Function to check if a date is disabled
  const isDateDisabled = (date: Date): boolean => {
    // Block dates in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;
    
    // Block last week of October
    if (isLastWeekOfOctober(date)) return true;
    
    const day = date.getDay();
    
    // Only allow Saturday (6), Sunday (0), and Monday (1) for check-in/check-out
    if (day !== 6 && day !== 0 && day !== 1) return true;
    
    // For allowed days, check if there are prices available
    // Get the Saturday that starts the pricing week for this date
    const weekStart = startOfWeek(date, { weekStartsOn: 6 });
    
    // If it's Sunday or Monday, we still need to check the Saturday price
    // because pricing is per week starting from Saturday
    return !hasAnyApartmentPrice(weekStart);
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
        toast.error("Il soggiorno minimo è di 5 notti");
        return;
      }
      
      // Enforce maximum 28 nights
      if (nights > 28) {
        toast.error("Il soggiorno massimo è di 28 notti");
        return;
      }
      
      // Check if check-out is on allowed days
      const checkOutDay = range.to.getDay();
      if (checkOutDay !== 6 && checkOutDay !== 0 && checkOutDay !== 1) {
        toast.error("Il check-out è disponibile solo sabato, domenica o lunedì");
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
