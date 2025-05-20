
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Apartment } from "@/data/apartments";
import { FormValues } from "@/utils/quoteFormSchema";

interface ApartmentSelectionStepProps {
  form: UseFormReturn<FormValues>;
  apartments: Apartment[];
  openApartmentDialog: (id: string) => void;
  prevStep: () => void;
  nextStep: () => void;
}

const ApartmentSelectionStep: React.FC<ApartmentSelectionStepProps> = ({
  form,
  apartments,
  openApartmentDialog,
  prevStep,
  nextStep
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appartamenti disponibili</CardTitle>
        <CardDescription>Seleziona l'appartamento che preferisci per il tuo soggiorno</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Elenco degli appartamenti */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {apartments.map((apartment) => (
            <div 
              key={apartment.id} 
              className={cn(
                "border rounded-lg p-4 cursor-pointer transition-all hover:border-primary", 
                form.getValues("selectedApartment") === apartment.id && "border-primary border-2"
              )}
              onClick={() => form.setValue("selectedApartment", apartment.id)}
            >
              <div className="aspect-video bg-muted rounded-md mb-3 relative overflow-hidden">
                <img 
                  src={apartment.images[0]} 
                  alt={apartment.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold">{apartment.name}</h3>
                  <span className="font-semibold text-primary">{apartment.price}€/notte</span>
                </div>
                <p className="text-muted-foreground text-sm">{apartment.description}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-muted px-2 py-1 rounded">{apartment.capacity} persone</span>
                  <span className="text-xs bg-muted px-2 py-1 rounded">Piano {apartment.floor}</span>
                  <span className="text-xs bg-muted px-2 py-1 rounded">Vista {apartment.view}</span>
                  <span className="text-xs bg-muted px-2 py-1 rounded">{apartment.size} m²</span>
                </div>
                <Button 
                  type="button" 
                  variant="link" 
                  className="text-primary p-0 h-auto" 
                  onClick={(e) => {
                    e.stopPropagation();
                    openApartmentDialog(apartment.id);
                  }}
                >
                  Dettagli
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Avviso di errore se nessun appartamento è selezionato */}
        {form.formState.errors.selectedApartment && (
          <p className="text-destructive text-sm">
            {form.formState.errors.selectedApartment.message}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button type="button" variant="outline" onClick={prevStep}>Indietro</Button>
        <Button type="button" onClick={nextStep}>Avanti</Button>
      </CardFooter>
    </Card>
  );
};

export default ApartmentSelectionStep;
