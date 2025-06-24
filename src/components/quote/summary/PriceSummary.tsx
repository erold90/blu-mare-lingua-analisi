
import React from "react";
import { Separator } from "@/components/ui/separator";
import { PriceCalculation } from "@/utils/price/types";
import { FormValues } from "@/utils/quoteFormSchema";
import { getEffectiveGuestCount } from "@/utils/apartmentRecommendation";
import { Euro, Percent, Minus } from "lucide-react";

// Import refactored components
import PriceValidityWarning from "./pricing/PriceValidityWarning";
import PeriodInfo from "./pricing/PeriodInfo";
import ApartmentPricing from "./pricing/ApartmentPricing";
import ExtraServices from "./pricing/ExtraServices";
import PaymentBreakdown from "./pricing/PaymentBreakdown";
import PricingNotes from "./pricing/PricingNotes";

interface PriceSummaryProps {
  priceInfo: PriceCalculation;
  formValues: FormValues;
}

const PriceSummary: React.FC<PriceSummaryProps> = ({ priceInfo, formValues }) => {
  const { sleepingInCribs } = getEffectiveGuestCount(formValues);
  const nights = priceInfo.nights || 0;
  
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
  
  // Get cleaning fee and tourist tax - these are ONLY for display and are INCLUDED in final price
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

  return (
    <div className="border rounded-md p-4 space-y-4">
      <h3 className="font-medium flex items-center gap-2">
        <Euro className="h-4 w-4" /> 
        Dettagli prezzo
      </h3>
      
      <PriceValidityWarning pricesAreValid={pricesAreValid} />
      
      <PeriodInfo checkIn={formValues.checkIn} checkOut={formValues.checkOut} />
      
      <div className="space-y-3">
        <ApartmentPricing 
          basePrice={basePrice}
          nights={nights}
          pricesAreValid={pricesAreValid}
          hasMultipleApartments={hasMultipleApartments}
          priceInfo={priceInfo}
        />
        
        <ExtraServices 
          extraServices={extraServices}
          showExtraServices={showExtraServices}
        />
        
        <Separator className="my-2" />
        
        {/* Subtotal before mandatory services */}
        <div className="flex justify-between text-sm font-medium">
          <span>Subtotale alloggio:</span>
          <span>
            {pricesAreValid ? `${subtotal}€` : 'N/A'}
          </span>
        </div>
        
        {/* Mandatory additional costs */}
        <div className="ml-4 space-y-2 text-xs text-muted-foreground bg-blue-50 p-3 rounded">
          <div className="font-medium text-primary mb-2">💡 Costi aggiuntivi obbligatori:</div>
          
          <div className="flex justify-between">
            <span>• Pulizia finale ({hasMultipleApartments ? 'per appartamento' : ''}):</span>
            <span className="font-medium text-primary">
              {pricesAreValid ? `${cleaningFee}€` : 'N/A'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>• Tassa di soggiorno ({formValues.adults || 0} adulti × {nights} notti):</span>
            <span className="font-medium text-primary">
              {pricesAreValid ? `${touristTax}€` : 'N/A'}
            </span>
          </div>
          
          <div className="text-xs text-muted-foreground mt-2 italic">
            * Questi costi sono già inclusi nel totale finale
          </div>
        </div>
        
        <Separator className="my-2" />
        
        {/* Pre-discount total */}
        <div className="flex justify-between text-sm">
          <span>Totale prima sconti:</span>
          <span className="font-medium">
            {pricesAreValid ? `${subtotal + cleaningFee + touristTax}€` : 'N/A'}
          </span>
        </div>
        
        {/* Discount (if any) */}
        {discount > 0 && pricesAreValid && (
          <div className="flex justify-between text-sm text-green-600">
            <span className="flex items-center gap-1">
              <Percent className="h-3 w-3" />
              Sconto applicato:
            </span>
            <span className="flex items-center font-medium">
              <Minus className="h-3 w-3 mr-0.5" />-{discount}€
            </span>
          </div>
        )}
        
        {/* Final total to pay */}
        <div className="flex justify-between font-bold text-xl pt-3 border-t-2 border-primary/20 bg-primary/5 p-3 rounded">
          <span>TOTALE DA PAGARE:</span>
          <span className={pricesAreValid ? "text-primary text-2xl" : "text-muted-foreground"}>
            {pricesAreValid ? `${totalToPay}€` : 'Da calcolare'}
          </span>
        </div>
        
        <PaymentBreakdown 
          pricesAreValid={pricesAreValid}
          deposit={deposit}
          totalToPay={totalToPay}
        />
        
        <PricingNotes pricesAreValid={pricesAreValid} />
      </div>
    </div>
  );
}

export default PriceSummary;
