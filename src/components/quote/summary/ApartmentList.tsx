
import React from "react";
import { Apartment } from "@/data/apartments";
import { FormValues } from "@/utils/quoteFormSchema";
import { PriceCalculation } from "@/utils/price/types";
import { roundDownToNearest50 } from "@/utils/price/basePrice";
import { Euro, Dog } from "lucide-react";

interface ApartmentListProps {
  apartments: Apartment[];
  selectedApartments: Apartment[];
  formValues: FormValues;
  priceInfo: PriceCalculation;
}

const ApartmentList: React.FC<ApartmentListProps> = ({ 
  apartments, 
  selectedApartments, 
  formValues,
  priceInfo
}) => {
  // Helper to check if an apartment has pets
  const hasPetsInApartment = (apartmentId: string) => {
    if (formValues.petsInApartment && formValues.petsInApartment[apartmentId]) {
      return true;
    }
    return formValues.hasPets || false;
  };

  // Get number of people per apartment
  const getPeopleCount = (apartmentId: string): number => {
    if (formValues.personsPerApartment && formValues.personsPerApartment[apartmentId]) {
      return formValues.personsPerApartment[apartmentId];
    }
    // Fallback to total adults and children
    return (formValues.adults || 0) + (formValues.children || 0);
  };

  // Calculate apartment-specific costs
  const calculateApartmentCosts = (apartment: Apartment) => {
    const apartmentBasePrice = priceInfo.apartmentPrices?.[apartment.id] || 0;
    const peopleCount = getPeopleCount(apartment.id);
    const hasPets = hasPetsInApartment(apartment.id);
    
    // Calculate linen cost (15€ per person if extra)
    const linenCost = formValues.linenOption === "extra" ? peopleCount * 15 : 0;
    
    // Pet cost: 50€ per apartment if there are pets
    const petCost = hasPets ? 50 : 0;
    
    // Cleaning fee is fixed at 50€ per apartment (included in price)
    const cleaningFee = 50;
    
    // Tourist tax: 1€ per person per night (included in price)
    const touristTax = peopleCount * priceInfo.nights * 1;
    
    // Calculate total before discount
    const totalBeforeDiscount = apartmentBasePrice + linenCost + petCost;
    
    // Round down to nearest 50€
    const roundedTotal = roundDownToNearest50(totalBeforeDiscount);
    
    // Calculate discount
    const discount = totalBeforeDiscount - roundedTotal;
    
    return {
      basePrice: apartmentBasePrice,
      linenCost,
      petCost,
      cleaningFee,
      touristTax,
      totalBeforeDiscount,
      roundedTotal,
      discount
    };
  };

  return (
    <div className="space-y-3">
      {selectedApartments.length > 0 ? (
        <div className="space-y-4">
          {selectedApartments.map((apartment, index) => {
            const costs = calculateApartmentCosts(apartment);
            const hasPets = hasPetsInApartment(apartment.id);
            const isLastItem = index === selectedApartments.length - 1;
            
            return (
              <div key={apartment.id} className={`pb-4 ${!isLastItem ? 'border-b' : ''}`}>
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-md">{apartment.name}</h4>
                    <div className="text-right">
                      <span className="text-primary font-semibold">{costs.basePrice}€</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <span className="text-muted-foreground">Posti letto:</span>
                    <span>{apartment.beds}</span>
                    
                    {costs.linenCost > 0 && (
                      <>
                        <span className="text-muted-foreground">Biancheria extra:</span>
                        <span>{costs.linenCost}€</span>
                      </>
                    )}
                    
                    {hasPets && (
                      <>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Dog className="h-3 w-3" />Animali:
                        </span>
                        <span>{costs.petCost}€</span>
                      </>
                    )}
                    
                    <span className="text-muted-foreground">Pulizia finale:</span>
                    <span className="flex items-center">
                      {costs.cleaningFee}€
                      <span className="text-green-500 text-[10px] ml-1">(inclusa)</span>
                    </span>
                    
                    <span className="text-muted-foreground">Tassa soggiorno:</span>
                    <span className="flex items-center">
                      {costs.touristTax}€
                      <span className="text-green-500 text-[10px] ml-1">(inclusa)</span>
                    </span>
                    
                    <span className="text-muted-foreground font-medium">Totale:</span>
                    <span className="font-medium">{costs.totalBeforeDiscount}€</span>
                  </div>
                  
                  {/* Sconto per appartamento */}
                  {costs.discount > 0 && (
                    <div className="flex justify-between items-center text-sm mt-1">
                      <div className="text-green-500 flex items-center gap-1 text-sm">
                        Risparmio: {costs.discount}€
                      </div>
                      <div className="font-semibold">
                        Totale scontato: {costs.roundedTotal}€
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Nessun appartamento selezionato</p>
      )}
    </div>
  );
};

export default ApartmentList;
