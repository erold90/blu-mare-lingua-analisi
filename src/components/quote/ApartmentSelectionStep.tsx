
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  
  // Initialize selectedApartments in form if not already set
  React.useEffect(() => {
    if (!form.getValues("selectedApartments") || !Array.isArray(form.getValues("selectedApartments"))) {
      form.setValue("selectedApartments", [], { shouldValidate: true });
    }
  }, [form]);
  
  // Filter suitable apartments based on capacity and dates
  const suitableApartments = apartments.filter(apartment => 
    isApartmentSuitable(apartment, formValues)
  );
  
  // Get recommended apartment ID
  const recommendedApartmentId = getRecommendedApartment(suitableApartments, formValues);
  
  // Handle apartment selection (toggle selection)
  const toggleApartmentSelection = (apartmentId: string) => {
    const currentSelected = form.getValues("selectedApartments") || [];
    const isSelected = currentSelected.includes(apartmentId);
    
    let newSelection: string[];
    
    if (isSelected) {
      // Remove from selection
      newSelection = currentSelected.filter(id => id !== apartmentId);
    } else {
      // Add to selection
      newSelection = [...currentSelected, apartmentId];
    }
    
    form.setValue("selectedApartments", newSelection, { shouldValidate: true });
    
    // Also set the main selectedApartment field if this is the first selection or if clearing
    if (newSelection.length === 1) {
      form.setValue("selectedApartment", newSelection[0], { shouldValidate: true });
    } else if (newSelection.length === 0) {
      form.setValue("selectedApartment", "", { shouldValidate: true });
    } else if (newSelection.length > 1) {
      // Make sure selectedApartment has a value when multiple apartments are selected
      form.setValue("selectedApartment", newSelection[0], { shouldValidate: true });
    }
  };
  
  // Check if an apartment is selected
  const isApartmentSelected = (apartmentId: string) => {
    const currentSelected = form.getValues("selectedApartments") || [];
    return currentSelected.includes(apartmentId);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appartamenti disponibili</CardTitle>
        <CardDescription>Seleziona l'appartamento o gli appartamenti che preferisci per il tuo soggiorno</CardDescription>
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {suitableApartments.map((apartment) => (
              <div 
                key={apartment.id} 
                className={cn(
                  "border rounded-lg p-3 cursor-pointer transition-all hover:border-primary relative", 
                  isApartmentSelected(apartment.id) ? "border-primary border-2" : ""
                )}
              >
                {apartment.id === recommendedApartmentId && (
                  <Badge variant="default" className="absolute top-1 left-1 bg-green-600 text-xs">
                    Consigliato
                  </Badge>
                )}
                
                <h3 className="font-medium mt-6 text-sm md:text-base flex flex-nowrap items-center">
                  <span className="mr-1">Appartamento</span>
                  <span>{apartment.name.split(' ')[1]}</span>
                </h3>
                
                <div className="grid grid-cols-1 gap-1 text-xs mt-2">
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
                
                <div className="flex items-center justify-between mt-2">
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
                  
                  <Checkbox 
                    id={`apartment-checkbox-${apartment.id}`}
                    checked={isApartmentSelected(apartment.id)}
                    onCheckedChange={() => toggleApartmentSelection(apartment.id)}
                    className="cursor-pointer"
                  />
                </div>
                
                {/* Create a clickable overlay for the entire card */}
                <div 
                  className="absolute inset-0 z-10 cursor-pointer" 
                  onClick={() => toggleApartmentSelection(apartment.id)}
                />
              </div>
            ))}
          </div>
        )}
        
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
          disabled={suitableApartments.length === 0 || (form.getValues("selectedApartments")?.length === 0)}
        >
          Avanti
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ApartmentSelectionStep;
