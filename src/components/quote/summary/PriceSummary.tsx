
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
import ServiceInclusions from "./pricing/ServiceInclusions";
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
        
        {/* Subtotal before services */}
        <div className="flex justify-between text-sm font-medium">
          <span>Subtotale soggiorno:</span>
          <span>
            {pricesAreValid ? `${subtotal}€` : 'N/A'}
          </span>
        </div>
        
        <ServiceInclusions 
          cleaningFee={cleaningFee}
          touristTax={touristTax}
          nights={nights}
          pricesAreValid={pricesAreValid}
          formValues={formValues}
          sleepingInCribs={sleepingInCribs}
        />
        
        <Separator className="my-2" />
        
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
        <div className="flex justify-between font-bold text-lg pt-2 border-t">
          <span>Totale da pagare:</span>
          <span className={pricesAreValid ? "text-primary" : "text-muted-foreground"}>
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
