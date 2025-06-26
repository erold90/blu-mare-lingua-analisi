
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Apartment } from "@/data/apartments";
import { FormValues } from "@/utils/quoteFormSchema";
import { calculateTotalPrice } from "@/utils/price/priceCalculator";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MessageCircle, Calendar, Users, Home, CreditCard } from "lucide-react";
import { toDateSafe } from "@/utils/price/dateConverter";
import { format } from "date-fns";
import { it } from 'date-fns/locale';

// Import new components
import SummaryContent from "./SummaryContent";

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
  console.log("🔍 SummaryStep: Children count", formValues.children);
  console.log("🔍 SummaryStep: Children details array", formValues.childrenDetails);
  
  // Calculate price info
  const priceInfo = calculateTotalPrice(formValues, apartments);
  
  // Get selected apartments
  const selectedApartmentIds = formValues.selectedApartments || 
    (formValues.selectedApartment ? [formValues.selectedApartment] : []);
  const selectedApartments = apartments.filter(apt => selectedApartmentIds.includes(apt.id));
  
  // Check if all required data is present
  const hasValidData = formValues.checkIn && formValues.checkOut && selectedApartments.length > 0;
  
  if (!hasValidData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">Dati insufficienti per il riepilogo</p>
        <Button onClick={prevStep} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna indietro
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
          <CreditCard className="h-5 w-5 text-primary" />
          <span className="text-primary font-medium">Riepilogo Prenotazione</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          Controlla i dettagli della tua prenotazione
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Verifica tutti i dettagli prima di inviare la richiesta di prenotazione. 
          Non sarai impegnato fino alla conferma scritta.
        </p>
      </div>

      {/* Main Content */}
      <SummaryContent
        formValues={formValues}
        priceInfo={priceInfo}
        selectedApartments={selectedApartments}
        apartments={apartments}
        form={form}
      />

      {/* Notes Section */}
      {formValues.notes && formValues.notes.trim() && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Note aggiuntive
          </h3>
          <p className="text-blue-800 leading-relaxed">{formValues.notes}</p>
        </div>
      )}

      <Separator />

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          className="flex items-center gap-2 px-8 py-3"
          size="lg"
        >
          <ArrowLeft className="h-4 w-4" />
          Modifica dettagli
        </Button>
        
        <Button
          type="button"
          onClick={sendWhatsApp}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-8 py-3"
          size="lg"
        >
          <MessageCircle className="h-4 w-4" />
          Invia richiesta WhatsApp
        </Button>
      </div>
      
      {/* Footer Info */}
      <div className="text-center text-sm text-muted-foreground bg-gray-50 rounded-lg p-4">
        <p className="font-medium mb-1">
          📱 Cliccando "Invia richiesta WhatsApp" si aprirà WhatsApp con il messaggio già preparato
        </p>
        <p>
          ✅ Non sarai impegnato ad alcuna prenotazione fino alla conferma scritta
        </p>
      </div>
    </div>
  );
};

export default SummaryStep;
