
import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormValues, quoteFormSchema } from "@/utils/quoteFormSchema";
import { v4 as uuidv4 } from 'uuid';
import { useUnifiedAnalytics } from "@/hooks/analytics/useUnifiedAnalytics";
import { createWhatsAppMessage } from "@/utils/price/whatsAppMessage";
import { apartments } from "@/data/apartments";

const TOTAL_STEPS = 5;

export function useQuoteForm() {
  console.log("🔍 useQuoteForm: Initializing quote form hook");
  
  const { addQuoteLog } = useUnifiedAnalytics();
  const [step, setStep] = useState(1);
  const [apartmentDialog, setApartmentDialog] = useState<string | null>(null);
  const [groupDialog, setGroupDialog] = useState(false);
  const [familyGroups, setFamilyGroups] = useState<any[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      adults: 2,
      children: 0,
      checkIn: undefined,
      checkOut: undefined,
      selectedApartments: [],
      needsLinen: false,
      hasPets: false,
      groupType: "family",
      notes: "",
      childrenAges: [],
    },
  });

  // Generate a consistent quote ID for this session
  const [quoteId] = useState(() => uuidv4());

  const saveCurrentProgress = useCallback(async (currentStep: number, completed: boolean = false) => {
    try {
      const formValues = form.getValues();
      console.log(`🔍 Saving progress - Step: ${currentStep}, Completed: ${completed}`, formValues);
      
      await addQuoteLog({
        id: quoteId,
        form_values: formValues,
        step: currentStep,
        completed: completed,
      });
      
      console.log('✅ Progress saved successfully');
    } catch (error) {
      console.error('❌ Error saving progress:', error);
    }
  }, [form, addQuoteLog, quoteId]);

  const nextStep = useCallback(async () => {
    console.log(`🔍 useQuoteForm: Moving from step ${step} to ${step + 1}`);
    
    if (step < TOTAL_STEPS) {
      const newStep = step + 1;
      setStep(newStep);
      
      // Save progress automatically when moving to next step
      await saveCurrentProgress(newStep, false);
    }
  }, [step, saveCurrentProgress]);

  const prevStep = useCallback(() => {
    console.log(`🔍 useQuoteForm: Moving from step ${step} to ${step - 1}`);
    if (step > 1) {
      setStep(step - 1);
    }
  }, [step]);

  const sendWhatsApp = useCallback(async () => {
    console.log("🔍 useQuoteForm: Sending WhatsApp message");
    
    const formValues = form.getValues();
    
    // Mark as completed when sending WhatsApp
    await saveCurrentProgress(TOTAL_STEPS, true);
    
    // Create WhatsApp message
    const message = createWhatsAppMessage(formValues, apartments);
    
    if (!message) {
      console.error("❌ Could not create WhatsApp message");
      alert("Errore nella creazione del messaggio WhatsApp. Verifica che tutti i campi siano compilati.");
      return;
    }
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/393937767749?text=${encodedMessage}`;
    
    console.log("✅ Opening WhatsApp with message");
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
  }, [form, saveCurrentProgress]);

  const onSubmitHandler = useCallback(async (data: FormValues) => {
    console.log("🔍 useQuoteForm: Form submitted with data:", data);
    await saveCurrentProgress(TOTAL_STEPS, true);
  }, [saveCurrentProgress]);

  // Guest management functions
  const childrenArray = form.watch("childrenAges") || [];

  const incrementAdults = useCallback(() => {
    const current = form.getValues("adults");
    form.setValue("adults", current + 1);
  }, [form]);

  const decrementAdults = useCallback(() => {
    const current = form.getValues("adults");
    if (current > 1) {
      form.setValue("adults", current - 1);
    }
  }, [form]);

  const incrementChildren = useCallback(() => {
    const current = form.getValues("children");
    const currentAges = form.getValues("childrenAges") || [];
    form.setValue("children", current + 1);
    form.setValue("childrenAges", [...currentAges, { age: 5, sleepingArrangement: "withParents" }]);
  }, [form]);

  const decrementChildren = useCallback(() => {
    const current = form.getValues("children");
    if (current > 0) {
      const currentAges = form.getValues("childrenAges") || [];
      form.setValue("children", current - 1);
      form.setValue("childrenAges", currentAges.slice(0, -1));
    }
  }, [form]);

  const updateChildDetails = useCallback((index: number, field: string, value: any) => {
    const currentAges = form.getValues("childrenAges") || [];
    const updated = [...currentAges];
    updated[index] = { ...updated[index], [field]: value };
    form.setValue("childrenAges", updated);
  }, [form]);

  // Apartment dialog functions
  const openApartmentDialog = useCallback((apartmentId: string) => {
    console.log("🔍 useQuoteForm: Opening apartment dialog for:", apartmentId);
    setApartmentDialog(apartmentId);
  }, []);

  const closeApartmentDialog = useCallback(() => {
    console.log("🔍 useQuoteForm: Closing apartment dialog");
    setApartmentDialog(null);
  }, []);

  const selectApartment = useCallback((apartmentId: string) => {
    console.log("🔍 useQuoteForm: Toggling apartment selection:", apartmentId);
    const current = form.getValues("selectedApartments") || [];
    const isSelected = current.includes(apartmentId);
    
    if (isSelected) {
      form.setValue("selectedApartments", current.filter(id => id !== apartmentId));
    } else {
      form.setValue("selectedApartments", [...current, apartmentId]);
    }
  }, [form]);

  // Group dialog functions
  const openGroupDialog = useCallback(() => {
    console.log("🔍 useQuoteForm: Opening group dialog");
    setGroupDialog(true);
  }, []);

  const closeGroupDialog = useCallback(() => {
    console.log("🔍 useQuoteForm: Closing group dialog");
    setGroupDialog(false);
  }, []);

  return {
    form,
    step,
    totalSteps: TOTAL_STEPS,
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
    onSubmitHandler
  };
}
