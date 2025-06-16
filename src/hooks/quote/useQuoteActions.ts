
import { toast } from "sonner";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/utils/quoteFormSchema";
import { apartments } from "@/data/apartments";
import { createWhatsAppMessage } from "@/utils/price/whatsAppMessage";

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
    sendWhatsApp,
    onSubmitHandler,
    handleSubmitWrapper
  };
}
