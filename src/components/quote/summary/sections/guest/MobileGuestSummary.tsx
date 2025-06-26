
import React from "react";
import { FormValues } from "@/utils/quoteFormSchema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Baby, Bed } from "lucide-react";

interface MobileGuestSummaryProps {
  formValues: FormValues;
}

const MobileGuestSummary: React.FC<MobileGuestSummaryProps> = ({ formValues }) => {
  const adults = formValues.adults || 0;
  const children = formValues.children || 0;
  const totalGuests = adults + children;
  
  // Get children details
  const childrenDetails = formValues.childrenDetails || formValues.childrenArray || [];
  
  // Calculate simplified stats
  const childrenUnder12 = childrenDetails.filter(child => child?.isUnder12).length;
  const childrenWithParents = childrenDetails.filter(child => child?.sleepsWithParents).length;
  const childrenInCribs = childrenDetails.filter(child => child?.sleepsInCrib).length;
  const childrenNotOccupyingBed = childrenWithParents + childrenInCribs;
  const effectiveGuestsForBeds = totalGuests - childrenNotOccupyingBed;

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-primary" />
          Ospiti
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Totale ospiti - più prominente */}
        <div className="text-center p-3 bg-primary/5 rounded-lg">
          <div className="text-xl font-bold text-primary mb-1">
            {totalGuests}
          </div>
          <div className="text-xs text-muted-foreground">
            Ospiti totali
          </div>
        </div>
        
        {/* Breakdown semplificato */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-center p-2 border rounded">
            <div className="font-semibold text-blue-600">{adults}</div>
            <div className="text-xs text-muted-foreground">Adult{adults !== 1 ? 'i' : 'o'}</div>
          </div>
          <div className="text-center p-2 border rounded">
            <div className="font-semibold text-green-600">{children}</div>
            <div className="text-xs text-muted-foreground">Bambin{children !== 1 ? 'i' : 'o'}</div>
          </div>
        </div>
        
        {/* Info posti letto se diverso dal totale */}
        {effectiveGuestsForBeds !== totalGuests && (
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <Bed className="h-3 w-3" />
                Posti letto necessari:
              </span>
              <span className="font-semibold text-primary">{effectiveGuestsForBeds}</span>
            </div>
            {childrenNotOccupyingBed > 0 && (
              <div className="text-xs text-muted-foreground mt-1">
                {childrenNotOccupyingBed} bambino/i non occupa posto letto
              </div>
            )}
          </div>
        )}
        
        {/* Info bambini semplificata - solo se ci sono bambini */}
        {children > 0 && childrenDetails.length > 0 && (
          <div className="bg-yellow-50 rounded-lg p-3">
            <div className="flex items-center gap-1 text-amber-800 font-medium text-sm mb-2">
              <Baby className="h-3 w-3" />
              Dettagli bambini
            </div>
            <div className="space-y-1 text-xs">
              {childrenUnder12 > 0 && (
                <div className="text-green-700">
                  • {childrenUnder12} sotto i 12 anni (tassa gratuita)
                </div>
              )}
              {childrenWithParents > 0 && (
                <div className="text-blue-700">
                  • {childrenWithParents} dorme con i genitori
                </div>
              )}
              {childrenInCribs > 0 && (
                <div className="text-green-700">
                  • {childrenInCribs} in culla (gratuita)
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MobileGuestSummary;
