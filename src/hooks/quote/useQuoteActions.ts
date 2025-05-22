
import { toast } from "sonner";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/utils/quoteFormSchema";
import { apartments } from "@/data/apartments";
import { downloadPDF } from "@/utils/pdf/pdfGenerator";
import { createWhatsAppMessage } from "@/utils/quoteCalculator";
import { useState } from "react";

export function useQuoteActions(form: UseFormReturn<FormValues>) {
  // Download quote as PDF
  const downloadQuote = () => {
    const formValues = form.getValues();
    
    try {
      // Check required data
      if (!formValues.checkIn || !formValues.checkOut) {
        toast.error("Per favore seleziona le date di arrivo e partenza");
        return;
      }
      
      if (!formValues.selectedApartment && (!formValues.selectedApartments || formValues.selectedApartments.length === 0)) {
        toast.error("Per favore seleziona almeno un appartamento");
        return;
      }
      
      // Pass form values and apartments to downloadPDF
      const filename = downloadPDF(formValues, apartments);
      if (filename) {
        toast.success(`Preventivo scaricato con successo!`);
      }
    } catch (error) {
      console.error("Errore durante la generazione del PDF:", error);
      
      // More descriptive error message
      const errorMessage = error instanceof Error 
        ? `Errore: ${error.message}` 
        : "Si è verificato un errore durante la generazione del PDF";
        
      toast.error(errorMessage);
    }
  };
  
  // Send quote via WhatsApp
  const sendWhatsApp = () => {
    const phoneNumber = "+393937767749"; // Host phone number
    const message = createWhatsAppMessage(form.getValues(), apartments);
    
    if (!message) {
      toast.error("Non è possibile creare il messaggio. Verifica i dati inseriti.");
      return;
    }
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Open WhatsApp with pre-filled message
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank");
    
    toast.success("Apertura di WhatsApp con messaggio precompilato");
  };
  
  // Form submission
  const onSubmitHandler = (data: FormValues) => {
    form.trigger();
    if (data.step < 6) {
      // More steps to complete
      form.setValue("step", data.step + 1);
    } else {
      console.log("Form inviato:", data);
      toast.success("Preventivo inviato con successo!");
      // In a real implementation, we would send the quote here
    }
  };

  // Wrapper function with no arguments
  const handleSubmitWrapper = () => {
    onSubmitHandler(form.getValues());
  };

  return {
    downloadQuote,
    sendWhatsApp,
    onSubmitHandler,
    handleSubmitWrapper
  };
}
