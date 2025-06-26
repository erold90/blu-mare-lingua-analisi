
import React from "react";
import { FormValues } from "@/utils/quoteFormSchema";
import { Apartment } from "@/data/apartments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Euro, TrendingDown, Percent, Info, CreditCard } from "lucide-react";
import { calculateTotalPrice } from "@/utils/price/priceCalculator";

interface PricingBreakdownProps {
  formValues: FormValues;
  selectedApartments: Apartment[];
  apartments: Apartment[];
}

const PricingBreakdown: React.FC<PricingBreakdownProps> = ({ 
  formValues, 
  selectedApartments, 
  apartments 
}) => {
  const priceInfo = calculateTotalPrice(formValues, apartments);
  
  const hasOccupancyDiscount = priceInfo.occupancyDiscount && 
    priceInfo.occupancyDiscount.discountAmount > 0;
  
  const hasRoundingDiscount = priceInfo.discount > 0;
  const totalSavings = (priceInfo.occupancyDiscount?.discountAmount || 0) + priceInfo.discount;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Euro className="h-5 w-5 text-primary" />
          Riepilogo prezzi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Period */}
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <Info className="h-4 w-4 mx-auto mb-1 text-blue-600" />
          <div className="text-sm text-blue-700">
            Periodo: dal {typeof formValues.checkIn === 'string' ? formValues.checkIn : formValues.checkIn?.toLocaleDateString()} 
            al {typeof formValues.checkOut === 'string' ? formValues.checkOut : formValues.checkOut?.toLocaleDateString()}
          </div>
        </div>

        {/* Occupancy discount */}
        {hasOccupancyDiscount && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
              <TrendingDown className="h-4 w-4" />
              <span>Sconto Occupazione Applicato</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prezzo listino originale:</span>
                <span className="line-through text-muted-foreground">
                  €{priceInfo.occupancyDiscount!.originalBasePrice}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">
                  {priceInfo.occupancyDiscount!.description}
                </span>
                <span className="font-semibold text-green-700">
                  -€{priceInfo.occupancyDiscount!.discountAmount}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Prezzo base scontato:</span>
                <span className="font-semibold text-green-700">€{priceInfo.basePrice}</span>
              </div>
            </div>
          </div>
        )}

        {/* Base price */}
        <div className="flex justify-between items-center">
          <span className="font-medium">Prezzo base appartamenti:</span>
          <span className="font-semibold text-lg">€{priceInfo.basePrice}</span>
        </div>

        {/* Extra services */}
        {priceInfo.extras > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Servizi extra:</span>
            <span className="font-medium">€{priceInfo.extras}</span>
          </div>
        )}

        <Separator />

        {/* Subtotal */}
        <div className="flex justify-between items-center">
          <span className="font-medium">Subtotale servizi:</span>
          <span className="font-semibold text-lg">€{priceInfo.basePrice + priceInfo.extras}</span>
        </div>

        {/* Included costs */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-primary font-medium mb-2">
            <Info className="h-4 w-4" />
            <span>Costi inclusi nel totale</span>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">• Pulizia finale</span>
              <span>€{priceInfo.cleaningFee}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">• Tassa di soggiorno</span>
              <span>€{priceInfo.touristTax}</span>
            </div>
          </div>
        </div>

        {/* Rounding discount */}
        {hasRoundingDiscount && (
          <div className="flex justify-between items-center text-green-600">
            <span className="flex items-center gap-2 font-medium">
              <Percent className="h-4 w-4" />
              Sconto arrotondamento:
            </span>
            <span className="font-semibold">-€{priceInfo.discount}</span>
          </div>
        )}

        <Separator />

        {/* Total */}
        <div className="bg-primary/5 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xl font-bold text-primary">TOTALE DA PAGARE:</span>
            <span className="text-2xl font-bold text-primary">€{priceInfo.totalAfterDiscount}</span>
          </div>
          
          {totalSavings > 0 && (
            <div className="flex justify-between items-center pt-2 border-t border-primary/20">
              <span className="text-sm text-green-600 font-medium">Risparmio totale:</span>
              <span className="text-lg font-bold text-green-600">-€{totalSavings}</span>
            </div>
          )}
        </div>

        {/* Payment terms */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-gray-700 font-medium mb-2">
            <CreditCard className="h-4 w-4" />
            <span>Modalità di pagamento</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Alla prenotazione (30%):</span>
              <span className="font-semibold">€{priceInfo.deposit}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Al check-in (70%):</span>
              <span className="font-semibold">€{priceInfo.totalAfterDiscount - priceInfo.deposit}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PricingBreakdown;
