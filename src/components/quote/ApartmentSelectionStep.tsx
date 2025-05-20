
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Apartment } from "@/data/apartments";
import { FormValues } from "@/utils/quoteFormSchema";
import { Bed, Home, MapPin, Wifi } from "lucide-react";
import { isApartmentSuitable, getRecommendedApartment } from "@/utils/apartmentRecommendation";

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
  const formValues = form.getValues();
  const totalGuests = formValues.adults + formValues.children;
  
  // Filter suitable apartments based on capacity and dates
  const suitableApartments = apartments.filter(apartment => 
    isApartmentSuitable(apartment, formValues)
  );
  
  // Get recommended apartment ID
  const recommendedApartmentId = getRecommendedApartment(suitableApartments, formValues);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appartamenti disponibili</CardTitle>
        <CardDescription>Seleziona l'appartamento che preferisci per il tuo soggiorno</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {suitableApartments.length === 0 ? (
          <div className="p-4 border rounded-md bg-muted/50">
            <p className="text-center">
              Non ci sono appartamenti disponibili per {totalGuests} ospiti nelle date selezionate.
              <br />
              <span className="text-sm text-muted-foreground">
                Prova a modificare le date o il numero di ospiti.
              </span>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suitableApartments.map((apartment) => (
              <div 
                key={apartment.id} 
                className={cn(
                  "border rounded-lg p-3 cursor-pointer transition-all hover:border-primary relative", 
                  form.getValues("selectedApartment") === apartment.id ? "border-primary border-2" : ""
                )}
                onClick={() => form.setValue("selectedApartment", apartment.id)}
              >
                {apartment.id === recommendedApartmentId && (
                  <Badge variant="default" className="absolute top-2 right-2 bg-green-600">
                    Consigliato
                  </Badge>
                )}
                
                <div className="h-32 bg-muted rounded-md mb-3 relative overflow-hidden">
                  <img 
                    src={apartment.images[0]} 
                    alt={apartment.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <h3 className="font-semibold mb-1">{apartment.name}</h3>
                
                <div className="grid grid-cols-2 gap-1 text-xs mb-2">
                  <div className="flex items-center gap-1">
                    <Bed className="h-3 w-3 text-primary" />
                    <span>{apartment.bedrooms} {apartment.bedrooms === 1 ? 'camera' : 'camere'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Home className="h-3 w-3 text-primary" />
                    <span>{apartment.beds} posti letto</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-primary" />
                    <span>Piano {apartment.floor}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Wifi className="h-3 w-3 text-primary" />
                    <span>Vista {apartment.view}</span>
                  </div>
                </div>
                
                <Button 
                  type="button" 
                  variant="link" 
                  className="text-primary p-0 h-auto text-xs" 
                  onClick={(e) => {
                    e.stopPropagation();
                    openApartmentDialog(apartment.id);
                  }}
                >
                  Dettagli
                </Button>
              </div>
            ))}
          </div>
        )}
        
        {/* Avviso di errore se nessun appartamento è selezionato */}
        {form.formState.errors.selectedApartment && (
          <p className="text-destructive text-sm">
            {form.formState.errors.selectedApartment.message}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button type="button" variant="outline" onClick={prevStep}>Indietro</Button>
        <Button 
          type="button" 
          onClick={nextStep} 
          disabled={suitableApartments.length === 0 || !form.getValues("selectedApartment")}
        >
          Avanti
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ApartmentSelectionStep;
