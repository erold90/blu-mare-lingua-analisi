
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Apartment } from "@/data/apartments";
import { FormValues } from "@/utils/quoteFormSchema";
import { calculateTotalPrice } from "@/utils/quoteCalculator";

interface SummaryStepProps {
  form: UseFormReturn<FormValues>;
  apartments: Apartment[];
  prevStep: () => void;
  nextStep: () => void;
}

const SummaryStep: React.FC<SummaryStepProps> = ({ form, apartments, prevStep, nextStep }) => {
  const priceInfo = calculateTotalPrice(form.getValues(), apartments);
  const selectedApartment = apartments.find(apt => apt.id === form.getValues("selectedApartment"));

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
          
          {/* Appartamento selezionato */}
          <div className="border rounded-md p-4 space-y-2">
            <h3 className="font-medium">Appartamento selezionato</h3>
            {selectedApartment && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Nome:</span>
                <span>{selectedApartment.name}</span>
                <span className="text-muted-foreground">Capacità:</span>
                <span>{selectedApartment.capacity} persone</span>
                <span className="text-muted-foreground">Posizione:</span>
                <span>Piano {selectedApartment.floor}</span>
                <span className="text-muted-foreground">Vista:</span>
                <span>Vista {selectedApartment.view}</span>
              </div>
            )}
          </div>
          
          {/* Servizi extra */}
          <div className="border rounded-md p-4 space-y-2">
            <h3 className="font-medium">Servizi extra</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Biancheria:</span>
              <span>
                {form.getValues("linenOption") === "standard" && "Standard (incluso)"}
                {form.getValues("linenOption") === "extra" && "Extra (+30€)"}
                {form.getValues("linenOption") === "deluxe" && "Deluxe (+60€)"}
              </span>
              <span className="text-muted-foreground">Animali:</span>
              <span>
                {form.getValues("hasPets") 
                  ? `${form.getValues("petsCount")} ${form.getValues("petsCount") === 1 ? "animale" : "animali"} di taglia ${
                      form.getValues("petSize") === "small" ? "piccola" : 
                      form.getValues("petSize") === "medium" ? "media" : "grande"
                    }`
                  : "No"
                }
              </span>
            </div>
          </div>
          
          {/* Riepilogo costi */}
          <div className="border rounded-md p-4 space-y-4">
            <h3 className="font-medium">Riepilogo costi</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Costo appartamento ({priceInfo.nights} notti):</span>
                <span>{priceInfo.basePrice}€</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Servizi extra:</span>
                <span>{priceInfo.extras}€</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotale:</span>
                <span>{priceInfo.totalBeforeDiscount}€</span>
              </div>
              <div className="flex justify-between text-sm font-medium border-t pt-2">
                <span>Totale con sconto applicato:</span>
                <span className="text-primary">{priceInfo.totalAfterDiscount}€</span>
              </div>
              <div className="flex justify-between text-sm text-green-600">
                <span>Risparmio:</span>
                <span>{priceInfo.savings}€</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2">
                <span className="text-muted-foreground">Tassa di soggiorno:</span>
                <span>{priceInfo.touristTax}€</span>
              </div>
              <div className="flex justify-between font-semibold text-base border-t pt-2">
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
