
import React from "react";
import { FormValues } from "@/utils/quoteFormSchema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Baby, UserCheck, Heart, BedDouble } from "lucide-react";

interface GuestSummaryProps {
  formValues: FormValues;
}

const GuestSummary: React.FC<GuestSummaryProps> = ({ formValues }) => {
  console.log("🔍 GuestSummary: Form values received", formValues);
  console.log("🔍 GuestSummary: Children details", formValues.childrenDetails);
  console.log("🔍 GuestSummary: Children array", formValues.childrenArray);
  
  const adults = formValues.adults || 0;
  const children = formValues.children || 0;
  const totalGuests = adults + children;
  
  // Check both childrenDetails and childrenArray for children data
  const childrenDetails = formValues.childrenDetails || formValues.childrenArray || [];
  console.log("🔍 GuestSummary: Final children details", childrenDetails);

  // Calculate children statistics
  const childrenUnder12 = childrenDetails.filter(child => child?.isUnder12).length;
  const childrenOver12 = children - childrenUnder12;
  const childrenWithParents = childrenDetails.filter(child => child?.sleepsWithParents).length;
  const childrenInCribs = childrenDetails.filter(child => child?.sleepsInCrib).length;

  // Calculate effective bed requirements
  const childrenNotOccupyingBed = childrenWithParents + childrenInCribs;
  const effectiveGuestsForBeds = totalGuests - childrenNotOccupyingBed;

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-primary" />
          Informazioni ospiti
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total guests */}
        <div className="text-center p-4 bg-primary/5 rounded-lg">
          <div className="text-2xl font-bold text-primary mb-1">
            {totalGuests}
          </div>
          <div className="text-sm text-muted-foreground">
            Ospiti totali
          </div>
        </div>
        
        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 border rounded-lg">
            <div className="text-xl font-semibold text-blue-600 mb-1">
              {adults}
            </div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <UserCheck className="h-3 w-3" />
              Adult{adults !== 1 ? 'i' : 'o'}
            </div>
          </div>
          
          <div className="text-center p-3 border rounded-lg">
            <div className="text-xl font-semibold text-green-600 mb-1">
              {children}
            </div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Baby className="h-3 w-3" />
              Bambin{children !== 1 ? 'i' : 'o'}
            </div>
          </div>
        </div>
        
        {/* Children details */}
        {children > 0 && (
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center gap-2 text-primary font-medium">
              <Baby className="h-4 w-4" />
              <span>Dettagli bambini</span>
            </div>
            
            {/* Show children details if available */}
            {childrenDetails.length > 0 ? (
              <>
                {/* Age breakdown */}
                <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                  <div className="text-sm font-medium text-blue-800 mb-2">
                    Classificazione per età:
                  </div>
                  
                  {childrenUnder12 > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">• Sotto i 12 anni:</span>
                      <span className="font-medium text-green-600">
                        {childrenUnder12} (tassa soggiorno gratuita)
                      </span>
                    </div>
                  )}
                  
                  {childrenOver12 > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">• Sopra i 12 anni:</span>
                      <span className="font-medium">{childrenOver12}</span>
                    </div>
                  )}
                </div>
                
                {/* Special arrangements */}
                {(childrenWithParents > 0 || childrenInCribs > 0) && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 space-y-2">
                    <div className="text-sm font-medium text-amber-800 mb-2">
                      Sistemazioni speciali:
                    </div>
                    
                    {childrenWithParents > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          Dormono con i genitori:
                        </span>
                        <span className="font-medium text-blue-600">
                          {childrenWithParents} (non occupano posto letto)
                        </span>
                      </div>
                    )}
                    
                    {childrenInCribs > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <BedDouble className="h-3 w-3" />
                          Dormono in culla:
                        </span>
                        <span className="font-medium text-green-600">
                          {childrenInCribs} (servizio gratuito)
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Individual child details */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-3">
                  <div className="text-sm font-medium text-gray-800 mb-2">
                    Dettaglio per bambino:
                  </div>
                  
                  {childrenDetails.map((child, index) => (
                    <div key={index} className="border-l-2 border-primary/30 pl-3 py-1">
                      <div className="font-medium text-sm text-gray-700 mb-1">
                        Bambino {index + 1}:
                      </div>
                      <div className="text-xs space-y-1">
                        {/* Age */}
                        <div className={`flex items-center gap-1 ${child?.isUnder12 ? 'text-green-600' : 'text-gray-600'}`}>
                          <UserCheck className="h-3 w-3" />
                          {child?.isUnder12 ? 'Sotto i 12 anni (tassa gratuita)' : 'Sopra i 12 anni'}
                        </div>
                        
                        {/* Sleep arrangement */}
                        {child?.sleepsWithParents && (
                          <div className="flex items-center gap-1 text-blue-600">
                            <Heart className="h-3 w-3" />
                            Dorme con i genitori
                          </div>
                        )}
                        
                        {child?.sleepsInCrib && (
                          <div className="flex items-center gap-1 text-green-600">
                            <BedDouble className="h-3 w-3" />
                            Dorme in culla (gratuita)
                          </div>
                        )}
                        
                        {!child?.sleepsWithParents && !child?.sleepsInCrib && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <BedDouble className="h-3 w-3" />
                            Posto letto singolo
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* Show placeholder if no details available */
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="text-sm text-yellow-800 font-medium mb-1">
                  Dettagli bambini
                </div>
                <div className="text-xs text-yellow-700">
                  Completa il primo step per vedere i dettagli specifici sui bambini
                </div>
              </div>
            )}
            
            {/* Summary of bed requirements */}
            <div className="pt-2 border-t space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Posti letto necessari:</span>
                <span className="font-semibold text-primary">
                  {effectiveGuestsForBeds}
                </span>
              </div>
              
              {childrenUnder12 > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Bambini esenti tassa:</span>
                  <span className="font-semibold text-green-600">{childrenUnder12}</span>
                </div>
              )}
              
              {childrenNotOccupyingBed > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Bambini che non occupano letto:</span>
                  <span className="font-semibold text-blue-600">{childrenNotOccupyingBed}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GuestSummary;
