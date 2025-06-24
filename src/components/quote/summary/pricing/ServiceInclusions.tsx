
import React from "react";
import { Sparkles, ReceiptText } from "lucide-react";
import { FormValues } from "@/utils/quoteFormSchema";

interface ServiceInclusionsProps {
  cleaningFee: number;
  touristTax: number;
  nights: number;
  pricesAreValid: boolean;
  formValues: FormValues;
  sleepingInCribs: number;
}

const ServiceInclusions: React.FC<ServiceInclusionsProps> = ({
  cleaningFee,
  touristTax,
  nights,
  pricesAreValid,
  formValues,
  sleepingInCribs
}) => {
  // Calculate taxable guests for tourist tax display
  const adults = formValues.adults || 0;
  const childrenDetails = formValues.childrenDetails || [];
  const childrenOver12 = childrenDetails.filter(child => !child.isUnder12).length;
  const taxableGuests = adults + childrenOver12;

  return (
    <div className="space-y-2 ml-4">
      {/* Cleaning fee */}
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> 
          Pulizia finale:
        </span>
        <div className="flex items-center">
          <span className="text-green-600 text-xs">(inclusa)</span>
          <span className="text-muted-foreground ml-1">+{cleaningFee}€</span>
        </div>
      </div>
      
      {/* Tourist tax with proper calculation display */}
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground flex items-center gap-1">
          <ReceiptText className="h-3 w-3" /> 
          Tassa di soggiorno:
        </span>
        <div className="flex items-center">
          <span className="text-green-600 text-xs">(inclusa)</span>
          <span className="text-muted-foreground ml-1">+{touristTax}€</span>
        </div>
      </div>
      
      {/* Detailed tourist tax calculation for clarity */}
      {pricesAreValid && taxableGuests > 0 && (
        <div className="ml-6 text-xs text-muted-foreground">
          <span>• {taxableGuests} persone × {nights} notti × 1€ = {touristTax}€</span>
          {childrenDetails.filter(child => child.isUnder12).length > 0 && (
            <div className="text-green-600">
              • Bambini sotto 12 anni: esenti
            </div>
          )}
        </div>
      )}
      
      {/* Display free cribs if any */}
      {sleepingInCribs > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Culle per bambini ({sleepingInCribs}):</span>
          <span className="text-green-600 text-xs">Gratuito</span>
        </div>
      )}
    </div>
  );
};

export default ServiceInclusions;
