
import React from "react";
import { Dog } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { useIsMobile } from "@/hooks/use-mobile";

interface PetsServiceProps {
  form: UseFormReturn<FormValues>;
  selectedApartments: Apartment[];
  petsInApartment: Record<string, boolean>;
  togglePetInApartment: (apartmentId: string) => void;
}

const PetsService: React.FC<PetsServiceProps> = ({
  form,
  selectedApartments,
  petsInApartment,
  togglePetInApartment
}) => {
  const isMobile = useIsMobile();
  const multipleApartments = selectedApartments.length > 1;
  
  // Calculate pet costs (50€ per apartment with pets)
  const petCost = form.watch("hasPets") ? 
    (multipleApartments ? 
      Object.values(petsInApartment).filter(Boolean).length * 50 : 
      50) : 
    0;
  
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
        <div className="space-y-2 border rounded-lg p-3 ml-6 mt-2">
          {multipleApartments ? (
            <>
              <p className="text-sm">Seleziona in quali appartamenti saranno presenti animali domestici:</p>
              
              <div className="grid md:grid-cols-2 gap-2">
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
              </div>
              
              <p className="text-sm text-muted-foreground pt-2 mt-2 border-t">
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
  );
};

export default PetsService;
