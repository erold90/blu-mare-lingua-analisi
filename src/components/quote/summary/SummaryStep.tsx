
import React, { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Apartment } from "@/data/apartments";
import { FormValues } from "@/utils/quoteFormSchema";
import { calculateTotalPriceUnified } from "@/utils/price/unifiedPriceCalculator";
import { PriceCalculation, emptyPriceCalculation } from "@/utils/price/types";
import { v4 as uuidv4 } from "uuid";
import { useActivityLog } from "@/hooks/activity/useActivityLog";

// Import refactored components
import SummaryLayout from "./SummaryLayout";
import SummaryContent from "./SummaryContent";
import QuoteActions from "./QuoteActions";

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
  const selectedApartmentIds = formValues.selectedApartments || [formValues.selectedApartment];
  const selectedApartments = apartments.filter(apt => selectedApartmentIds.includes(apt.id));
  const { addQuoteLog } = useActivityLog();
  
  const [priceInfo, setPriceInfo] = useState<PriceCalculation>(emptyPriceCalculation);
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);
  
  // Calcola i prezzi usando il sistema unificato
  useEffect(() => {
    const calculatePrices = async () => {
      setIsLoadingPrices(true);
      try {
        console.log("Calculating prices with unified system...");
        const calculatedPrices = await calculateTotalPriceUnified(formValues, apartments);
        setPriceInfo(calculatedPrices);
      } catch (error) {
        console.error("Error calculating prices:", error);
        setPriceInfo(emptyPriceCalculation);
      } finally {
        setIsLoadingPrices(false);
      }
    };

    calculatePrices();
  }, [formValues, apartments]);
  
  // Se c'è solo un appartamento selezionato, assicurati che sia il selectedApartment principale
  useEffect(() => {
    if (selectedApartmentIds.length === 1 && formValues.selectedApartment !== selectedApartmentIds[0]) {
      form.setValue("selectedApartment", selectedApartmentIds[0]);
    }
  }, [selectedApartmentIds, form, formValues.selectedApartment]);
  
  // Log del preventivo quando il componente si monta
  useEffect(() => {
    const quoteLogId = localStorage.getItem('currentQuoteLogId') || uuidv4();
    
    addQuoteLog({
      id: quoteLogId,
      timestamp: new Date().toISOString(),
      form_values: formValues,
      step: 5,
      completed: true
    });
    
    localStorage.setItem('currentQuoteLogId', quoteLogId);
  }, [addQuoteLog, formValues]);
  
  // Render delle azioni footer
  const footerActions = (
    <QuoteActions 
      prevStep={prevStep} 
      sendWhatsApp={sendWhatsApp}
      formValues={formValues}
      apartments={apartments}
      priceInfo={priceInfo}
    />
  );
  
  if (isLoadingPrices) {
    return (
      <SummaryLayout footer={footerActions}>
        <div className="text-center py-8">
          <div className="text-lg">Calcolo prezzi in corso...</div>
        </div>
      </SummaryLayout>
    );
  }
  
  return (
    <SummaryLayout footer={footerActions}>
      <SummaryContent
        formValues={formValues}
        priceInfo={priceInfo}
        selectedApartments={selectedApartments}
        apartments={apartments}
        form={form}
      />
    </SummaryLayout>
  );
};

export default SummaryStep;
