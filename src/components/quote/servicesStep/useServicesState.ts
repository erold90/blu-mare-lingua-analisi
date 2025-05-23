
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";

export function useServicesState(
  form: UseFormReturn<FormValues>, 
  selectedApartmentIds: string[], 
  apartments: Apartment[]
) {
  console.log("🔍 useServicesState: Initializing with:", { 
    selectedApartmentIds, 
    apartmentsCount: apartments?.length 
  });
  
  // Defensive initialization
  const safeSelectedIds = Array.isArray(selectedApartmentIds) ? selectedApartmentIds : [];
  const safeApartments = Array.isArray(apartments) ? apartments : [];
  
  // State for persons per apartment (for linen distribution)
  const [personsPerApartment, setPersonsPerApartment] = useState<Record<string, number>>(() => {
    const initial = Object.fromEntries(safeSelectedIds.map(id => [id, 0]));
    console.log("🔍 useServicesState: Initial persons per apartment:", initial);
    return initial;
  });
  
  // State for which apartment has pets
  const [petsInApartment, setPetsInApartment] = useState<Record<string, boolean>>(() => {
    const initial = Object.fromEntries(safeSelectedIds.map(id => [id, false]));
    console.log("🔍 useServicesState: Initial pets in apartment:", initial);
    return initial;
  });
  
  // Initialize or update when selected apartments change
  useEffect(() => {
    console.log("🔍 useServicesState: Effect triggered with selectedIds:", safeSelectedIds);
    
    try {
      // Initialize with empty values if not set
      const initialPersonsPerApt: Record<string, number> = {};
      const initialPetsPerApt: Record<string, boolean> = {};
      
      safeSelectedIds.forEach(id => {
        if (typeof id === 'string' && id.length > 0) {
          initialPersonsPerApt[id] = personsPerApartment[id] || 0;
          initialPetsPerApt[id] = petsInApartment[id] || false;
        }
      });
      
      console.log("🔍 useServicesState: Setting new state:", {
        persons: initialPersonsPerApt,
        pets: initialPetsPerApt
      });
      
      setPersonsPerApartment(initialPersonsPerApt);
      setPetsInApartment(initialPetsPerApt);
      
      // Set form values safely
      if (form && typeof form.setValue === 'function') {
        form.setValue("personsPerApartment", initialPersonsPerApt);
        form.setValue("petsInApartment", initialPetsPerApt);
      }
    } catch (error) {
      console.error("❌ useServicesState: Error in effect:", error);
    }
  }, [safeSelectedIds.join(',')]);
  
  // Update form when distribution changes
  const updatePersonsPerApartment = (apartmentId: string, count: number) => {
    try {
      console.log("🔍 useServicesState: Updating persons for apartment:", apartmentId, count);
      
      if (typeof apartmentId !== 'string' || typeof count !== 'number') {
        console.error("❌ useServicesState: Invalid parameters for updatePersonsPerApartment");
        return;
      }
      
      const newDistribution = { ...personsPerApartment, [apartmentId]: Math.max(0, count) };
      setPersonsPerApartment(newDistribution);
      
      if (form && typeof form.setValue === 'function') {
        form.setValue("personsPerApartment", newDistribution);
      }
    } catch (error) {
      console.error("❌ useServicesState: Error updating persons per apartment:", error);
    }
  };
  
  // Toggle pet assignment for an apartment
  const togglePetInApartment = (apartmentId: string) => {
    try {
      console.log("🔍 useServicesState: Toggling pet for apartment:", apartmentId);
      
      if (typeof apartmentId !== 'string') {
        console.error("❌ useServicesState: Invalid apartmentId for togglePetInApartment");
        return;
      }
      
      const newPetsDistribution = { 
        ...petsInApartment, 
        [apartmentId]: !petsInApartment[apartmentId] 
      };
      setPetsInApartment(newPetsDistribution);
      
      if (form && typeof form.setValue === 'function') {
        form.setValue("petsInApartment", newPetsDistribution);
        
        // If any apartment has pets, set hasPets to true
        const hasPetsInAnyApartment = Object.values(newPetsDistribution).some(Boolean);
        form.setValue("hasPets", hasPetsInAnyApartment);
      }
    } catch (error) {
      console.error("❌ useServicesState: Error toggling pet in apartment:", error);
    }
  };
  
  // Check if an apartment has reached its capacity
  const hasReachedApartmentCapacity = (apartmentId: string) => {
    try {
      if (typeof apartmentId !== 'string') {
        console.error("❌ useServicesState: Invalid apartmentId for hasReachedApartmentCapacity");
        return true;
      }
      
      const apartment = safeApartments.find(apt => apt && apt.id === apartmentId);
      if (!apartment || typeof apartment.beds !== 'number') {
        console.warn("⚠️ useServicesState: Apartment not found or invalid beds count:", apartmentId);
        return true;
      }
      
      // Get current assigned persons for this apartment
      const currentAssigned = personsPerApartment[apartmentId] || 0;
      
      // Return true if we've reached the maximum capacity of this apartment
      return currentAssigned >= apartment.beds;
    } catch (error) {
      console.error("❌ useServicesState: Error checking apartment capacity:", error);
      return true;
    }
  };
  
  // Calculate total persons assigned to apartments
  const totalAssignedPersons = Object.values(personsPerApartment).reduce((sum, count) => {
    return sum + (typeof count === 'number' ? count : 0);
  }, 0);
  
  console.log("🔍 useServicesState: Returning state:", {
    totalAssignedPersons,
    personsCount: Object.keys(personsPerApartment).length,
    petsCount: Object.keys(petsInApartment).length
  });
  
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
  console.log("🔍 calculateGuestCounts: Starting with values:", formValues);
  
  try {
    // Defensive extraction with fallbacks
    const totalAdults = typeof formValues?.adults === 'number' ? formValues.adults : 0;
    const totalChildren = typeof formValues?.children === 'number' ? formValues.children : 0;
    const childrenDetails = Array.isArray(formValues?.childrenDetails) ? formValues.childrenDetails : [];
    
    console.log("🔍 calculateGuestCounts: Extracted values:", {
      totalAdults,
      totalChildren,
      childrenDetailsCount: childrenDetails.length
    });
    
    // Count children who don't sleep with parents or in cribs
    const independentChildren = childrenDetails.filter(child => {
      if (!child || typeof child !== 'object') return false;
      return !child.sleepsWithParents && !child.sleepsInCrib;
    }).length;
    
    // Total people who need linen (adults + independent children)
    const totalPeopleForLinen = totalAdults + independentChildren;
    
    const result = {
      totalAdults,
      totalChildren,
      independentChildren,
      totalPeopleForLinen
    };
    
    console.log("🔍 calculateGuestCounts: Result:", result);
    return result;
  } catch (error) {
    console.error("❌ calculateGuestCounts: Error calculating guest counts:", error);
    // Return safe fallback values
    return {
      totalAdults: 0,
      totalChildren: 0,
      independentChildren: 0,
      totalPeopleForLinen: 0
    };
  }
}
