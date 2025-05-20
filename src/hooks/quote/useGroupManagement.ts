
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/utils/quoteFormSchema";

interface FamilyGroup {
  adults: number; 
  children: number; 
  childrenDetails: { 
    isUnder12: boolean; 
    sleepsWithParents: boolean; 
    sleepsInCrib: boolean; 
  }[];
}

export function useGroupManagement(
  form: UseFormReturn<FormValues>,
  setChildrenArray: React.Dispatch<React.SetStateAction<{ 
    isUnder12: boolean; 
    sleepsWithParents: boolean; 
    sleepsInCrib: boolean; 
  }[]>>
) {
  const [groupDialog, setGroupDialog] = useState(false);
  const [familyGroups, setFamilyGroups] = useState<FamilyGroup[]>([]);
  
  // Group dialog management
  const openGroupDialog = () => {
    setGroupDialog(true);
    
    // Create default group if none exists
    if (familyGroups.length === 0) {
      const adultsCount = form.getValues("adults");
      const childrenCount = form.getValues("children");
      
      // Create an array of children details
      const childrenDetailsArray = [];
      for (let i = 0; i < childrenCount; i++) {
        childrenDetailsArray.push({ 
          isUnder12: false, 
          sleepsWithParents: false, 
          sleepsInCrib: false 
        });
      }
      
      const initialGroups = [{ 
        adults: adultsCount, 
        children: childrenCount, 
        childrenDetails: childrenDetailsArray
      }];
      
      setFamilyGroups(initialGroups);
    }
    
    form.setValue("isGroupBooking", true);
  };
  
  const closeGroupDialog = () => {
    setGroupDialog(false);
    
    // Update totals based on defined groups
    if (familyGroups.length > 0) {
      const totalAdults = familyGroups.reduce((sum, group) => sum + group.adults, 0);
      const totalChildren = familyGroups.reduce((sum, group) => sum + group.children, 0);
      
      form.setValue("adults", totalAdults);
      form.setValue("children", totalChildren);
      
      // Update children details
      const allChildrenDetails: { 
        isUnder12: boolean; 
        sleepsWithParents: boolean; 
        sleepsInCrib: boolean; 
      }[] = [];
      
      familyGroups.forEach(group => {
        if (group.childrenDetails && group.childrenDetails.length > 0) {
          allChildrenDetails.push(...group.childrenDetails);
        }
      });
      
      setChildrenArray(allChildrenDetails);
      form.setValue("childrenDetails", allChildrenDetails);
    }
  };

  return {
    groupDialog,
    familyGroups,
    openGroupDialog,
    closeGroupDialog,
    setFamilyGroups
  };
}

export type { FamilyGroup };
