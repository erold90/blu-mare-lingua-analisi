
import React from "react";
import { Apartment } from "@/data/apartments";
import { FormValues } from "@/utils/quoteFormSchema";
import { PriceCalculation } from "@/utils/price/types";
import { roundDownToNearest50 } from "@/utils/price/basePrice";

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

  // Calculate rounded price for each apartment (round down to nearest 50€)
  const getRoundedPrice = (apartmentId: string): number => {
    const originalPrice = priceInfo.apartmentPrices?.[apartmentId] || 0;
    return roundDownToNearest50(originalPrice);
  };

  // Calculate discount for each apartment
  const getDiscount = (apartmentId: string): number => {
    const originalPrice = priceInfo.apartmentPrices?.[apartmentId] || 0;
    const roundedPrice = getRoundedPrice(apartmentId);
    return originalPrice - roundedPrice;
  };

  return (
    <div className="space-y-3">
      {selectedApartments.length > 0 ? (
        <div className="space-y-4">
          {selectedApartments.map((apartment, index) => {
            const apartmentPrice = priceInfo.apartmentPrices?.[apartment.id] || 0;
            const roundedPrice = getRoundedPrice(apartment.id);
            const discount = getDiscount(apartment.id);
            const hasPets = hasPetsInApartment(apartment.id);
            const isLastItem = index === selectedApartments.length - 1;
            
            return (
              <div key={apartment.id} className={`pb-4 ${!isLastItem ? 'border-b' : ''}`}>
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-md">{apartment.name}</h4>
                    <div className="text-right">
                      {discount > 0 && (
                        <div className="flex flex-col">
                          <span className="text-sm line-through text-muted-foreground">{apartmentPrice}€</span>
                          <span className="text-primary font-semibold">{roundedPrice}€</span>
                        </div>
                      )}
                      {discount === 0 && (
                        <span className="text-primary font-semibold">{apartmentPrice}€</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Capacità:</span>
                    <span>{apartment.capacity} persone</span>
                    <span className="text-muted-foreground">Posti letto:</span>
                    <span>{apartment.beds}</span>
                    <span className="text-muted-foreground">Posizione:</span>
                    <span>Piano {apartment.floor}</span>
                    
                    {hasPets && (
                      <>
                        <span className="text-muted-foreground">Animali:</span>
                        <span>Sì</span>
                      </>
                    )}
                  </div>
                  
                  {/* Sconto per appartamento */}
                  {discount > 0 && (
                    <div className="mt-1 text-sm text-green-500">
                      Risparmio: {discount}€
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
