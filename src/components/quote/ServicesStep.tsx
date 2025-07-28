
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { Separator } from "@/components/ui/separator";
import LinenService from "./servicesStep/LinenService";
import PetsService from "./servicesStep/PetsService";
import { useServicesState, calculateGuestCounts } from "./servicesStep/useServicesState";

interface ServicesStepProps {
  form: UseFormReturn<FormValues>;
  prevStep: () => void;
  nextStep: () => void;
  apartments: Apartment[];
}

const ServicesStep: React.FC<ServicesStepProps> = ({ form, prevStep, nextStep, apartments }) => {
  console.log("🔍 ServicesStep: Starting render");
  console.log("🔍 ServicesStep: Props received:", { 
    formValues: form?.getValues(), 
    apartmentsCount: apartments?.length 
  });
  
  try {
    // Defensive checks for required data
    if (!form) {
      console.error("❌ ServicesStep: Form is undefined");
      throw new Error("Form non disponibile");
    }
    
    if (!apartments || !Array.isArray(apartments)) {
      console.error("❌ ServicesStep: Apartments is invalid:", apartments);
      throw new Error("Dati appartamenti non disponibili");
    }
    
    // Get form values safely
    const formValues = form.getValues();
    console.log("🔍 ServicesStep: Form values:", formValues);
    
    // Get selected apartments safely
    const selectedApartmentIds = formValues?.selectedApartments || [];
    console.log("🔍 ServicesStep: Selected apartment IDs:", selectedApartmentIds);
    
    if (!Array.isArray(selectedApartmentIds)) {
      console.error("❌ ServicesStep: selectedApartmentIds is not an array:", selectedApartmentIds);
      throw new Error("Selezione appartamenti non valida");
    }
    
    const selectedApartments = apartments.filter(apt => 
      apt && apt.id && selectedApartmentIds.includes(apt.id)
    );
    console.log("🔍 ServicesStep: Selected apartments:", selectedApartments);
    
    // Calculate guest counts safely
    let totalPeopleForLinen = 0;
    try {
      const guestCounts = calculateGuestCounts(formValues);
      totalPeopleForLinen = guestCounts?.totalPeopleForLinen || 0;
      console.log("🔍 ServicesStep: Guest counts calculated:", guestCounts);
    } catch (error) {
      console.error("❌ ServicesStep: Error calculating guest counts:", error);
      // Use fallback values
      totalPeopleForLinen = (formValues?.adults || 0) + (formValues?.children || 0);
    }
    
    // Initialize services state safely
    let servicesState;
    try {
      servicesState = useServicesState(form, selectedApartmentIds, apartments);
      console.log("🔍 ServicesStep: Services state initialized:", servicesState);
    } catch (error) {
      console.error("❌ ServicesStep: Error initializing services state:", error);
      throw new Error("Errore nell'inizializzazione dei servizi");
    }
    
    const {
      personsPerApartment,
      petsInApartment,
      totalAssignedPersons,
      updatePersonsPerApartment,
      togglePetInApartment,
      hasReachedApartmentCapacity
    } = servicesState;
    
    const multipleApartments = selectedApartments.length > 1;
    
    console.log("🔍 ServicesStep: Rendering components with data:", {
      totalPeopleForLinen,
      multipleApartments,
      totalAssignedPersons
    });

    return (
      <div className="max-w-3xl mx-auto">
        <div className="border-b border-border/50 pb-6 mb-8">
          <h2 className="text-2xl font-light mb-2">Servizi aggiuntivi</h2>
          <p className="text-muted-foreground font-light">Personalizza il tuo soggiorno</p>
        </div>
        
        <div className="space-y-8">
          {/* Opzioni biancheria */}
          <LinenService 
            form={form}
            selectedApartments={selectedApartments}
            totalPeopleForLinen={totalPeopleForLinen}
            personsPerApartment={personsPerApartment || {}}
            totalAssignedPersons={totalAssignedPersons || 0}
            updatePersonsPerApartment={updatePersonsPerApartment}
            hasReachedApartmentCapacity={hasReachedApartmentCapacity}
          />
          
          <div className="border-t border-border/50 pt-8">
            {/* Animali domestici */}
            <PetsService 
              form={form}
              selectedApartments={selectedApartments}
              petsInApartment={petsInApartment || {}}
              togglePetInApartment={togglePetInApartment}
            />
          </div>
        </div>
        
        <div className="flex justify-between pt-8 border-t border-border/50 mt-8">
          <Button type="button" variant="ghost" onClick={prevStep} className="px-8">Indietro</Button>
          <Button 
            type="button" 
            onClick={nextStep}
            disabled={
              form.watch("needsLinen") && 
              multipleApartments && 
              (totalAssignedPersons || 0) !== totalPeopleForLinen
            }
            className="px-8"
          >
            Continua
          </Button>
        </div>
      </div>
    );
  } catch (error) {
    console.error("❌ ServicesStep: Critical error:", error);
    return (
      <div className="max-w-2xl mx-auto border border-border/50 p-8 text-center">
        <h2 className="text-xl font-medium text-destructive mb-4">Errore nei servizi</h2>
        <p className="text-muted-foreground mb-2">
          {error instanceof Error ? error.message : "Errore sconosciuto"}
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Controlla la console per maggiori dettagli
        </p>
        <div className="space-y-2">
          <Button onClick={prevStep} className="w-full">
            Torna indietro
          </Button>
          <Button 
            onClick={() => window.location.reload()} 
            variant="ghost" 
            className="w-full"
          >
            Ricarica
          </Button>
        </div>
      </div>
    );
  }
};

export default ServicesStep;
