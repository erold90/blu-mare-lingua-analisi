
import React, { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Apartment } from "@/data/apartments";
import { FormValues } from "@/utils/quoteFormSchema";
import { calculateTotalPrice } from "@/utils/price/priceCalculator";
import { refreshPricesCache } from "@/utils/price/weeklyPrice";
import { v4 as uuidv4 } from "uuid";
import { useActivityLog } from "@/hooks/useActivityLog";

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
  
  // Refresh prices cache when component mounts to ensure we have latest prices
  useEffect(() => {
    refreshPricesCache().then(() => {
      console.log("Prices cache refreshed for quote calculation");
    }).catch(err => {
      console.error("Error refreshing prices cache:", err);
    });
  }, []);
  
  // Calculate prices after cache refresh
  const priceInfo = calculateTotalPrice(formValues, apartments);
  
  // If only one apartment is selected, make sure it's the main selectedApartment
  useEffect(() => {
    if (selectedApartmentIds.length === 1 && formValues.selectedApartment !== selectedApartmentIds[0]) {
      form.setValue("selectedApartment", selectedApartmentIds[0]);
    }
  }, [selectedApartmentIds, form, formValues.selectedApartment]);
  
  // Log the quote when this component mounts
  useEffect(() => {
    const quoteLogId = localStorage.getItem('currentQuoteLogId') || uuidv4();
    
    // Save the quote log
    addQuoteLog({
      id: quoteLogId,
      timestamp: new Date().toISOString(),
      formValues: formValues,
      step: 5, // We're on step 5
      completed: true // Now marking as completed since this is the final step
    });
    
    // Save the ID for later use
    localStorage.setItem('currentQuoteLogId', quoteLogId);
  }, [addQuoteLog, formValues]);
  
  // Render the footer actions separately for the SummaryLayout
  const footerActions = (
    <QuoteActions 
      prevStep={prevStep} 
      sendWhatsApp={sendWhatsApp}
      formValues={formValues}
      apartments={apartments}
      priceInfo={priceInfo}
    />
  );
  
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
