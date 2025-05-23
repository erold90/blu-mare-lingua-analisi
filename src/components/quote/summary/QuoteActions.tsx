
import React from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { PriceCalculation } from "@/utils/price/types";
import { useActivityLog } from "@/hooks/useActivityLog";
import { v4 as uuidv4 } from "uuid";

interface QuoteActionsProps {
  prevStep: () => void;
  sendWhatsApp: () => void;
  formValues?: FormValues;
  apartments?: Apartment[];
  priceInfo?: PriceCalculation;
}

const QuoteActions: React.FC<QuoteActionsProps> = ({
  prevStep,
  sendWhatsApp,
  formValues,
  apartments,
  priceInfo
}) => {
  const { addQuoteLog } = useActivityLog();

  const handleWhatsAppClick = () => {
    // Salva il log del riepilogo per l'area riservata prima di inviare WhatsApp
    if (formValues && priceInfo) {
      const logId = uuidv4();
      const timestamp = new Date().toISOString();
      
      addQuoteLog({
        id: logId,
        timestamp,
        formValues,
        step: 5,
        completed: true
      });

      console.log("Riepilogo salvato nel log dell'area riservata:", {
        id: logId,
        timestamp,
        totalPrice: priceInfo.totalAfterDiscount,
        apartments: formValues.selectedApartments?.length || 1
      });
    }

    // Invia via WhatsApp
    sendWhatsApp();
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between pt-3 pb-6">
      <Button type="button" variant="outline" onClick={prevStep}>
        Indietro
      </Button>
      
      <Button
        type="button"
        className="w-full md:w-auto"
        onClick={handleWhatsAppClick}
      >
        <MessageSquare className="mr-2 h-4 w-4" />
        Invia preventivo via WhatsApp
      </Button>
    </div>
  );
};

export default QuoteActions;
