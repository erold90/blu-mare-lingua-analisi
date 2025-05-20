
import React, { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Apartment } from "@/data/apartments";
import { FormValues } from "@/utils/quoteFormSchema";
import { Bed, BedDouble, MapPin, Sun, ThermometerSun, Users as UsersIcon } from "lucide-react";
import { isApartmentSuitable, getRecommendedApartment, getEffectiveGuestCount } from "@/utils/apartmentRecommendation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const { totalGuests, effectiveGuestCount, sleepingWithParents, sleepingInCribs } = getEffectiveGuestCount(formValues);
  const [selectedBedsCount, setSelectedBedsCount] = useState(0);
  const [hasEnoughBeds, setHasEnoughBeds] = useState(false);
  const isMobile = useIsMobile();
  
  // Initialize selectedApartments in form if not already set
  useEffect(() => {
    if (!form.getValues("selectedApartments") || !Array.isArray(form.getValues("selectedApartments"))) {
      form.setValue("selectedApartments", [], { shouldValidate: true });
    }
  }, [form]);
  
  // Show all apartments regardless of capacity, we'll mark them as suitable or not
  const availableApartments = apartments;
  
  // Calculate total beds in selected apartments
  useEffect(() => {
    const selectedApartmentIds = form.getValues("selectedApartments") || [];
    const selectedApts = apartments.filter(apt => selectedApartmentIds.includes(apt.id));
    const totalBeds = selectedApts.reduce((total, apt) => total + apt.beds, 0);
    
    setSelectedBedsCount(totalBeds);
    setHasEnoughBeds(totalBeds >= effectiveGuestCount);
  }, [form.watch("selectedApartments"), apartments, effectiveGuestCount]);
  
  // Handle apartment selection (toggle selection)
  const toggleApartmentSelection = (apartmentId: string) => {
    // Don't allow selecting if it's booked
    const apartment = apartments.find(apt => apt.id === apartmentId);
    if (apartment?.booked) return;
    
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
  
  // Check if apartment is suitable
  const isSuitable = (apartment: Apartment) => {
    return isApartmentSuitable(apartment, formValues);
  };
  
  // Handle next step with validation
  const handleNextStep = () => {
    if (hasEnoughBeds) {
      nextStep();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appartamenti disponibili</CardTitle>
        <CardDescription>Seleziona l'appartamento o gli appartamenti che preferisci per il tuo soggiorno</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Alert for guest count - Fixed overflow issue */}
        <Alert variant="default" className="bg-blue-50 border-blue-200 mb-4">
          <UsersIcon className="h-4 w-4 text-blue-500 shrink-0" />
          <AlertDescription className="text-blue-700 break-words whitespace-normal">
            {sleepingWithParents > 0 || sleepingInCribs > 0 ? (
              <div className="flex flex-col">
                <span className="w-full break-words">
                  Il tuo gruppo è di {totalGuests} ospiti ({formValues.adults} adulti, {formValues.children} bambini)
                </span>
                {sleepingWithParents > 0 && (
                  <span className="w-full break-words">
                    di cui {sleepingWithParents} {sleepingWithParents === 1 ? 'bambino dorme' : 'bambini dormono'} con i genitori
                  </span>
                )}
                {sleepingInCribs > 0 && (
                  <span className="w-full break-words">
                    {sleepingInCribs} {sleepingInCribs === 1 ? 'bambino dorme' : 'bambini dormono'} in culla
                  </span>
                )}
                <span className="font-medium mt-1 w-full break-words">
                  Posti letto necessari: {effectiveGuestCount}
                </span>
              </div>
            ) : (
              <span className="w-full break-words">
                Il tuo gruppo è di {totalGuests} ospiti ({formValues.adults} adulti, {formValues.children} bambini)
              </span>
            )}
          </AlertDescription>
        </Alert>
        
        {/* Feedback about bed selection - Fixed overflow issue */}
        <div className={cn(
          "p-3 rounded-md transition-colors",
          hasEnoughBeds ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"
        )}>
          <div className="flex items-center flex-wrap">
            <Bed className={cn("h-4 w-4 mr-2 shrink-0", hasEnoughBeds ? "text-green-600" : "text-amber-600")} />
            <p className={cn("text-sm font-medium break-words", hasEnoughBeds ? "text-green-700" : "text-amber-700")}>
              {hasEnoughBeds 
                ? `Hai selezionato appartamenti con ${selectedBedsCount} posti letto (sufficienti).` 
                : `Hai selezionato ${selectedBedsCount} posti letto su ${effectiveGuestCount} necessari. Seleziona altri appartamenti.`}
            </p>
          </div>
        </div>
        
        {availableApartments.length === 0 ? (
          <div className="p-4 border rounded-md bg-muted/50">
            <p className="text-center">
              Non ci sono appartamenti disponibili.
              <br />
              <span className="text-sm text-muted-foreground">
                Prova a modificare le date o il numero di ospiti.
              </span>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {availableApartments.map((apartment) => {
              const isBooked = !!apartment.booked;
              const isSuitableForGroup = isSuitable(apartment);
              
              return (
                <div 
                  key={apartment.id} 
                  className={cn(
                    "border rounded-lg p-3 relative",
                    isApartmentSelected(apartment.id) ? "border-primary border-2" : "",
                    isBooked ? "opacity-60" : "cursor-pointer transition-all hover:border-primary",
                  )}
                >
                  {/* Removed 'Consigliato' badge */}
                  
                  {isBooked && (
                    <Badge variant="destructive" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm z-30">
                      Prenotato
                    </Badge>
                  )}
                  
                  <h3 className="font-medium mt-2 text-sm md:text-base flex flex-nowrap items-center">
                    <span className="mr-1">Appartamento</span>
                    <span>{apartment.name.split(' ')[1]}</span>
                  </h3>
                  
                  {/* Posti letto - con enfasi ridotta */}
                  <div className="mt-2 mb-2 bg-primary/5 p-1 rounded-md">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 text-primary shrink-0 mr-1" />
                      <span className="text-sm text-primary">{apartment.beds} posti letto</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-1 text-xs mt-2">
                    <div className="flex items-center gap-1">
                      <BedDouble className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span>{apartment.bedrooms} {apartment.bedrooms === 1 ? 'camera' : 'camere'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span>Piano {apartment.floor}</span>
                    </div>
                    
                    {/* Sostituito "Vista Mare" con informazioni su terrazza/veranda */}
                    <div className="flex items-center gap-1">
                      <Sun className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span>
                        {apartment.hasVeranda ? 'Ampia Veranda' : apartment.hasTerrace ? 'Terrazza Vista Mare' : ''}
                      </span>
                    </div>
                    
                    {/* Aggiunto stato del climatizzatore */}
                    <div className="flex items-center gap-1">
                      <ThermometerSun className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span>{apartment.hasAirConditioning ? 'Climatizzatore' : 'Non Climatizzato'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <Button 
                      type="button" 
                      variant="link" 
                      className="text-primary p-0 h-auto text-xs z-20" 
                      onClick={(e) => {
                        e.stopPropagation();
                        openApartmentDialog(apartment.id);
                      }}
                    >
                      Dettagli
                    </Button>
                    
                    {!isBooked && (
                      <Checkbox 
                        id={`apartment-checkbox-${apartment.id}`}
                        checked={isApartmentSelected(apartment.id)}
                        onCheckedChange={() => toggleApartmentSelection(apartment.id)}
                        className="cursor-pointer z-20"
                      />
                    )}
                  </div>
                  
                  {/* Overlay for booked apartments to prevent interactions */}
                  {isBooked && (
                    <div className="absolute inset-0 bg-gray-100/40 z-10 rounded-lg" />
                  )}
                  
                  {/* Create a clickable overlay for the entire card */}
                  {!isBooked && (
                    <div 
                      className="absolute inset-0 z-10 cursor-pointer" 
                      onClick={() => toggleApartmentSelection(apartment.id)}
                    />
                  )}
                </div>
              );
            })}
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
          onClick={handleNextStep}
          disabled={availableApartments.length === 0 || (form.getValues("selectedApartments")?.length === 0) || !hasEnoughBeds}
        >
          {!hasEnoughBeds && form.getValues("selectedApartments")?.length > 0 
            ? `Seleziona altri appartamenti (${selectedBedsCount}/${effectiveGuestCount})` 
            : 'Avanti'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ApartmentSelectionStep;
