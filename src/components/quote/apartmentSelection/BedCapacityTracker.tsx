
import React from "react";
import { Apartment } from "@/data/apartments";
import { FormValues } from "@/utils/quoteFormSchema";
import { getEffectiveGuestCount } from "@/utils/apartmentRecommendation";

interface BedCapacityTrackerProps {
  selectedApartmentIds: string[];
  apartments: Apartment[];
  formValues: FormValues;
}

export interface BedCapacityInfo {
  selectedBedsCount: number;
  hasEnoughBeds: boolean;
  requiredBeds: number;
}

export const calculateBedCapacity = (props: BedCapacityTrackerProps): BedCapacityInfo => {
  const { selectedApartmentIds, apartments, formValues } = props;
  
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

// Component doesn't render anything, it's just a utility
const BedCapacityTracker: React.FC<BedCapacityTrackerProps> = () => {
  return null;
};

export default BedCapacityTracker;
