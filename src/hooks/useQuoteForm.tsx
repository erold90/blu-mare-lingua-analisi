import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormValues, quoteFormSchema } from "@/utils/quoteFormSchema";
import { apartments } from "@/data/apartments";
import { useAnalyticsCore } from "@/hooks/analytics/useAnalyticsCore";
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
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      adults: 1,
      children: 0,
      groupType: 'individual',
      apartments: [],
      services: [],
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

  const childrenArray = form.watch('childrenArray');

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
    form.setValue('childrenArray', [...currentChildrenArray, {}]);
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
  
  const sendWhatsApp = () => {
    const formValues = form.getValues();
    const selectedApartments = formValues.selectedApartments || [];
    const selectedServices = formValues.services || [];
    
    let message = `Richiesta preventivo da Villa MareBlu:\n\n`;
    
    // Guest Info
    message += `Ospiti: ${formValues.adults} adulti, ${formValues.children} bambini\n`;
    
    // Date Info
    if (formValues.checkIn && formValues.checkOut) {
      message += `Check-in: ${formValues.checkIn}\n`;
      message += `Check-out: ${formValues.checkOut}\n`;
    } else {
      message += `Date da definire\n`;
    }
    
    // Apartments
    if (selectedApartments.length > 0) {
      message += `\nAppartamenti:\n`;
      selectedApartments.forEach(apartmentId => {
        const apartment = apartments.find(apt => apt.id === apartmentId);
        if (apartment) {
          message += `- ${apartment.name}\n`;
        }
      });
    } else {
      message += `\nNessun appartamento selezionato\n`;
    }
    
    // Services
    if (selectedServices.length > 0) {
      message += `\nServizi:\n`;
      selectedServices.forEach(serviceId => {
        // Assuming you have a services array similar to apartments
        // const service = services.find(srv => srv.id === serviceId);
        // if (service) {
        //   message += `- ${service.name}\n`;
        // }
        message += `- ${serviceId}\n`; // Placeholder since we don't have services data
      });
    } else {
      message += `\nNessun servizio selezionato\n`;
    }
    
    // Personal Info
    if (formValues.personalInfo) {
      message += `\nInformazioni personali:\n`;
      message += `Nome: ${formValues.personalInfo.firstName} ${formValues.personalInfo.lastName}\n`;
      message += `Email: ${formValues.personalInfo.email}\n`;
      message += `Telefono: ${formValues.personalInfo.phone}\n`;
    }
    
    // Notes
    if (formValues.notes) {
      message += `\nNote:\n${formValues.notes}\n`;
    }
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/393937767749?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    
    // Track WhatsApp action
    analytics.trackSiteVisit('/quote/whatsapp-sent');
  };

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
    childrenArray: form.watch('childrenArray'),
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
