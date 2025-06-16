
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormValues, formSchema } from "@/utils/quoteFormSchema";
import { useChildrenManagement } from "./quote/useChildrenManagement";
import { useStepManagement } from "./quote/useStepManagement";
import { useApartmentSelection } from "./quote/useApartmentSelection";
import { useGroupManagement, FamilyGroup } from "./quote/useGroupManagement";
import { useQuoteActions } from "./quote/useQuoteActions";
import { useChildEffects } from "./quote/useChildEffects";
import { useState, useEffect, useMemo } from "react";

console.log("🔍 Loading useQuoteForm hook");

export function useQuoteForm() {
  // Prevent re-initialization with useMemo
  const defaultValues = useMemo(() => ({
    step: 1,
    adults: 2,
    children: 0,
    childrenDetails: [],
    needsLinen: false, // Cambiato da linenOption a needsLinen
    hasPets: false,
    petsCount: 0,
    isGroupBooking: false,
    selectedApartments: [],
  }), []);
  
  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  // Initialize child hooks with proper error handling
  const { 
    childrenArray, 
    setChildrenArray,
    incrementAdults, 
    decrementAdults, 
    incrementChildren, 
    decrementChildren,
    updateChildDetails 
  } = useChildrenManagement(form);
  
  const { step, totalSteps, nextStep, prevStep } = useStepManagement(form);
  
  const { 
    apartmentDialog, 
    openApartmentDialog, 
    closeApartmentDialog, 
    selectApartment 
  } = useApartmentSelection(form);
  
  const { 
    groupDialog, 
    familyGroups, 
    openGroupDialog, 
    closeGroupDialog, 
    setFamilyGroups 
  } = useGroupManagement(form, setChildrenArray);
  
  const { 
    sendWhatsApp, 
    onSubmitHandler, 
    handleSubmitWrapper
  } = useQuoteActions(form);
  
  // Setup effect hooks
  useChildEffects(form, childrenArray, setChildrenArray);
  
  // Log only once when mounted
  useEffect(() => {
    console.log("🚀 useQuoteForm hook mounted successfully");
    return () => console.log("👋 useQuoteForm hook unmounted");
  }, []);
  
  return {
    form,
    step,
    totalSteps,
    childrenArray,
    apartmentDialog,
    groupDialog,
    familyGroups,
    incrementAdults,
    decrementAdults,
    incrementChildren,
    decrementChildren,
    updateChildDetails,
    nextStep,
    prevStep,
    openApartmentDialog,
    closeApartmentDialog,
    selectApartment,
    openGroupDialog,
    closeGroupDialog,
    setFamilyGroups,
    sendWhatsApp,
    onSubmitHandler,
    handleSubmitWrapper
  };
}
