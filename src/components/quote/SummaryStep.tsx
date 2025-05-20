
import React, { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Apartment } from "@/data/apartments";
import { FormValues } from "@/utils/quoteFormSchema";
import { calculateTotalPrice } from "@/utils/quoteCalculator";
import { v4 as uuidv4 } from "uuid";
import { useActivityLog } from "@/hooks/useActivityLog";

// Componenti separati per ogni sezione
import DateDurationInfo from "./summary/DateDurationInfo";
import GuestInfo from "./summary/GuestInfo";
import PriceSummary from "./summary/PriceSummary";

interface SummaryStepProps {
  form: UseFormReturn<FormValues>;
  apartments: Apartment[];
  prevStep: () => void;
  nextStep: () => void;
}

const SummaryStep: React.FC<SummaryStepProps> = ({ form, apartments, prevStep, nextStep }) => {
  const formValues = form.getValues();
  const priceInfo = calculateTotalPrice(formValues, apartments);
  const selectedApartmentIds = formValues.selectedApartments || [formValues.selectedApartment];
  const selectedApartments = apartments.filter(apt => selectedApartmentIds.includes(apt.id));
  const { addQuoteLog } = useActivityLog();
  
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
      completed: false
    });
    
    // Save the ID for later use
    localStorage.setItem('currentQuoteLogId', quoteLogId);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Riepilogo prenotazione</CardTitle>
        <CardDescription>Verifica i dettagli del tuo preventivo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Dettagli della prenotazione */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date e durata */}
            <DateDurationInfo formValues={formValues} priceInfo={priceInfo} />
            
            {/* Ospiti */}
            <GuestInfo formValues={formValues} />
          </div>
          
          {/* Riepilogo costi */}
          <PriceSummary priceInfo={priceInfo} formValues={formValues} />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button type="button" variant="outline" onClick={prevStep}>Indietro</Button>
        <Button type="button" onClick={nextStep}>Avanti</Button>
      </CardFooter>
    </Card>
  );
};

export default SummaryStep;
