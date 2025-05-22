
import React from "react";
import { Bed } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { useIsMobile } from "@/hooks/use-mobile";

interface LinenServiceProps {
  form: UseFormReturn<FormValues>;
  selectedApartments: Apartment[];
  totalPeopleForLinen: number;
  personsPerApartment: Record<string, number>;
  totalAssignedPersons: number;
  updatePersonsPerApartment: (apartmentId: string, count: number) => void;
  hasReachedApartmentCapacity: (apartmentId: string) => boolean;
}

const LinenService: React.FC<LinenServiceProps> = ({
  form,
  selectedApartments,
  totalPeopleForLinen,
  personsPerApartment,
  totalAssignedPersons,
  updatePersonsPerApartment,
  hasReachedApartmentCapacity
}) => {
  const isMobile = useIsMobile();
  const multipleApartments = selectedApartments.length > 1;
  const linenCost = totalPeopleForLinen * 15;

  // Function to get label text for apartment
  const getApartmentLabel = (apartmentName: string) => {
    const apartmentNumber = apartmentName.split(' ')[1];
    
    return (
      <span className="whitespace-nowrap flex-shrink-0">
        {isMobile ? `App. ${apartmentNumber}` : `Appartamento ${apartmentNumber}`}
      </span>
    );
  };

  return (
    <div className="space-y-3 p-3 border rounded-md">
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
              <div className="pl-6 mt-2">
                {!multipleApartments ? (
                  <p className="text-sm text-muted-foreground">
                    Totale per {totalPeopleForLinen} {totalPeopleForLinen === 1 ? 'persona' : 'persone'}: {linenCost}€
                  </p>
                ) : (
                  <div className="space-y-3 border rounded-lg p-3">
                    <p className="text-sm">
                      Distribuisci le {totalPeopleForLinen} persone tra i tuoi appartamenti:
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-2">
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
                              className="h-7 w-7"
                            >
                              -
                            </Button>
                            <Input
                              id={`apt-persons-${apartment.id}`}
                              className="w-12 text-center"
                              value={personsPerApartment[apartment.id] || 0}
                              readOnly
                            />
                            <Button 
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                const current = personsPerApartment[apartment.id] || 0;
                                // Check both that we haven't assigned all people and that the apartment isn't at capacity
                                if (totalAssignedPersons < totalPeopleForLinen && 
                                    !hasReachedApartmentCapacity(apartment.id)) {
                                  updatePersonsPerApartment(apartment.id, current + 1);
                                }
                              }}
                              disabled={totalAssignedPersons >= totalPeopleForLinen || 
                                        hasReachedApartmentCapacity(apartment.id)}
                              className="h-7 w-7"
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
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
                    
                    <p className="text-sm text-muted-foreground">
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
  );
};

export default LinenService;
