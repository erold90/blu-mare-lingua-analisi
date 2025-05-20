
import React from "react";
import { Apartment } from "@/data/apartments";
import { FormValues } from "@/utils/quoteFormSchema";
import { getEffectiveGuestCount } from "@/utils/apartmentRecommendation";

interface BedCapacityTrackerProps {
  selectedApartmentIds: string[];
  apartments: Apartment[];
  formValues: FormValues;
}

const BedCapacityTracker: React.FC<BedCapacityTrackerProps> = ({ 
  selectedApartmentIds, 
  apartments,
  formValues 
}) => {
  // Get the number of required beds based on guest count
  const { effectiveGuestCount } = getEffectiveGuestCount(formValues);
  
  // Calculate how many beds are in the selected apartments
  const selectedApts = apartments.filter(apt => selectedApartmentIds.includes(apt.id));
  const totalBeds = selectedApts.reduce((total, apt) => total + apt.beds, 0);
  
  // Determine if there are enough beds for all guests
  const hasEnoughBeds = totalBeds >= effectiveGuestCount;
  
  return {
    selectedBedsCount: totalBeds,
    hasEnoughBeds,
    requiredBeds: effectiveGuestCount
  };
};

export default BedCapacityTracker;
