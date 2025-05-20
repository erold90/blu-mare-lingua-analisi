
import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/utils/quoteFormSchema";

export function useChildEffects(
  form: UseFormReturn<FormValues>,
  childrenArray: { 
    isUnder12: boolean; 
    sleepsWithParents: boolean; 
    sleepsInCrib: boolean;
  }[],
  setChildrenArray: React.Dispatch<React.SetStateAction<{ 
    isUnder12: boolean; 
    sleepsWithParents: boolean; 
    sleepsInCrib: boolean;
  }[]>>
) {
  // Handle changes in children count
  useEffect(() => {
    // If not a group booking, manage children normally
    if (!form.getValues("isGroupBooking")) {
      const childrenCount = form.getValues("children");
      let updatedArray = [...childrenArray];
      
      // Add new children if needed
      if (childrenCount > updatedArray.length) {
        const diff = childrenCount - updatedArray.length;
        for (let i = 0; i < diff; i++) {
          // Add new children with all values set to false
          updatedArray.push({ 
            isUnder12: false, 
            sleepsWithParents: false, 
            sleepsInCrib: false 
          });
        }
      }
      // Remove excess children
      else if (childrenCount < updatedArray.length) {
        updatedArray = updatedArray.slice(0, childrenCount);
      }
      
      setChildrenArray(updatedArray);
      form.setValue("childrenDetails", updatedArray);
    }
  }, [form.watch("children"), form.watch("isGroupBooking")]);
}
