
import { useState, useCallback } from "react";
import { FormValues } from "@/utils/quoteFormSchema";
import { calculateTotalPrice } from "@/utils/quoteCalculator";
import { apartments } from "@/data/apartments";
import { useAnalytics } from "@/hooks/analytics/useAnalytics";
import { v4 as uuidv4 } from 'uuid';
import { useAdvancedTracking } from '@/hooks/analytics/useAdvancedTracking';
import { UseFormReturn } from "react-hook-form";
import { createWhatsAppMessage } from "@/utils/price/whatsAppMessage";

export function useQuoteActions(form?: UseFormReturn<FormValues>) {
  const [step, setStep] = useState(1);
  const { addQuoteLog } = useAnalytics();
  
  const { trackInteraction } = useAdvancedTracking();

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
      
      // Track form progress
      trackInteraction({
        interaction_type: 'quote_progress',
        additional_data: {
          step: step + 1,
          step_name: getStepName(step + 1),
        }
      });
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!form) {
      console.error("Form not available for submit");
      return;
    }

    try {
      const formValues = form.getValues();
      const quoteId = uuidv4();
      const totalPrice = calculateTotalPrice(formValues, apartments).totalPrice;

      // Save quote log using analytics system
      await addQuoteLog({
        id: quoteId,
        form_values: formValues,
        step: step,
        completed: true,
      });
      
      // Track quote completion
      trackInteraction({
        interaction_type: 'quote_completed',
        additional_data: {
          total_price: calculateTotalPrice(formValues, apartments).totalPrice,
          apartments_count: formValues.selectedApartments?.length || 0,
          adults: formValues.adults,
          children: formValues.children,
        }
      });

      // Reset form
      Object.keys(formValues).forEach(key => {
        form.setValue(key as keyof FormValues, undefined);
      });
      setStep(1);
      
      alert(`Preventivo salvato con successo! ID: ${quoteId} - Totale: ${totalPrice}€`);
    } catch (error) {
      console.error("Errore durante il salvataggio del preventivo:", error);
      alert("Si è verificato un errore durante il salvataggio del preventivo.");
    }
  };

  const sendWhatsApp = useCallback(() => {
    if (!form) {
      console.error("Form not available for WhatsApp");
      return;
    }
    
    const formValues = form.getValues();
    console.log("🔍 Sending WhatsApp message with form values:", formValues);
    
    // Create WhatsApp message
    const message = createWhatsAppMessage(formValues, apartments);
    
    if (!message) {
      console.error("❌ Could not create WhatsApp message");
      alert("Errore nella creazione del messaggio WhatsApp. Verifica che tutti i campi siano compilati.");
      return;
    }
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/393299943297?text=${encodedMessage}`;
    
    console.log("✅ Opening WhatsApp with message length:", message.length);
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Track WhatsApp action
    trackInteraction({
      interaction_type: 'whatsapp_sent',
      additional_data: {
        message_length: message.length,
        apartments_count: formValues.selectedApartments?.length || 0,
      }
    });
  }, [form, trackInteraction]);

  // Simplified submit handler - no wrapper needed
  const onSubmitHandler = useCallback((data: FormValues) => {
    console.log("Form submitted with data:", data);
    handleSubmit();
  }, [handleSubmit]);

  const getStepName = (stepNumber: number) => {
    const stepNames = {
      1: 'guest_info',
      2: 'dates',
      3: 'apartments',
      4: 'services',
      5: 'summary'
    };
    return stepNames[stepNumber as keyof typeof stepNames] || 'unknown';
  };

  return {
    step,
    handleNext,
    handlePrevious,
    handleSubmit,
    sendWhatsApp,
    onSubmitHandler
  };
}
