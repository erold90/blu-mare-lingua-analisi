
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormValues, formSchema } from "@/utils/quoteFormSchema";
import { useChildrenManagement } from "./quote/useChildrenManagement";
import { useStepManagement } from "./quote/useStepManagement";
import { useApartmentSelection } from "./quote/useApartmentSelection";
import { useGroupManagement, FamilyGroup } from "./quote/useGroupManagement";
import { useQuoteActions } from "./quote/useQuoteActions";
import { useChildEffects } from "./quote/useChildEffects";
import { useState, useEffect } from "react";

console.log("🔍 Loading useQuoteForm hook");

export function useQuoteForm() {
  console.log("⚙️ Initializing useQuoteForm");
  
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
  
  console.log("📝 Form initialized with default values");

  // Initialize child hooks with proper error handling
  try {
    console.log("🧒 Initializing child management hook");
    const { 
      childrenArray, 
      setChildrenArray,
      incrementAdults, 
      decrementAdults, 
      incrementChildren, 
      decrementChildren,
      updateChildDetails 
    } = useChildrenManagement(form);
    
    console.log("🪜 Initializing step management hook");
    const { step, totalSteps, nextStep, prevStep } = useStepManagement(form);
    
    console.log("🏠 Initializing apartment selection hook");
    const { 
      apartmentDialog, 
      openApartmentDialog, 
      closeApartmentDialog, 
      selectApartment 
    } = useApartmentSelection(form);
    
    console.log("👪 Initializing group management hook");
    const { 
      groupDialog, 
      familyGroups, 
      openGroupDialog, 
      closeGroupDialog, 
      setFamilyGroups 
    } = useGroupManagement(form, setChildrenArray);
    
    console.log("🎬 Initializing quote actions hook");
    const { 
      sendWhatsApp, 
      onSubmitHandler, 
      handleSubmitWrapper
    } = useQuoteActions(form);
    
    // Setup effect hooks
    console.log("🔄 Setting up child effects");
    useChildEffects(form, childrenArray, setChildrenArray);
    
    console.log("✅ useQuoteForm hook initialized successfully");
    
    // Add an effect to log when the hook is used
    useEffect(() => {
      console.log("🚀 useQuoteForm hook mounted");
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
  } catch (error) {
    console.error("❌ Error in useQuoteForm hook:", error);
    throw error; // Re-throw to let the component handle it
  }
}
