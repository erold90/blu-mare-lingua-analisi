
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/utils/quoteFormSchema";

export function useChildrenManagement(form: UseFormReturn<FormValues>) {
  const [childrenArray, setChildrenArray] = useState<{ 
    isUnder12: boolean; 
    sleepsWithParents: boolean; 
    sleepsInCrib: boolean 
  }[]>([]);

  // Functions for incrementing/decrementing adults and children
  const incrementAdults = () => {
    const current = form.getValues("adults");
    form.setValue("adults", current + 1);
  };

  const decrementAdults = () => {
    const current = form.getValues("adults");
    if (current > 1) {
      form.setValue("adults", current - 1);
    }
  };

  const incrementChildren = () => {
    const current = form.getValues("children");
    form.setValue("children", current + 1);
  };

  const decrementChildren = () => {
    const current = form.getValues("children");
    if (current > 0) {
      form.setValue("children", current - 1);
    }
  };

  // Update child details
  const updateChildDetails = (
    index: number,
    field: 'isUnder12' | 'sleepsWithParents' | 'sleepsInCrib',
    value: boolean
  ) => {
    // Create a deep copy of the array
    const updatedArray = childrenArray.map((child, i) => {
      if (i === index) {
        return { ...child, [field]: value };
      }
      return { ...child };
    });
    
    setChildrenArray(updatedArray);
    form.setValue("childrenDetails", updatedArray);
  };

  return {
    childrenArray,
    setChildrenArray,
    incrementAdults,
    decrementAdults,
    incrementChildren,
    decrementChildren,
    updateChildDetails
  };
}
