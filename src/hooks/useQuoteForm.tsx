
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormValues, formSchema } from "@/utils/quoteFormSchema";
import { useChildrenManagement } from "./quote/useChildrenManagement";
import { useStepManagement } from "./quote/useStepManagement";
import { useApartmentSelection } from "./quote/useApartmentSelection";
import { useGroupManagement, FamilyGroup } from "./quote/useGroupManagement";
import { useQuoteActions } from "./quote/useQuoteActions";
import { useChildEffects } from "./quote/useChildEffects";
import { useState } from "react";

export function useQuoteForm() {
  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      step: 1,
      adults: 2,
      children: 0,
      childrenDetails: [],
      linenOption: "standard",
      hasPets: false,
      petsCount: 0,
      isGroupBooking: false,
      selectedApartments: [],
    },
  });
  
  // Initialize child hooks
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
    downloadQuote, 
    sendWhatsApp, 
    onSubmitHandler, 
    handleSubmitWrapper,
    showConfirmationDialog,
    setShowConfirmationDialog
  } = useQuoteActions(form);
  
  // Setup effect hooks
  useChildEffects(form, childrenArray, setChildrenArray);
  
  return {
    form,
    step,
    totalSteps,
    childrenArray,
    apartmentDialog,
    groupDialog,
    familyGroups,
    showConfirmationDialog,
    setShowConfirmationDialog,
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
    downloadQuote,
    sendWhatsApp,
    onSubmitHandler,
    handleSubmitWrapper
  };
}
