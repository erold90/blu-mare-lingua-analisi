
import React from "react";
import { PriceCalculation } from "@/utils/price/types";

interface ApartmentPricingProps {
  basePrice: number;
  nights: number;
  pricesAreValid: boolean;
  hasMultipleApartments: boolean;
  priceInfo: PriceCalculation;
}

const ApartmentPricing: React.FC<ApartmentPricingProps> = ({
  basePrice,
  nights,
  pricesAreValid,
  hasMultipleApartments,
  priceInfo
}) => {
  const weeks = Math.ceil(nights / 7);
  const pricePerNight = nights > 0 ? Math.round(basePrice / nights) : 0;
  const pricePerWeek = weeks > 0 ? Math.round(basePrice / weeks) : 0;

  const formatApartmentCostText = () => {
    if (hasMultipleApartments) {
      return `Prezzo base appartamenti:`;
    } else {
      return `Prezzo base appartamento:`;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">
          {formatApartmentCostText()}
        </span>
        <span className="font-medium">
          {pricesAreValid ? `${basePrice}€` : 'N/A'}
        </span>
      </div>
      
      {/* Breakdown prezzo per notte e settimana */}
      {pricesAreValid && (
        <div className="ml-4 space-y-1 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>• Prezzo per notte:</span>
            <span>~{pricePerNight}€</span>
          </div>
          <div className="flex justify-between">
            <span>• Prezzo per settimana:</span>
            <span>~{pricePerWeek}€</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>• {nights} notti ({weeks} settimane):</span>
            <span>{basePrice}€</span>
          </div>
        </div>
      )}

      {/* Show individual apartment prices if multiple apartments */}
      {hasMultipleApartments && priceInfo.apartmentPrices && pricesAreValid && (
        <div className="ml-4 space-y-2 p-2 bg-gray-50 rounded">
          <div className="text-xs font-medium text-muted-foreground">Dettaglio per appartamento:</div>
          {Object.entries(priceInfo.apartmentPrices).map(([apartmentId, price]) => (
            <div key={apartmentId} className="flex justify-between text-xs">
              <span className="capitalize">{apartmentId.replace('-', ' ')}:</span>
              <span className="font-medium">{price}€</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApartmentPricing;
