
import React from "react";
import { Separator } from "@/components/ui/separator";
import { PriceCalculation } from "@/utils/price/types";
import { FormValues } from "@/utils/quoteFormSchema";
import { getEffectiveGuestCount } from "@/utils/apartmentRecommendation";
import { Euro, Percent, Minus, Info } from "lucide-react";

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
    <div className="border rounded-lg p-4 md:p-6 space-y-6 bg-white shadow-sm">
      <div className="flex items-center gap-2 pb-2">
        <Euro className="h-5 w-5 text-primary" /> 
        <h3 className="text-lg font-semibold text-primary">Dettagli prezzo</h3>
      </div>
      
      <PriceValidityWarning pricesAreValid={pricesAreValid} />
      
      <PeriodInfo checkIn={formValues.checkIn} checkOut={formValues.checkOut} />
      
      <div className="space-y-4">
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
        
        <Separator className="my-4" />
        
        {/* Subtotal before mandatory services */}
        <div className="flex justify-between items-center py-2">
          <span className="font-medium">Subtotale servizi:</span>
          <span className="font-semibold text-lg">
            {pricesAreValid ? `${subtotal}€` : 'N/A'}
          </span>
        </div>
        
        {/* Mandatory additional costs - More compact version */}
        <div className="bg-blue-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-primary font-medium">
            <Info className="h-4 w-4" />
            <span className="text-sm">Costi inclusi nel totale</span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">• Pulizia finale</span>
              <span className="font-medium">
                {pricesAreValid ? `${cleaningFee}€` : 'N/A'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">• Tassa di soggiorno</span>
              <span className="font-medium">
                {pricesAreValid ? `${touristTax}€` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Discount (if any) */}
        {discount > 0 && pricesAreValid && (
          <div className="flex justify-between items-center py-2 text-green-600">
            <span className="flex items-center gap-2 font-medium">
              <Percent className="h-4 w-4" />
              Sconto applicato
            </span>
            <span className="flex items-center font-semibold text-lg">
              <Minus className="h-4 w-4 mr-1" />
              {discount}€
            </span>
          </div>
        )}
        
        <Separator className="my-4" />
        
        {/* Final total to pay - More prominent */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 md:p-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-muted-foreground uppercase tracking-wide">
                Totale da pagare
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {nights} notti • {formValues.adults} adulti
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl md:text-3xl font-bold ${pricesAreValid ? "text-primary" : "text-muted-foreground"}`}>
                {pricesAreValid ? `${totalToPay}€` : 'Da calcolare'}
              </div>
              {pricesAreValid && (
                <div className="text-xs text-muted-foreground">
                  ~{Math.round(totalToPay / nights)}€ per notte
                </div>
              )}
            </div>
          </div>
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
