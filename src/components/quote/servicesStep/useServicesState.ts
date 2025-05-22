
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";

export function useServicesState(
  form: UseFormReturn<FormValues>, 
  selectedApartmentIds: string[], 
  apartments: Apartment[]
) {
  // State for persons per apartment (for linen distribution)
  const [personsPerApartment, setPersonsPerApartment] = useState<Record<string, number>>(
    Object.fromEntries(selectedApartmentIds.map(id => [id, 0]))
  );
  
  // State for which apartment has pets
  const [petsInApartment, setPetsInApartment] = useState<Record<string, boolean>>(
    Object.fromEntries(selectedApartmentIds.map(id => [id, false]))
  );
  
  // Initialize or update when selected apartments change
  useEffect(() => {
    // Initialize with empty values if not set
    const initialPersonsPerApt: Record<string, number> = {};
    const initialPetsPerApt: Record<string, boolean> = {};
    
    selectedApartmentIds.forEach(id => {
      initialPersonsPerApt[id] = personsPerApartment[id] || 0;
      initialPetsPerApt[id] = petsInApartment[id] || false;
    });
    
    setPersonsPerApartment(initialPersonsPerApt);
    setPetsInApartment(initialPetsPerApt);
    
    // Set form values
    form.setValue("personsPerApartment", initialPersonsPerApt);
    form.setValue("petsInApartment", initialPetsPerApt);
  }, [selectedApartmentIds.join(',')]);
  
  // Update form when distribution changes
  const updatePersonsPerApartment = (apartmentId: string, count: number) => {
    const newDistribution = { ...personsPerApartment, [apartmentId]: count };
    setPersonsPerApartment(newDistribution);
    form.setValue("personsPerApartment", newDistribution);
  };
  
  // Toggle pet assignment for an apartment
  const togglePetInApartment = (apartmentId: string) => {
    const newPetsDistribution = { 
      ...petsInApartment, 
      [apartmentId]: !petsInApartment[apartmentId] 
    };
    setPetsInApartment(newPetsDistribution);
    form.setValue("petsInApartment", newPetsDistribution);
    
    // If any apartment has pets, set hasPets to true
    const hasPetsInAnyApartment = Object.values(newPetsDistribution).some(Boolean);
    form.setValue("hasPets", hasPetsInAnyApartment);
  };
  
  // Check if an apartment has reached its capacity
  const hasReachedApartmentCapacity = (apartmentId: string) => {
    const apartment = apartments.find(apt => apt.id === apartmentId);
    if (!apartment) return true;
    
    // Get current assigned persons for this apartment
    const currentAssigned = personsPerApartment[apartmentId] || 0;
    
    // Return true if we've reached the maximum capacity of this apartment
    return currentAssigned >= apartment.beds;
  };
  
  // Calculate total persons assigned to apartments
  const totalAssignedPersons = Object.values(personsPerApartment).reduce((sum, count) => sum + count, 0);
  
  return {
    personsPerApartment,
    petsInApartment,
    totalAssignedPersons,
    updatePersonsPerApartment,
    togglePetInApartment,
    hasReachedApartmentCapacity
  };
}

export function calculateGuestCounts(formValues: FormValues) {
  const totalAdults = formValues.adults || 0;
  const totalChildren = formValues.children || 0;
  const childrenDetails = formValues.childrenDetails || [];
  
  // Count children who don't sleep with parents or in cribs
  const independentChildren = childrenDetails.filter(child => 
    !child.sleepsWithParents && !child.sleepsInCrib
  ).length;
  
  // Total people who need linen (adults + independent children)
  const totalPeopleForLinen = totalAdults + independentChildren;
  
  return {
    totalAdults,
    totalChildren,
    independentChildren,
    totalPeopleForLinen
  };
}
