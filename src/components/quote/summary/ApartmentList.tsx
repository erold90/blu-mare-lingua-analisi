
import React from 'react';
import { Check, Utensils, Dog, Bed } from 'lucide-react';
import { Apartment } from '@/data/apartments';
import { FormValues } from '@/utils/quoteFormSchema';
import { PriceCalculation } from '@/utils/price/types';

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
  // Check if a specific apartment has pets assigned to it
  const apartmentHasPets = (apartmentId: string) => {
    if (!formValues.hasPets) return false;
    
    if (formValues.selectedApartments?.length === 1) {
      // If there's only one apartment, it has pets if hasPets is true
      return true;
    } 
    
    // Check if this specific apartment has pets assigned
    return formValues.petsInApartment?.[apartmentId] === true;
  };
  
  // Get base price for an apartment
  const getApartmentPrice = (apartmentId: string) => {
    return priceInfo.apartmentPrices?.[apartmentId] || 0;
  };

  return (
    <div className="space-y-3">
      {selectedApartments.map((apt) => (
        <div key={apt.id} className="pb-3 border-b last:border-b-0">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium">{apt.name}</h4>
            <span className="font-semibold">€{getApartmentPrice(apt.id)}</span>
          </div>
          <ul className="text-sm space-y-1">
            <li className="flex items-center gap-2">
              <Bed className="h-4 w-4 text-gray-500" />
              <span>Posti letto: {apt.beds}</span>
            </li>
            
            {/* Display linen service if requested */}
            {formValues.needsLinen && (
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span>Biancheria: €15 a persona</span>
              </li>
            )}
            
            {/* Only show pets for apartments that actually have pets assigned */}
            {apartmentHasPets(apt.id) && (
              <li className="flex items-center gap-2">
                <Dog className="h-4 w-4 text-gray-500" />
                <span>Animali: €50</span>
              </li>
            )}
            
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Pulizia finale: <span className="text-green-600">(inclusa)</span> €50</span>
            </li>
            
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Tassa soggiorno: <span className="text-green-600">(inclusa)</span> €14</span>
            </li>
          </ul>
        </div>
      ))}
    </div>
  );
};

export default ApartmentList;
