
import { toast } from "sonner";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/utils/quoteFormSchema";
import { apartments } from "@/data/apartments";
import { createWhatsAppMessage } from "@/utils/price/whatsAppMessage";

// Funzione per tracciare conversioni Google Ads per il preventivo
const trackQuoteConversion = () => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'conversion', {
      'send_to': 'AW-1009072951/QUOTE_CONVERSION_LABEL' // Sostituisci con il label specifico per i preventivi
    });
    console.log('Google Ads conversion tracked: Quote request');
  }
};

export function useQuoteActions(form: UseFormReturn<FormValues>) {
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
    
    // Track the conversion before opening WhatsApp
    trackQuoteConversion();
    
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
      // Track the conversion when the quote form is completed
      trackQuoteConversion();
      toast.success("Preventivo inviato con successo!");
      // In a real implementation, we would send the quote here
    }
  };

  // Wrapper function with no arguments
  const handleSubmitWrapper = () => {
    onSubmitHandler(form.getValues());
  };

  return {
    sendWhatsApp,
    onSubmitHandler,
    handleSubmitWrapper
  };
}
