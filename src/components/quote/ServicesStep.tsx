
import React, { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Dog, Bed } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  FormField, 
  FormItem, 
  FormControl,
  FormMessage 
} from "@/components/ui/form";
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";

interface ServicesStepProps {
  form: UseFormReturn<FormValues>;
  prevStep: () => void;
  nextStep: () => void;
  apartments: Apartment[];
}

const ServicesStep: React.FC<ServicesStepProps> = ({ form, prevStep, nextStep, apartments }) => {
  const isMobile = useIsMobile();
  const selectedApartmentIds = form.watch("selectedApartments") || [];
  const selectedApartments = apartments.filter(apt => selectedApartmentIds.includes(apt.id));
  const multipleApartments = selectedApartments.length > 1;
  
  const totalAdults = form.watch("adults") || 0;
  const totalChildren = form.watch("children") || 0;
  const childrenDetails = form.watch("childrenDetails") || [];
  
  // Count children who don't sleep with parents
  const independentChildren = childrenDetails.filter(child => !child.sleepsWithParents).length;
  
  // Total people who need linen
  const totalPeopleForLinen = totalAdults + independentChildren;
  
  // State for persons per apartment (for linen distribution)
  const [personsPerApartment, setPersonsPerApartment] = useState<Record<string, number>>(
    Object.fromEntries(selectedApartmentIds.map(id => [id, 0]))
  );
  
  // State for which apartment has pets
  const [petsInApartment, setPetsInApartment] = useState<Record<string, boolean>>(
    Object.fromEntries(selectedApartmentIds.map(id => [id, false]))
  );
  
  // Initialize or update when selected apartments change
  useEffect(() => {
    // Initialize with empty values if not set
    const initialPersonsPerApt: Record<string, number> = {};
    const initialPetsPerApt: Record<string, boolean> = {};
    
    selectedApartmentIds.forEach(id => {
      initialPersonsPerApt[id] = personsPerApartment[id] || 0;
      initialPetsPerApt[id] = petsInApartment[id] || false;
    });
    
    setPersonsPerApartment(initialPersonsPerApt);
    setPetsInApartment(initialPetsPerApt);
    
    // Set form values
    form.setValue("personsPerApartment", initialPersonsPerApt);
    form.setValue("petsInApartment", initialPetsPerApt);
  }, [selectedApartmentIds.join(',')]);
  
  // Calculate total persons assigned to apartments
  const totalAssignedPersons = Object.values(personsPerApartment).reduce((sum, count) => sum + count, 0);
  
  // Update form when distribution changes
  const updatePersonsPerApartment = (apartmentId: string, count: number) => {
    const newDistribution = { ...personsPerApartment, [apartmentId]: count };
    setPersonsPerApartment(newDistribution);
    form.setValue("personsPerApartment", newDistribution);
  };
  
  // Toggle pet assignment for an apartment
  const togglePetInApartment = (apartmentId: string) => {
    const newPetsDistribution = { 
      ...petsInApartment, 
      [apartmentId]: !petsInApartment[apartmentId] 
    };
    setPetsInApartment(newPetsDistribution);
    form.setValue("petsInApartment", newPetsDistribution);
    
    // If any apartment has pets, set hasPets to true
    const hasPetsInAnyApartment = Object.values(newPetsDistribution).some(Boolean);
    form.setValue("hasPets", hasPetsInAnyApartment);
  };
  
  // Calculate linen costs
  const linenCost = totalPeopleForLinen * 15;
  
  // Calculate pet costs (50€ per apartment with pets)
  const petCost = form.watch("hasPets") ? 
    (multipleApartments ? 
      Object.values(petsInApartment).filter(Boolean).length * 50 : 
      50) : 
    0;
  
  // Funzione per ottenere il testo dell'etichetta per l'appartamento
  const getApartmentLabel = (apartmentName: string) => {
    const apartmentNumber = apartmentName.split(' ')[1];
    
    return (
      <span className="whitespace-nowrap flex-shrink-0">
        {isMobile ? `App. ${apartmentNumber}` : `Appartamento ${apartmentNumber}`}
      </span>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Servizi extra</CardTitle>
        <CardDescription>Personalizza il tuo soggiorno con servizi aggiuntivi</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Opzioni biancheria */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Bed className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium">Biancheria da letto e bagno</h3>
          </div>
          
          <FormField
            control={form.control}
            name="linenOption"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <div className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox 
                      checked={field.value === "extra"} 
                      onCheckedChange={(checked) => {
                        form.setValue("linenOption", checked ? "extra" : "standard");
                      }}
                      id="linen-extra"
                    />
                  </FormControl>
                  <Label htmlFor="linen-extra" className="cursor-pointer">
                    Richiedo servizio biancheria - 15€ a persona per tutto il soggiorno
                  </Label>
                </div>
                
                {field.value === "extra" && (
                  <div className="pl-6">
                    {!multipleApartments ? (
                      <p className="text-sm text-muted-foreground">
                        Totale per {totalPeopleForLinen} {totalPeopleForLinen === 1 ? 'persona' : 'persone'}: {linenCost}€
                      </p>
                    ) : (
                      <div className="space-y-4 border rounded-lg p-4">
                        <p className="text-sm">
                          Distribuisci le {totalPeopleForLinen} persone tra i tuoi appartamenti:
                        </p>
                        
                        {selectedApartments.map((apartment) => (
                          <div key={apartment.id} className="flex items-center justify-between">
                            <Label htmlFor={`apt-persons-${apartment.id}`} className="text-sm flex-shrink-0">
                              {getApartmentLabel(apartment.name)}:
                            </Label>
                            <div className="flex items-center space-x-2">
                              <Button 
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  const current = personsPerApartment[apartment.id] || 0;
                                  if (current > 0) {
                                    updatePersonsPerApartment(apartment.id, current - 1);
                                  }
                                }}
                                disabled={(personsPerApartment[apartment.id] || 0) <= 0}
                              >
                                -
                              </Button>
                              <Input
                                id={`apt-persons-${apartment.id}`}
                                className="w-16 text-center"
                                value={personsPerApartment[apartment.id] || 0}
                                readOnly
                              />
                              <Button 
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  const current = personsPerApartment[apartment.id] || 0;
                                  if (totalAssignedPersons < totalPeopleForLinen) {
                                    updatePersonsPerApartment(apartment.id, current + 1);
                                  }
                                }}
                                disabled={totalAssignedPersons >= totalPeopleForLinen}
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        ))}
                        
                        <div className="flex justify-between text-sm font-medium mt-2 pt-2 border-t">
                          <span>Persone assegnate:</span>
                          <span>{totalAssignedPersons} / {totalPeopleForLinen}</span>
                        </div>
                        
                        {totalAssignedPersons !== totalPeopleForLinen && (
                          <p className="text-destructive text-sm">
                            {totalAssignedPersons < totalPeopleForLinen
                              ? `Devi assegnare ancora ${totalPeopleForLinen - totalAssignedPersons} persone`
                              : `Hai assegnato ${totalAssignedPersons - totalPeopleForLinen} persone in più`}
                          </p>
                        )}
                        
                        <p className="text-sm text-muted-foreground pt-2">
                          Costo totale biancheria: {linenCost}€
                        </p>
                      </div>
                    )}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Separator />
        
        {/* Animali domestici */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Dog className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium">Animali domestici</h3>
          </div>
          
          <FormField
            control={form.control}
            name="hasPets"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <div className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                      id="has-pets"
                    />
                  </FormControl>
                  <Label htmlFor="has-pets" className="cursor-pointer">
                    Viaggerò con animali domestici - 50€ {multipleApartments ? "per appartamento" : ""}
                  </Label>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Dettagli animali domestici (se presenti) */}
          {form.watch("hasPets") && (
            <div className="space-y-4 border rounded-lg p-4 ml-6">
              {multipleApartments ? (
                <>
                  <p className="text-sm">Seleziona in quali appartamenti saranno presenti animali domestici:</p>
                  
                  {selectedApartments.map((apartment) => (
                    <div key={apartment.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`pet-apt-${apartment.id}`}
                        checked={petsInApartment[apartment.id] || false}
                        onCheckedChange={() => togglePetInApartment(apartment.id)}
                      />
                      <Label htmlFor={`pet-apt-${apartment.id}`} className="text-sm cursor-pointer">
                        {getApartmentLabel(apartment.name)}
                      </Label>
                    </div>
                  ))}
                  
                  <p className="text-sm text-muted-foreground pt-2">
                    Costo totale animali: {petCost}€
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Supplemento per animali domestici: 50€ per tutto il soggiorno
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
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
};

export default ServicesStep;
