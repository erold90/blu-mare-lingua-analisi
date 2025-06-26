
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormValues, formSchema } from '@/utils/quoteFormSchema';
import { useAnalytics } from '@/hooks/analytics/useAnalytics';

export const useQuoteForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  
  // Form state
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      step: 1,
      adults: 1,
      children: 0,
      childrenDetails: [],
      isGroupBooking: false,
      needsLinen: false,
      hasPets: false,
      selectedApartments: [],
      personsPerApartment: {},
      petsInApartment: {},
    }
  });

  // Additional state for UI components
  const [childrenArray, setChildrenArray] = useState<Array<{ isUnder12: boolean; sleepsWithParents: boolean; sleepsInCrib: boolean }>>([]);
  const [apartmentDialog, setApartmentDialog] = useState<string | null>(null);
  const [groupDialog, setGroupDialog] = useState(false);
  const [familyGroups, setFamilyGroups] = useState<any[]>([]);

  const { saveQuoteLog } = useAnalytics();

  // Guest management functions
  const incrementAdults = useCallback(() => {
    const currentAdults = form.getValues('adults') || 1;
    form.setValue('adults', currentAdults + 1);
  }, [form]);

  const decrementAdults = useCallback(() => {
    const currentAdults = form.getValues('adults') || 1;
    if (currentAdults > 1) {
      form.setValue('adults', currentAdults - 1);
    }
  }, [form]);

  const incrementChildren = useCallback(() => {
    const currentChildren = form.getValues('children') || 0;
    const newChildren = currentChildren + 1;
    form.setValue('children', newChildren);
    
    // Add child details
    const newChildrenArray = [...childrenArray, { isUnder12: false, sleepsWithParents: false, sleepsInCrib: false }];
    setChildrenArray(newChildrenArray);
    form.setValue('childrenDetails', newChildrenArray);
  }, [form, childrenArray]);

  const decrementChildren = useCallback(() => {
    const currentChildren = form.getValues('children') || 0;
    if (currentChildren > 0) {
      const newChildren = currentChildren - 1;
      form.setValue('children', newChildren);
      
      // Remove child details
      const newChildrenArray = childrenArray.slice(0, -1);
      setChildrenArray(newChildrenArray);
      form.setValue('childrenDetails', newChildrenArray);
    }
  }, [form, childrenArray]);

  const updateChildDetails = useCallback((index: number, details: Partial<{ isUnder12: boolean; sleepsWithParents: boolean; sleepsInCrib: boolean }>) => {
    const newChildrenArray = [...childrenArray];
    newChildrenArray[index] = { ...newChildrenArray[index], ...details };
    setChildrenArray(newChildrenArray);
    form.setValue('childrenDetails', newChildrenArray);
  }, [form, childrenArray]);

  // Dialog management
  const openApartmentDialog = useCallback((apartmentId: string) => {
    setApartmentDialog(apartmentId);
  }, []);

  const closeApartmentDialog = useCallback(() => {
    setApartmentDialog(null);
  }, []);

  const selectApartment = useCallback((apartmentId: string) => {
    const currentSelected = form.getValues('selectedApartments') || [];
    const isSelected = currentSelected.includes(apartmentId);
    
    if (isSelected) {
      form.setValue('selectedApartments', currentSelected.filter(id => id !== apartmentId));
    } else {
      form.setValue('selectedApartments', [...currentSelected, apartmentId]);
    }
  }, [form]);

  const openGroupDialog = useCallback(() => {
    setGroupDialog(true);
  }, []);

  const closeGroupDialog = useCallback(() => {
    setGroupDialog(false);
  }, []);

  // Step management
  const nextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      form.setValue('step', currentStep + 1);
    }
  }, [currentStep, totalSteps, form]);

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      form.setValue('step', currentStep - 1);
    }
  }, [currentStep, form]);

  // WhatsApp function
  const sendWhatsApp = useCallback(() => {
    const formValues = form.getValues();
    console.log("🔍 Sending WhatsApp message with form values:", formValues);
    
    // Here you would create the WhatsApp message
    const message = `Richiesta preventivo Villa MareBlu:\n\nPeriodo: ${formValues.checkIn} - ${formValues.checkOut}\nOspiti: ${formValues.adults} adulti, ${formValues.children || 0} bambini\n\nDettagli inviati automaticamente.`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/393937767749?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  }, [form]);

  // Form submission
  const onSubmitHandler = useCallback(async (data: FormValues) => {
    console.log("Form submitted with data:", data);
    
    try {
      await saveQuoteLog({
        id: `quote_${Date.now()}`,
        form_data: data,
        step: currentStep,
        completed: true,
      });
      
      console.log("✅ Quote saved successfully");
    } catch (error) {
      console.error("❌ Error saving quote:", error);
    }
  }, [saveQuoteLog, currentStep]);

  return {
    // Form object
    form,
    
    // Step management
    step: currentStep,
    totalSteps,
    nextStep,
    prevStep,
    
    // Guest management
    childrenArray,
    incrementAdults,
    decrementAdults,
    incrementChildren,
    decrementChildren,
    updateChildDetails,
    
    // Dialog management
    apartmentDialog,
    openApartmentDialog,
    closeApartmentDialog,
    selectApartment,
    
    // Group management
    groupDialog,
    openGroupDialog,
    closeGroupDialog,
    familyGroups,
    setFamilyGroups,
    
    // Actions
    sendWhatsApp,
    onSubmitHandler,
  };
};
