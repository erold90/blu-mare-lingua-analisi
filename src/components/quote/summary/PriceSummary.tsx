
import React from "react";
import { Separator } from "@/components/ui/separator";
import { PriceCalculation } from "@/utils/price/types";
import { FormValues } from "@/utils/quoteFormSchema";
import { getEffectiveGuestCount } from "@/utils/apartmentRecommendation";
import { Euro, Percent, ReceiptText, Sparkles, PawPrint, BadgeEuro, Minus, AlertCircle, Calendar, Calculator } from "lucide-react";

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
  
  // Calculate price per night
  const pricePerNight = nights > 0 ? Math.round(basePrice / nights) : 0;
  const pricePerWeek = weeks > 0 ? Math.round(basePrice / weeks) : 0;
  
  // Calculate extra services (animals and extra linen)
  const extraServices = priceInfo.extras;
  const showExtraServices = extraServices > 0;
  
  // Get cleaning fee and tourist tax - these are ONLY for display
  const cleaningFee = priceInfo.cleaningFee;
  const touristTax = priceInfo.touristTax;
  
  // Calculate taxable guests for tourist tax display
  const adults = formValues.adults || 0;
  const childrenDetails = formValues.childrenDetails || [];
  const childrenOver12 = childrenDetails.filter(child => !child.isUnder12).length;
  const taxableGuests = adults + childrenOver12;
  
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
      return `Prezzo base appartamenti:`;
    } else {
      return `Prezzo base appartamento:`;
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
      
      {/* Periodo e durata per chiarezza */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 bg-blue-50 rounded">
        <Calendar className="h-4 w-4" />
        <span>
          {formValues.checkIn?.toLocaleDateString('it-IT')} - {formValues.checkOut?.toLocaleDateString('it-IT')}
        </span>
      </div>
      
      <div className="space-y-3">
        {/* Apartment cost - base price con breakdown */}
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
        </div>
        
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
        
        {/* Extra services (if any) */}
        {showExtraServices && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Servizi extra:</span>
            <span className="font-medium">{extraServices}€</span>
          </div>
        )}
        
        <Separator className="my-2" />
        
        {/* Subtotal before services */}
        <div className="flex justify-between text-sm font-medium">
          <span>Subtotale soggiorno:</span>
          <span>
            {pricesAreValid ? `${subtotal}€` : 'N/A'}
          </span>
        </div>
        
        {/* Services inclusi */}
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
        
        {/* Payment breakdown */}
        {pricesAreValid && (
          <div className="space-y-2 mt-3 p-3 bg-gray-50 rounded">
            <div className="text-xs font-medium text-muted-foreground mb-2">Modalità di pagamento:</div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">📅 Alla prenotazione (30%):</span>
              <span className="font-medium text-primary">{deposit}€</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">🏠 All'arrivo (saldo):</span>
              <span className="font-medium">{totalToPay - deposit}€</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">🛡️ Cauzione (restituibile):</span>
              <span className="font-medium">200€</span>
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
