
import React from "react";
import { Separator } from "@/components/ui/separator";
import { PriceCalculation } from "@/utils/price/types";
import { FormValues } from "@/utils/quoteFormSchema";
import { getEffectiveGuestCount } from "@/utils/apartmentRecommendation";
import { Euro, Percent, ReceiptText, Sparkles, PawPrint } from "lucide-react";

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
  
  // Calculate extra services (animals and extra linen)
  const extraServices = priceInfo.extras;
  const showExtraServices = extraServices > 0;
  
  // Get cleaning fee and tourist tax
  const cleaningFee = priceInfo.cleaningFee;
  const touristTax = priceInfo.touristTax;

  // Use the subtotal from the price calculation
  const subtotal = priceInfo.subtotal;

  // The total to pay is the final amount after all discounts
  const totalToPay = priceInfo.totalAfterDiscount;
  
  // The deposit is 30% of the total
  const deposit = priceInfo.deposit;
  
  // The discount is the difference between the original price and the rounded price
  const discount = priceInfo.discount;
  
  // Helper to format the apartment cost text
  const formatApartmentCostText = () => {
    if (hasMultipleApartments) {
      if (weeks > 1) {
        return `Costo appartamenti (${weeks} settimane, ${nights} notti):`;
      } else {
        return `Costo appartamenti (${nights} notti):`;
      }
    } else {
      if (weeks > 1) {
        return `Costo appartamento (${weeks} settimane, ${nights} notti):`;
      } else {
        return `Costo appartamento (${nights} notti):`;
      }
    }
  };

  return (
    <div className="border rounded-md p-4 space-y-4">
      <h3 className="font-medium flex items-center gap-2">
        <Euro className="h-4 w-4" /> 
        Riepilogo costi
      </h3>
      
      <div className="space-y-2">
        {/* Apartment cost - singular or plural based on number of apartments */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {formatApartmentCostText()}
          </span>
          <span className="font-medium">{priceInfo.basePrice}€</span>
        </div>
        
        {/* Extra services (if any) */}
        {showExtraServices && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Servizi extra:</span>
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
            <del className="font-medium mr-1">{cleaningFee}€</del>
            <span className="text-green-500">(inclusa)</span>
          </div>
        </div>
        
        {/* Display free cribs if any */}
        {sleepingInCribs > 0 && (
          <div className="flex justify-between text-sm text-green-500">
            <span>Culle per bambini ({sleepingInCribs}):</span>
            <span>Gratuito</span>
          </div>
        )}
        
        <Separator className="my-2" />
        
        {/* Subtotal before tourist tax */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotale:</span>
          <span className="font-medium">{subtotal}€</span>
        </div>
        
        {/* Tourist tax */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            <ReceiptText className="h-3 w-3" /> 
            Tassa di soggiorno:
          </span>
          <div className="flex items-center">
            <del className="font-medium mr-1">{touristTax}€</del>
            <span className="text-green-500">(inclusa)</span>
          </div>
        </div>
        
        <Separator className="my-2" />
        
        {/* Total with applied discount */}
        <div className="flex justify-between text-sm font-semibold">
          <span className="flex items-center gap-1">
            <Percent className="h-4 w-4" />
            Totale con sconto applicato:
          </span>
          <span className="text-primary">{totalToPay}€</span>
        </div>
        
        {/* Discount (if any) */}
        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-500">
            <span>Sconto:</span>
            <span>{discount}€</span>
          </div>
        )}
        
        <Separator className="my-2" />
        
        {/* Final total to pay */}
        <div className="flex justify-between font-bold text-lg">
          <span>Totale da pagare:</span>
          <span>{totalToPay}€</span>
        </div>
        
        {/* Deposit */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Caparra (30%):</span>
          <span className="font-medium">{deposit}€</span>
        </div>
        
        {/* Security deposit */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Cauzione (restituibile):</span>
          <span className="font-medium">200€</span>
        </div>
      </div>
    </div>
  );
};

export default PriceSummary;
