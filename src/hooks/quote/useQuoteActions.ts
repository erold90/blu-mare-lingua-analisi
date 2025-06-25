
import { useState, useCallback } from "react";
import { FormValues } from "@/utils/quoteFormSchema";
import { calculateTotalPrice } from "@/utils/quoteCalculator";
import { apartments } from "@/data/apartments";
import { useUnifiedAnalytics } from "@/hooks/analytics/useUnifiedAnalytics";
import { v4 as uuidv4 } from 'uuid';
import { useSimpleTracking } from '@/hooks/analytics/useSimpleTracking';
import { UseFormReturn } from "react-hook-form";
import { createWhatsAppMessage } from "@/utils/price/whatsAppMessage";

export function useQuoteActions(form?: UseFormReturn<FormValues>) {
  const [step, setStep] = useState(1);
  const { addQuoteLog } = useUnifiedAnalytics();
  const { trackSiteVisit } = useSimpleTracking();

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
      
      // Track form progress
      trackSiteVisit(`/quote/step-${step + 1}`);
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

      // Save quote log using unified analytics system
      await addQuoteLog({
        id: quoteId,
        form_values: formValues,
        step: step,
        completed: true,
      });
      
      // Track quote completion
      trackSiteVisit('/quote/completed');

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
    const whatsappUrl = `https://wa.me/393937767749?text=${encodedMessage}`;
    
    console.log("✅ Opening WhatsApp with message length:", message.length);
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Track WhatsApp action
    trackSiteVisit('/quote/whatsapp-sent');
  }, [form, trackSiteVisit]);

  // Simplified submit handler
  const onSubmitHandler = useCallback((data: FormValues) => {
    console.log("Form submitted with data:", data);
    handleSubmit();
  }, [handleSubmit]);

  return {
    step,
    handleNext,
    handlePrevious,
    handleSubmit,
    sendWhatsApp,
    onSubmitHandler
  };
}
