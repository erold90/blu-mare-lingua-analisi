
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Apartment } from "@/data/apartments";
import { FormValues } from "@/utils/quoteFormSchema";
import { calculateTotalPrice } from "@/utils/quoteCalculator";
import { Separator } from "@/components/ui/separator";

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
  
  // If only one apartment is selected, make sure it's the main selectedApartment
  React.useEffect(() => {
    if (selectedApartmentIds.length === 1 && formValues.selectedApartment !== selectedApartmentIds[0]) {
      form.setValue("selectedApartment", selectedApartmentIds[0]);
    }
  }, [selectedApartmentIds, form, formValues.selectedApartment]);

  // Helper to get persons per apartment
  const getPersonsInApartment = (apartmentId: string) => {
    if (formValues.personsPerApartment && formValues.personsPerApartment[apartmentId]) {
      return formValues.personsPerApartment[apartmentId];
    }
    return 0;
  };

  // Helper to check if an apartment has pets
  const hasPetsInApartment = (apartmentId: string) => {
    if (formValues.petsInApartment && formValues.petsInApartment[apartmentId]) {
      return true;
    }
    return false;
  };
  
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
            <div className="border rounded-md p-4 space-y-2">
              <h3 className="font-medium">Date del soggiorno</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Check-in:</span>
                <span>{form.getValues("checkIn") ? format(form.getValues("checkIn"), "dd/MM/yyyy") : "-"}</span>
                <span className="text-muted-foreground">Check-out:</span>
                <span>{form.getValues("checkOut") ? format(form.getValues("checkOut"), "dd/MM/yyyy") : "-"}</span>
                <span className="text-muted-foreground">Durata:</span>
                <span>{priceInfo.nights} notti</span>
              </div>
            </div>
            
            {/* Ospiti */}
            <div className="border rounded-md p-4 space-y-2">
              <h3 className="font-medium">Ospiti</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Adulti:</span>
                <span>{form.getValues("adults")}</span>
                <span className="text-muted-foreground">Bambini:</span>
                <span>{form.getValues("children")}</span>
                <span className="text-muted-foreground">Totale ospiti:</span>
                <span>{form.getValues("adults") + form.getValues("children")}</span>
              </div>
            </div>
          </div>
          
          {/* Appartamenti selezionati con costi per appartamento */}
          <div className="border rounded-md p-4 space-y-3">
            <h3 className="font-medium">Appartamenti e costi</h3>
            
            {selectedApartments.length > 0 ? (
              <div className="space-y-4">
                {selectedApartments.map((apartment, index) => {
                  const personsCount = getPersonsInApartment(apartment.id);
                  const hasPets = hasPetsInApartment(apartment.id);
                  const isLastItem = index === selectedApartments.length - 1;
                  
                  // Calcolo del costo base per appartamento
                  const baseApartmentCost = apartment.price * priceInfo.nights;
                  
                  // Costo biancheria
                  const linenCost = formValues.linenOption === "extra" && personsCount > 0 
                    ? personsCount * 15 
                    : 0;
                  
                  // Costo animali
                  const petsCost = hasPets ? 50 : 0;
                  
                  // Totale per appartamento
                  const apartmentTotal = baseApartmentCost + linenCost + petsCost;
                  
                  return (
                    <div key={apartment.id} className={`pb-4 ${!isLastItem ? 'border-b' : ''}`}>
                      <div className="flex flex-col space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="font-semibold text-md">{apartment.name}</h4>
                          <span className="text-primary font-semibold">{baseApartmentCost}€</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <span className="text-muted-foreground">Capacità:</span>
                          <span>{apartment.capacity} persone</span>
                          <span className="text-muted-foreground">Posizione:</span>
                          <span>Piano {apartment.floor}</span>
                          
                          {personsCount > 0 && (
                            <>
                              <span className="text-muted-foreground">Persone:</span>
                              <span>{personsCount}</span>
                            </>
                          )}
                          
                          {hasPets && (
                            <>
                              <span className="text-muted-foreground">Animali:</span>
                              <span>Sì</span>
                            </>
                          )}
                        </div>
                        
                        {/* Costi aggiuntivi per appartamento */}
                        {(linenCost > 0 || petsCost > 0) && (
                          <div className="mt-2 space-y-1">
                            <p className="text-sm font-medium">Costi aggiuntivi:</p>
                            {linenCost > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Biancheria ({personsCount} persone):</span>
                                <span>{linenCost}€</span>
                              </div>
                            )}
                            {petsCost > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Animali domestici:</span>
                                <span>{petsCost}€</span>
                              </div>
                            )}
                            <div className="flex justify-between text-sm font-medium pt-1">
                              <span>Totale appartamento:</span>
                              <span>{apartmentTotal}€</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nessun appartamento selezionato</p>
            )}
          </div>
          
          {/* Riepilogo costi */}
          <div className="border rounded-md p-4 space-y-4">
            <h3 className="font-medium">Riepilogo costi</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Costo appartamenti ({priceInfo.nights} notti):</span>
                <span>{priceInfo.basePrice}€</span>
              </div>
              {priceInfo.extras > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Servizi extra:</span>
                  <span>{priceInfo.extras}€</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotale:</span>
                <span>{priceInfo.totalBeforeDiscount}€</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-sm font-medium">
                <span>Totale con sconto applicato:</span>
                <span className="text-primary">{priceInfo.totalAfterDiscount}€</span>
              </div>
              {priceInfo.savings > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Risparmio:</span>
                  <span>{priceInfo.savings}€</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tassa di soggiorno:</span>
                <span>{priceInfo.touristTax}€</span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-2">
                <span>Totale da pagare:</span>
                <span>{priceInfo.totalAfterDiscount + priceInfo.touristTax}€</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Caparra (30%):</span>
                <span>{priceInfo.deposit}€</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cauzione (restituibile):</span>
                <span>200€</span>
              </div>
            </div>
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
