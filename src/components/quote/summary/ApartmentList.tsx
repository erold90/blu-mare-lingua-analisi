
import React from "react";
import { Apartment } from "@/data/apartments";
import { FormValues } from "@/utils/quoteFormSchema";
import { PriceCalculation } from "@/utils/price/types";
import { roundDownToNearest50 } from "@/utils/price/basePrice";
import { Euro, PawPrint, Bed, SparklesIcon, Banknote, Receipt, CalendarDays, Minus } from "lucide-react";

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
    
    // Cleaning fee is fixed at 50€ per apartment (for display only - not added to totals)
    const cleaningFee = 50;
    
    // Tourist tax: 1€ per person per night (for display only - not added to totals)
    const touristTax = peopleCount * priceInfo.nights * 1;
    
    // Calculate total before discount (ONLY include actual costs that affect pricing)
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

  // Calculate weeks from nights
  const getWeeksInfo = () => {
    const nights = priceInfo.nights || 0;
    const weeks = Math.ceil(nights / 7);
    return weeks > 1 ? `${weeks} settimane (${nights} notti)` : `${nights} notti`;
  };

  // Check if we have multiple apartments
  const hasMultipleApartments = selectedApartments.length > 1;

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
                  
                  {hasMultipleApartments && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Bed className="h-3 w-3" />Posti letto:
                      </span>
                      <span>{apartment.beds}</span>
                      
                      <span className="text-muted-foreground flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />Periodo:
                      </span>
                      <span>{getWeeksInfo()}</span>
                      
                      {costs.linenCost > 0 && (
                        <>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Receipt className="h-3 w-3" />Biancheria extra:
                          </span>
                          <span>{costs.linenCost}€</span>
                        </>
                      )}
                      
                      {hasPets && (
                        <>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <PawPrint className="h-3 w-3" />Animali:
                          </span>
                          <span>{costs.petCost}€</span>
                        </>
                      )}
                      
                      <span className="text-muted-foreground flex items-center gap-1">
                        <SparklesIcon className="h-3 w-3" />Pulizia finale:
                      </span>
                      <span className="flex items-center">
                        <span className="text-green-500 text-[10px] mr-1">(inclusa)</span>
                        <del>{costs.cleaningFee}€</del>
                      </span>
                      
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Banknote className="h-3 w-3" />Tassa soggiorno:
                      </span>
                      <span className="flex items-center">
                        <span className="text-green-500 text-[10px] mr-1">(inclusa)</span>
                        <del>{costs.touristTax}€</del>
                      </span>
                      
                      <span className="text-muted-foreground font-medium flex items-center gap-1">
                        <Euro className="h-3 w-3" />Subtotale:
                      </span>
                      <span className="font-medium">{costs.totalBeforeDiscount}€</span>
                    </div>
                  )}
                  
                  {/* For single apartments, only show extended details if there are extras */}
                  {!hasMultipleApartments && (costs.linenCost > 0 || hasPets) && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {costs.linenCost > 0 && (
                        <>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Receipt className="h-3 w-3" />Biancheria extra:
                          </span>
                          <span>{costs.linenCost}€</span>
                        </>
                      )}
                      
                      {hasPets && (
                        <>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <PawPrint className="h-3 w-3" />Animali:
                          </span>
                          <span>{costs.petCost}€</span>
                        </>
                      )}
                    </div>
                  )}
                  
                  {/* Sconto per appartamento - only shown for multiple apartments */}
                  {hasMultipleApartments && costs.discount > 0 && (
                    <div className="flex justify-between items-center text-sm mt-1">
                      <div className="text-green-500 flex items-center gap-1 text-sm">
                        Sconto: <Minus className="h-3 w-3 mx-0.5" />{costs.discount}€
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
