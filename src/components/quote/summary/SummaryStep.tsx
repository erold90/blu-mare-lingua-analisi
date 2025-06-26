
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Apartment } from "@/data/apartments";
import { FormValues } from "@/utils/quoteFormSchema";
import { calculateTotalPrice } from "@/utils/price/priceCalculator";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MessageCircle } from "lucide-react";

// Import components
import StaySummary from "../StaySummary";
import GuestInfo from "./GuestInfo";
import PriceSummary from "./PriceSummary";

interface SummaryStepProps {
  form: UseFormReturn<FormValues>;
  apartments: Apartment[];
  prevStep: () => void;
  sendWhatsApp: () => void;
}

const SummaryStep: React.FC<SummaryStepProps> = ({
  form,
  apartments,
  prevStep,
  sendWhatsApp
}) => {
  const formValues = form.getValues();
  
  console.log("🔍 SummaryStep: Form values for summary", formValues);
  console.log("🔍 SummaryStep: Children details", formValues.childrenDetails);
  
  // Calculate price info
  const priceInfo = calculateTotalPrice(formValues, apartments);
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Riepilogo Prenotazione</h2>
        <p className="text-muted-foreground">
          Controlla tutti i dettagli prima di inviare la richiesta
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Colonna sinistra - Dettagli soggiorno */}
        <div className="space-y-6">
          <StaySummary formValues={formValues} apartments={apartments} />
          <GuestInfo formValues={formValues} />
        </div>

        {/* Colonna destra - Riepilogo prezzi */}
        <div className="space-y-6">
          <PriceSummary priceInfo={priceInfo} formValues={formValues} />
        </div>
      </div>

      <Separator />

      {/* Sezione note se presenti */}
      {formValues.notes && formValues.notes.trim() && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium mb-2">Note aggiuntive:</h4>
          <p className="text-sm text-muted-foreground">{formValues.notes}</p>
        </div>
      )}

      {/* Pulsanti azione */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna indietro
        </Button>
        
        <Button
          type="button"
          onClick={sendWhatsApp}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
        >
          <MessageCircle className="h-4 w-4" />
          Invia richiesta WhatsApp
        </Button>
      </div>
      
      <div className="text-center text-sm text-muted-foreground">
        <p>
          Cliccando "Invia richiesta WhatsApp" si aprirà WhatsApp con il messaggio già preparato.
          <br />
          Non sarai impegnato ad alcuna prenotazione fino alla conferma scritta.
        </p>
      </div>
    </div>
  );
};

export default SummaryStep;
