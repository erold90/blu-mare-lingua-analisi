
import React, { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Apartment } from "@/data/apartments";
import { FormValues } from "@/utils/quoteFormSchema";
import { useApartmentAvailability } from "@/hooks/quote/useApartmentAvailability";
import GuestInfoAlert from "./apartmentSelection/GuestInfoAlert";
import ApartmentGrid from "./apartmentSelection/ApartmentGrid";
import BedCapacityTracker from "./apartmentSelection/BedCapacityTracker";

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
  
  // Initialize selectedApartments in form if not already set
  useEffect(() => {
    if (!form.getValues("selectedApartments") || !Array.isArray(form.getValues("selectedApartments"))) {
      form.setValue("selectedApartments", [], { shouldValidate: true });
    }
  }, [form]);
  
  // Get available apartments based on reservations
  const { availableApartments } = useApartmentAvailability(apartments, formValues);
  
  // Get selected apartment IDs
  const selectedApartmentIds = form.getValues("selectedApartments") || [];
  
  // Calculate bed capacity
  const { selectedBedsCount, hasEnoughBeds, requiredBeds } = BedCapacityTracker({ 
    selectedApartmentIds, 
    apartments, 
    formValues 
  });
  
  // Handle apartment selection (toggle selection)
  const toggleApartmentSelection = (apartmentId: string) => {
    // Don't allow selecting if it's booked
    const apartment = availableApartments.find(apt => apt.id === apartmentId);
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
  
  // Handle next step with validation
  const handleNextStep = () => {
    if (hasEnoughBeds) {
      nextStep();
    }
  };

  return (
    <Card className="w-full max-w-full">
      <CardHeader>
        <CardTitle className="text-balance">Appartamenti disponibili</CardTitle>
        <CardDescription className="text-balance">Seleziona l'appartamento o gli appartamenti che preferisci per il tuo soggiorno</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Alert for guest count */}
        <GuestInfoAlert formValues={formValues} />
        
        {/* Apartment grid */}
        <ApartmentGrid
          apartments={availableApartments}
          selectedApartmentIds={selectedApartmentIds}
          toggleApartmentSelection={toggleApartmentSelection}
          openApartmentDialog={openApartmentDialog}
          formValues={formValues}
        />
        
        {form.formState.errors.selectedApartment && (
          <p className="text-destructive text-sm text-balance">
            {form.formState.errors.selectedApartment.message}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button type="button" variant="outline" onClick={prevStep}>Indietro</Button>
        <Button 
          type="button" 
          onClick={handleNextStep}
          disabled={availableApartments.length === 0 || (selectedApartmentIds.length === 0) || !hasEnoughBeds}
          className="text-balance w-auto"
        >
          {!hasEnoughBeds && selectedApartmentIds.length > 0 
            ? `Seleziona altri appartamenti (${selectedBedsCount}/${requiredBeds})` 
            : 'Avanti'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ApartmentSelectionStep;
