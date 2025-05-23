
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowRight, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { PriceCalculation } from "@/utils/price/types";
import { useActivityLog } from "@/hooks/useActivityLog";
import { v4 as uuidv4 } from "uuid";
import QuoteSummaryDialog from "./QuoteSummaryDialog";

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
  const [showSummaryDialog, setShowSummaryDialog] = useState(false);
  const { addQuoteLog } = useActivityLog();

  const handleContinueClick = () => {
    // Salva il log del riepilogo per l'area riservata
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

    // Mostra il riepilogo all'utente
    setShowSummaryDialog(true);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 justify-between pt-3 pb-6">
        <Button type="button" variant="outline" onClick={prevStep}>
          Indietro
        </Button>
        
        <div className="flex flex-col md:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            className="w-full md:w-auto"
            onClick={handleContinueClick}
          >
            <FileText className="mr-2 h-4 w-4" />
            Continua
          </Button>
          
          <Button
            type="button"
            className="w-full md:w-auto"
            onClick={sendWhatsApp}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Invia preventivo via WhatsApp
          </Button>
        </div>
      </div>

      {/* Dialog del riepilogo per l'utente */}
      <QuoteSummaryDialog
        open={showSummaryDialog}
        onOpenChange={setShowSummaryDialog}
        formValues={formValues}
        apartments={apartments}
        priceInfo={priceInfo}
      />
    </>
  );
};

export default QuoteActions;
