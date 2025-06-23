
import React, { useEffect, useState, useMemo, useCallback } from "react";
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
  const { addQuoteLog } = useActivityLog();
  
  const [priceInfo, setPriceInfo] = useState<PriceCalculation>(emptyPriceCalculation);
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);
  const [calculationKey, setCalculationKey] = useState(0);
  
  // Memoizza i valori del form per evitare ricreazioni continue
  const formValues = useMemo(() => form.getValues(), [form]);
  
  // Memoizza gli ID degli appartamenti selezionati
  const selectedApartmentIds = useMemo(() => {
    return formValues.selectedApartments || 
      (formValues.selectedApartment ? [formValues.selectedApartment] : []);
  }, [formValues.selectedApartments, formValues.selectedApartment]);
  
  // Memoizza gli appartamenti selezionati
  const selectedApartments = useMemo(() => {
    return apartments.filter(apt => selectedApartmentIds.includes(apt.id));
  }, [apartments, selectedApartmentIds]);
  
  // Funzione per calcolare i prezzi con gestione degli errori
  const calculatePrices = useCallback(async () => {
    if (selectedApartments.length === 0 || !formValues.checkIn || !formValues.checkOut) {
      console.log("Missing required data for price calculation");
      setPriceInfo(emptyPriceCalculation);
      setIsLoadingPrices(false);
      return;
    }
    
    setIsLoadingPrices(true);
    
    try {
      console.log("Starting price calculation...");
      console.log("Form values:", formValues);
      console.log("Selected apartments:", selectedApartments.map(apt => apt.id));
      
      const calculatedPrices = await calculateTotalPriceUnified(formValues, apartments);
      console.log("Price calculation completed:", calculatedPrices);
      
      setPriceInfo(calculatedPrices);
    } catch (error) {
      console.error("Error calculating prices:", error);
      setPriceInfo(emptyPriceCalculation);
    } finally {
      setIsLoadingPrices(false);
    }
  }, [formValues, apartments, selectedApartments]);
  
  // Effect per calcolare i prezzi quando cambiano i dati rilevanti
  useEffect(() => {
    console.log("Price calculation effect triggered");
    calculatePrices();
  }, [calculatePrices]);
  
  // Effect per sincronizzare selectedApartment quando c'è solo un appartamento
  useEffect(() => {
    if (selectedApartmentIds.length === 1 && formValues.selectedApartment !== selectedApartmentIds[0]) {
      console.log("Syncing selectedApartment:", selectedApartmentIds[0]);
      form.setValue("selectedApartment", selectedApartmentIds[0]);
    }
  }, [selectedApartmentIds, form, formValues.selectedApartment]);
  
  // Effect per il log del preventivo (solo una volta)
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
  }, []); // Dipendenze vuote per eseguire solo al mount
  
  // Render delle azioni footer
  const footerActions = useMemo(() => (
    <QuoteActions 
      prevStep={prevStep} 
      sendWhatsApp={sendWhatsApp}
      formValues={formValues}
      apartments={apartments}
      priceInfo={priceInfo}
    />
  ), [prevStep, sendWhatsApp, formValues, apartments, priceInfo]);
  
  if (isLoadingPrices) {
    return (
      <SummaryLayout footer={footerActions}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-lg">Calcolo prezzi in corso...</div>
          <div className="text-sm text-muted-foreground mt-2">
            Attendere prego...
          </div>
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
