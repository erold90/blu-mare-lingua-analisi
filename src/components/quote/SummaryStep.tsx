
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
  
  // Helper to check if we're in high season
  const isHighSeason = formValues.checkIn ? 
    (formValues.checkIn.getMonth() >= 5 && formValues.checkIn.getMonth() <= 8) : false;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Riepilogo prenotazione</CardTitle>
        <CardDescription>Verifica i dettagli del tuo preventivo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Date del soggiorno</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground">Check-in:</p>
                  <p className="font-medium">
                    {formValues.checkIn ? format(formValues.checkIn, 'dd/MM/yyyy', { locale: it }) : ''}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Check-out:</p>
                  <p className="font-medium">
                    {formValues.checkOut ? format(formValues.checkOut, 'dd/MM/yyyy', { locale: it }) : ''}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Durata:</p>
                  <p className="font-medium">{priceInfo.nights} notti</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Periodo:</p>
                  <p className="font-medium text-orange-500">{isHighSeason ? 'Alta stagione' : 'Bassa stagione'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Ospiti</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground">Adulti:</p>
                  <p className="font-medium">{formValues.adults}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Bambini:</p>
                  <p className="font-medium">{formValues.children || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Totale ospiti:</p>
                  <p className="font-medium">{(formValues.adults || 0) + (formValues.children || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Appartamenti</h3>
              {selectedApartments.map((apartment, index) => {
                const apartmentPrice = priceInfo.apartmentPrices?.[apartment.id] || 0;
                const isLastApartment = index === selectedApartments.length - 1;
                
                return (
                  <div key={apartment.id} className={`${!isLastApartment ? 'mb-4 pb-4 border-b' : ''}`}>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">{apartment.name}</h4>
                      <p className="font-medium">{apartmentPrice}€</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-muted-foreground">Capacità:</span>
                      <span>{apartment.capacity} persone</span>
                      
                      <span className="text-muted-foreground">Posti letto:</span>
                      <span>{apartment.beds}</span>
                      
                      <span className="text-muted-foreground">Piano:</span>
                      <span>{apartment.floor}</span>
                      
                      {formValues.hasPets && (
                        <>
                          <span className="text-muted-foreground">Animali:</span>
                          <span>Sì</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Riepilogo costi</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {isHighSeason ? 'Costo appartamenti (settimanale):' : `Costo appartamenti (${priceInfo.nights} notti):`}
                  </span>
                  <span className="font-medium">{priceInfo.basePrice}€</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pulizia finale:</span>
                  <span className="flex items-center">
                    <span className="font-medium mr-2">{priceInfo.cleaningFee}€</span>
                    <span className="text-green-500 text-sm">(inclusa)</span>
                  </span>
                </div>
                
                {priceInfo.extras > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Servizi extra:</span>
                    <span className="font-medium">{priceInfo.extras}€</span>
                  </div>
                )}
                
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-muted-foreground">Subtotale:</span>
                  <span className="font-medium">{priceInfo.subtotal}€</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tassa di soggiorno:</span>
                  <span className="font-medium">{priceInfo.touristTax}€</span>
                </div>
                
                <div className="flex justify-between border-t pt-2 mt-2 font-medium">
                  <span>Totale con sconto applicato:</span>
                  <span className="text-primary">{priceInfo.totalAfterDiscount}€</span>
                </div>
                
                {priceInfo.discount > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>Risparmio (sconto):</span>
                    <span>{priceInfo.discount}€</span>
                  </div>
                )}
                
                <div className="flex justify-between border-t pt-2 mt-2 font-bold text-lg">
                  <span>Totale da pagare:</span>
                  <span>{priceInfo.totalAfterDiscount}€</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Caparra (30%):</span>
                  <span className="font-medium">{priceInfo.deposit}€</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cauzione (restituibile):</span>
                  <span className="font-medium">200€</span>
                </div>
              </div>
            </CardContent>
          </Card>
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
