
import React, { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Apartment } from "@/data/apartments";
import { FormValues } from "@/utils/quoteFormSchema";
import { calculateTotalPrice } from "@/utils/price/priceCalculator";
import { v4 as uuidv4 } from "uuid";
import { useActivityLog } from "@/hooks/useActivityLog";
import { format } from "date-fns";
import { it } from "date-fns/locale";

// Componenti separati per ogni sezione
import DateDurationInfo from "./summary/DateDurationInfo";
import GuestInfo from "./summary/GuestInfo";
import PriceSummary from "./summary/PriceSummary";
import ApartmentList from "./summary/ApartmentList";

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
  }, [addQuoteLog, formValues]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Riepilogo prenotazione</CardTitle>
        <CardDescription>Verifica i dettagli del tuo preventivo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Sezione sinistra: Informazioni soggiorno */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Date del soggiorno</h3>
                <DateDurationInfo 
                  checkIn={formValues.checkIn}
                  checkOut={formValues.checkOut}
                  nights={priceInfo.nights}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Ospiti</h3>
                <GuestInfo formValues={formValues} />
              </CardContent>
            </Card>
          </div>
          
          {/* Sezione destra: Appartamenti e prezzi */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Appartamenti</h3>
                <ApartmentList
                  apartments={apartments}
                  selectedApartments={selectedApartments}
                  formValues={formValues}
                  priceInfo={priceInfo}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <PriceSummary 
                  priceInfo={priceInfo}
                  formValues={formValues}
                />
              </CardContent>
            </Card>
          </div>
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
