
// Calculator for extra costs (cleaning, linen, pets, tourist tax)
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { calculateLinenCost, calculatePetsCost, calculateCleaningFee, calculateTouristTax } from "./extrasCosts";

interface ExtrasResult {
  extrasCost: number;
  cleaningFee: number;
  touristTax: number;
}

export function calculateExtras(
  formValues: FormValues, 
  selectedApartments: Apartment[],
  nights: number
): ExtrasResult {
  // Calculate linen and pets costs
  const linenCost = calculateLinenCost(formValues);
  const petsCost = calculatePetsCost(formValues);
  
  // Combine into extras cost
  const extrasCost = linenCost + petsCost;
  
  // Calculate cleaning fee
  const cleaningFee = calculateCleaningFee(selectedApartments);
  
  // Calculate tourist tax
  const touristTax = calculateTouristTax(formValues, nights);
  
  return {
    extrasCost,
    cleaningFee,
    touristTax
  };
}
