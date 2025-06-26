
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormValues, formSchema } from "@/utils/quoteFormSchema";
import { apartments } from "@/data/apartments";
import { useAnalyticsCore } from "@/hooks/analytics/useAnalyticsCore";
import { createWhatsAppMessage } from "@/utils/price/whatsAppMessage";
import { v4 as uuidv4 } from 'uuid';
import { useState, useCallback } from "react";

// Define ChildDetail interface to match component expectations
interface ChildDetail {
  isUnder12: boolean;
  sleepsWithParents: boolean;
  sleepsInCrib: boolean;
}

export function useQuoteForm() {
  const analytics = useAnalyticsCore();
  
  const [step, setStep] = useState(1);
  const [apartmentDialog, setApartmentDialog] = useState<string | null>(null);
  const [groupDialog, setGroupDialog] = useState(false);
  const [familyGroups, setFamilyGroups] = useState<number>(1);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      adults: 1,
      children: 0,
      groupType: undefined, // Don't set a default value for groupType
      apartments: [],
      services: [],
      childrenArray: [], // Initialize as empty array
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
      },
      notes: '',
    },
    mode: "onChange"
  });

  const childrenArray = form.watch('childrenArray') || [];

  const totalSteps = 5;

  const incrementAdults = () => {
    form.setValue('adults', form.getValues().adults + 1);
  };

  const decrementAdults = () => {
    const currentAdults = form.getValues().adults;
    if (currentAdults > 1) {
      form.setValue('adults', currentAdults - 1);
    }
  };

  const incrementChildren = () => {
    const currentChildren = form.getValues().children || 0;
    form.setValue('children', currentChildren + 1);
    
    // Initialize the childrenArray if it's undefined
    const currentChildrenArray = form.getValues().childrenArray || [];
    form.setValue('childrenArray', [...currentChildrenArray, { isUnder12: false, sleepsWithParents: false, sleepsInCrib: false }]);
  };

  const decrementChildren = () => {
    const currentChildren = form.getValues().children || 0;
    if (currentChildren > 0) {
      form.setValue('children', currentChildren - 1);

      // Remove the last element from childrenArray
      const currentChildrenArray = form.getValues().childrenArray || [];
      form.setValue('childrenArray', currentChildrenArray.slice(0, -1));
    }
  };

  const updateChildDetails = (index: number, details: Partial<ChildDetail>) => {
    const currentChildrenArray = form.getValues().childrenArray || [];
    const updatedChildrenArray = [...currentChildrenArray];
    updatedChildrenArray[index] = { ...updatedChildrenArray[index], ...details };
    form.setValue('childrenArray', updatedChildrenArray);
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      analytics.trackSiteVisit(`/quote/step-${step + 1}`);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const openApartmentDialog = (apartmentId: string) => {
    setApartmentDialog(apartmentId);
  };

  const closeApartmentDialog = () => {
    setApartmentDialog(null);
  };

  const selectApartment = (apartmentId: string) => {
    const selectedApartments = form.getValues('selectedApartments') || [];
    if (selectedApartments.includes(apartmentId)) {
      form.setValue(
        'selectedApartments',
        selectedApartments.filter((id) => id !== apartmentId)
      );
    } else {
      form.setValue('selectedApartments', [...selectedApartments, apartmentId]);
    }
  };

  const openGroupDialog = () => {
    setGroupDialog(true);
  };

  const closeGroupDialog = () => {
    setGroupDialog(false);
  };
  
  const sendWhatsApp = useCallback(() => {
    const formValues = form.getValues();
    console.log("🔍 Sending WhatsApp message with form values:", formValues);
    
    // Create WhatsApp message using the updated function
    const message = createWhatsAppMessage(formValues, apartments);
    
    if (!message) {
      console.error("❌ Could not create WhatsApp message");
      alert("Errore nella creazione del messaggio WhatsApp. Verifica che tutti i campi siano compilati.");
      return;
    }
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/393937767749?text=${encodedMessage}`;
    
    console.log("✅ Opening WhatsApp with message length:", message.length);
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Track WhatsApp action
    analytics.trackSiteVisit('/quote/whatsapp-sent');
  }, [form, analytics]);

  const onSubmitHandler = async (data: FormValues) => {
    try {
      const quoteId = uuidv4();
      
      // Save quote log using analytics core
      await analytics.saveQuoteLog({
        id: quoteId,
        form_data: data,
        step: step,
        completed: true,
      });
      
      // Track completion
      analytics.trackSiteVisit('/quote/completed');
      
      console.log("Quote submitted successfully:", quoteId);
    } catch (error) {
      console.error("Error submitting quote:", error);
    }
  };

  return {
    form,
    step,
    totalSteps,
    childrenArray: form.watch('childrenArray') || [],
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
    onSubmitHandler
  };
}
