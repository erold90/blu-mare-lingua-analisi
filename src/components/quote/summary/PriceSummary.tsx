
import React from "react";
import { Separator } from "@/components/ui/separator";
import { PriceCalculation } from "@/utils/price/types";
import { FormValues } from "@/utils/quoteFormSchema";
import { getEffectiveGuestCount } from "@/utils/apartmentRecommendation";
import { Euro, Percent, ReceiptText, Sparkles, PawPrint, BadgeEuro, Minus, AlertCircle } from "lucide-react";

interface PriceSummaryProps {
  priceInfo: PriceCalculation;
  formValues: FormValues;
}

const PriceSummary: React.FC<PriceSummaryProps> = ({ priceInfo, formValues }) => {
  const { sleepingInCribs } = getEffectiveGuestCount(formValues);
  const nights = priceInfo.nights || 0;
  const weeks = Math.ceil(nights / 7);
  
  // Check if multiple apartments are selected
  const hasMultipleApartments = (
    formValues.selectedApartments && 
    formValues.selectedApartments.length > 1
  );
  
  // Verifica se i prezzi sono validi
  const pricesAreValid = priceInfo.totalPrice > 0 && priceInfo.basePrice > 0;
  
  // Base price is the cost of apartments without extras
  const basePrice = priceInfo.basePrice;
  
  // Calculate extra services (animals and extra linen)
  const extraServices = priceInfo.extras;
  const showExtraServices = extraServices > 0;
  
  // Get cleaning fee and tourist tax - these are ONLY for display
  const cleaningFee = priceInfo.cleaningFee;
  const touristTax = priceInfo.touristTax;
  
  // Subtotal includes base price plus extras (BUT NOT cleaning fee or tourist tax)
  const subtotal = priceInfo.totalBeforeDiscount;

  // The discount is the difference between the original price and the rounded price
  const discount = priceInfo.discount;
  
  // The total to pay is the final amount after all discounts
  const totalToPay = priceInfo.totalAfterDiscount;
  
  // The deposit is calculated in discountCalculator and rounded to nearest 100€
  const deposit = priceInfo.deposit;
  
  // Helper to format the apartment cost text
  const formatApartmentCostText = () => {
    if (hasMultipleApartments) {
      if (weeks > 1) {
        return `Prezzo base appartamenti (${weeks} settimane, ${nights} notti):`;
      } else {
        return `Prezzo base appartamenti (${nights} notti):`;
      }
    } else {
      if (weeks > 1) {
        return `Prezzo base appartamento (${weeks} settimane, ${nights} notti):`;
      } else {
        return `Prezzo base appartamento (${nights} notti):`;
      }
    }
  };

  return (
    <div className="border rounded-md p-4 space-y-4">
      <h3 className="font-medium flex items-center gap-2">
        <Euro className="h-4 w-4" /> 
        Dettagli prezzo
      </h3>
      
      {/* Warning se i prezzi non sono validi */}
      {!pricesAreValid && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <span className="text-sm text-yellow-800">
            I prezzi potrebbero non essere aggiornati. Verifica nell'area riservata.
          </span>
        </div>
      )}
      
      <div className="space-y-2">
        {/* Apartment cost - base price */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {formatApartmentCostText()}
          </span>
          <span className="font-medium">
            {pricesAreValid ? `${basePrice}€` : 'N/A'}
          </span>
        </div>
        
        {/* Extra services (if any) */}
        {showExtraServices && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Extra:</span>
            <span className="font-medium">{extraServices}€</span>
          </div>
        )}
        
        {/* Cleaning fee */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> 
            Pulizia finale:
          </span>
          <div className="flex items-center">
            <span className="text-green-500">(inclusa)</span>
            <del className="font-medium ml-1">{cleaningFee}€</del>
          </div>
        </div>
        
        {/* Display free cribs if any */}
        {sleepingInCribs > 0 && (
          <div className="flex justify-between text-sm text-green-500">
            <span>Culle per bambini ({sleepingInCribs}):</span>
            <span>Gratuito</span>
          </div>
        )}
        
        {/* Tourist tax */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            <ReceiptText className="h-3 w-3" /> 
            Tassa di soggiorno:
          </span>
          <div className="flex items-center">
            <span className="text-green-500">(inclusa)</span>
            <del className="font-medium ml-1">{touristTax}€</del>
          </div>
        </div>
        
        <Separator className="my-2" />
        
        {/* Subtotal before discount */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotale:</span>
          <span className="font-medium">
            {pricesAreValid ? `${subtotal}€` : 'N/A'}
          </span>
        </div>
        
        {/* Discount (if any) */}
        {discount > 0 && pricesAreValid && (
          <div className="flex justify-between text-sm text-green-500">
            <span>Sconto:</span>
            <span className="flex items-center">
              <Minus className="h-3 w-3 mr-0.5" />-{discount}€
            </span>
          </div>
        )}
        
        {/* Final total to pay */}
        <div className="flex justify-between font-bold text-lg">
          <span>Totale:</span>
          <span className={pricesAreValid ? "" : "text-muted-foreground"}>
            {pricesAreValid ? `${totalToPay}€` : 'Da calcolare'}
          </span>
        </div>
        
        {/* Deposit and security deposit */}
        {pricesAreValid && (
          <div className="space-y-2 mt-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Caparra (30%):</span>
              <span className="font-medium">{deposit}€</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cauzione:</span>
              <span className="font-medium">200€ (restituibile)</span>
            </div>
          </div>
        )}
        
        {/* Note sui prezzi se non validi */}
        {!pricesAreValid && (
          <div className="text-xs text-muted-foreground mt-2 p-2 bg-gray-50 rounded">
            <strong>Nota:</strong> I prezzi verranno calcolati in base alle tariffe configurate nell'area riservata. 
            Contattaci per un preventivo dettagliato.
          </div>
        )}
      </div>
    </div>
  );
}

export default PriceSummary;
