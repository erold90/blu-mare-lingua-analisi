
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
  console.log("🔍 ServicesStep: Rendering services step");
  console.log("🔍 ServicesStep: Form values:", form.getValues());
  console.log("🔍 ServicesStep: Apartments:", apartments);
  
  try {
    const selectedApartmentIds = form.watch("selectedApartments") || [];
    const selectedApartments = apartments.filter(apt => selectedApartmentIds.includes(apt.id));
    
    console.log("🔍 ServicesStep: Selected apartment IDs:", selectedApartmentIds);
    console.log("🔍 ServicesStep: Selected apartments:", selectedApartments);
    
    // Get guest counts
    const { totalPeopleForLinen } = calculateGuestCounts(form.getValues());
    
    console.log("🔍 ServicesStep: Total people for linen:", totalPeopleForLinen);
    
    // Get state for services
    const {
      personsPerApartment,
      petsInApartment,
      totalAssignedPersons,
      updatePersonsPerApartment,
      togglePetInApartment,
      hasReachedApartmentCapacity
    } = useServicesState(form, selectedApartmentIds, apartments);
    
    console.log("🔍 ServicesStep: Services state loaded successfully");
    
    const multipleApartments = selectedApartments.length > 1;

    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Servizi extra</CardTitle>
          <CardDescription>Personalizza il tuo soggiorno con servizi aggiuntivi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Opzioni biancheria */}
          <LinenService 
            form={form}
            selectedApartments={selectedApartments}
            totalPeopleForLinen={totalPeopleForLinen}
            personsPerApartment={personsPerApartment}
            totalAssignedPersons={totalAssignedPersons}
            updatePersonsPerApartment={updatePersonsPerApartment}
            hasReachedApartmentCapacity={hasReachedApartmentCapacity}
          />
          
          <Separator />
          
          {/* Animali domestici */}
          <PetsService 
            form={form}
            selectedApartments={selectedApartments}
            petsInApartment={petsInApartment}
            togglePetInApartment={togglePetInApartment}
          />
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          <Button type="button" variant="outline" onClick={prevStep}>Indietro</Button>
          <Button 
            type="button" 
            onClick={nextStep}
            disabled={
              form.watch("linenOption") === "extra" && 
              multipleApartments && 
              totalAssignedPersons !== totalPeopleForLinen
            }
          >
            Avanti
          </Button>
        </CardFooter>
      </Card>
    );
  } catch (error) {
    console.error("❌ ServicesStep: Error rendering component:", error);
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <p className="text-red-500">Errore nel caricamento dei servizi extra</p>
          <p className="text-sm text-gray-500 mt-2">Controlla la console per maggiori dettagli</p>
          <Button onClick={prevStep} className="mt-4">Torna indietro</Button>
        </CardContent>
      </Card>
    );
  }
};

export default ServicesStep;
