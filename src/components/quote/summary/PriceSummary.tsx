
import React from "react";
import { Separator } from "@/components/ui/separator";
import { PriceCalculation } from "@/utils/quoteCalculator";
import { FormValues } from "@/utils/quoteFormSchema";
import { getEffectiveGuestCount } from "@/utils/apartmentRecommendation";

interface PriceSummaryProps {
  priceInfo: PriceCalculation;
  formValues: FormValues;
}

const PriceSummary: React.FC<PriceSummaryProps> = ({ priceInfo, formValues }) => {
  const { sleepingInCribs } = getEffectiveGuestCount(formValues);

  // Check if reservation is during high season (June-September)
  const isHighSeason = formValues.checkIn ? 
    (formValues.checkIn.getMonth() >= 5 && formValues.checkIn.getMonth() <= 8) : false;
    
  // Use the subtotal from the price calculation
  const subtotal = priceInfo.subtotal;

  // The total to pay is the final amount after all discounts
  const totalToPay = priceInfo.totalAfterDiscount;
  
  // The deposit is 30% of the total
  const deposit = priceInfo.deposit;

  return (
    <div className="border rounded-md p-4 space-y-4">
      <h3 className="font-medium">Riepilogo costi</h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {isHighSeason ? 'Costo appartamenti (settimanale):' : `Costo appartamenti (${priceInfo.nights} notti):`}
          </span>
          <span>{priceInfo.basePrice}€</span>
        </div>
        
        {/* Display the cleaning fee */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Pulizia finale:</span>
          <span>{priceInfo.cleaningFee}€ <span className="text-green-600">(inclusa)</span></span>
        </div>
        
        {priceInfo.extras > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Servizi extra:</span>
            <span>{priceInfo.extras}€</span>
          </div>
        )}
        
        {sleepingInCribs > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Culle per bambini ({sleepingInCribs}):</span>
            <span>Gratuito</span>
          </div>
        )}
        
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotale:</span>
          <span>{subtotal}€</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tassa di soggiorno:</span>
          <span>{priceInfo.touristTax}€</span>
        </div>
        
        <Separator className="my-2" />
        <div className="flex justify-between text-sm font-medium">
          <span>Totale con sconto applicato:</span>
          <span className="text-primary">{totalToPay}€</span>
        </div>
        {priceInfo.savings > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Risparmio (sconto + tassa di soggiorno):</span>
            <span>{priceInfo.savings}€</span>
          </div>
        )}
        <Separator className="my-2" />
        <div className="flex justify-between font-semibold text-base pt-2">
          <span>Totale da pagare:</span>
          <span>{totalToPay}€</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Caparra (30%):</span>
          <span>{deposit}€</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Cauzione (restituibile):</span>
          <span>200€</span>
        </div>
      </div>
    </div>
  );
};

export default PriceSummary;
