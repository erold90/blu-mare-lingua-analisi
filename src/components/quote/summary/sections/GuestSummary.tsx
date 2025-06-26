
import React from "react";
import { FormValues } from "@/utils/quoteFormSchema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Users, Baby, Bed, ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface GuestSummaryProps {
  formValues: FormValues;
}

const GuestSummary: React.FC<GuestSummaryProps> = ({ formValues }) => {
  const isMobile = useIsMobile();
  
  const adults = formValues.adults || 0;
  const children = formValues.children || 0;
  const totalGuests = adults + children;
  
  // Get children details
  const childrenDetails = formValues.childrenDetails || formValues.childrenArray || [];
  
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
      <CardHeader className={isMobile ? "pb-3" : "pb-4"}>
        <CardTitle className={`flex items-center gap-2 ${isMobile ? "text-base" : "text-lg"}`}>
          <Users className={`${isMobile ? "h-4 w-4" : "h-5 w-5"} text-primary`} />
          Informazioni ospiti
        </CardTitle>
      </CardHeader>
      <CardContent className={isMobile ? "space-y-3" : "space-y-4"}>
        {/* Totale ospiti - sempre visibile e prominente */}
        <div className={`text-center ${isMobile ? "p-3" : "p-4"} bg-primary/5 rounded-lg`}>
          <div className={`${isMobile ? "text-xl" : "text-2xl"} font-bold text-primary mb-1`}>
            {totalGuests}
          </div>
          <div className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
            Ospiti totali
          </div>
        </div>

        {/* Breakdown base - sempre visibile */}
        <div className={`grid grid-cols-2 gap-${isMobile ? "2" : "4"}`}>
          <div className={`text-center ${isMobile ? "p-2" : "p-3"} border rounded-lg`}>
            <div className={`${isMobile ? "text-lg" : "text-xl"} font-semibold text-blue-600 mb-1`}>
              {adults}
            </div>
            <div className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
              Adult{adults !== 1 ? 'i' : 'o'}
            </div>
          </div>
          
          <div className={`text-center ${isMobile ? "p-2" : "p-3"} border rounded-lg`}>
            <div className={`${isMobile ? "text-lg" : "text-xl"} font-semibold text-green-600 mb-1`}>
              {children}
            </div>
            <div className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>
              Bambin{children !== 1 ? 'i' : 'o'}
            </div>
          </div>
        </div>

        {/* Posti letto necessari - se diverso dal totale */}
        {effectiveGuestsForBeds !== totalGuests && (
          <div className="bg-blue-50 rounded-lg p-3">
            <div className={`flex items-center justify-between ${isMobile ? "text-sm" : "text-base"}`}>
              <span className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                Posti letto necessari:
              </span>
              <span className="font-semibold text-primary">{effectiveGuestsForBeds}</span>
            </div>
          </div>
        )}

        {/* Dettagli espandibili - SOLO se ci sono bambini */}
        {children > 0 && childrenDetails.length > 0 && (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="child-details" className="border rounded-lg">
              <AccordionTrigger className={`px-4 ${isMobile ? "py-2 text-sm" : "py-3"} hover:no-underline`}>
                <div className="flex items-center gap-2">
                  <Baby className="h-4 w-4 text-amber-600" />
                  <span className="font-medium text-amber-800">Dettagli bambini</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3">
                <div className="space-y-3">
                  {/* Classificazione per età */}
                  <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                    <div className={`font-medium text-blue-800 ${isMobile ? "text-xs" : "text-sm"}`}>
                      Classificazione per età:
                    </div>
                    
                    {childrenUnder12 > 0 && (
                      <div className={`flex justify-between ${isMobile ? "text-xs" : "text-sm"}`}>
                        <span className="text-muted-foreground">• Sotto i 12 anni:</span>
                        <span className="font-medium text-green-600">
                          {childrenUnder12} (tassa gratuita)
                        </span>
                      </div>
                    )}
                    
                    {childrenOver12 > 0 && (
                      <div className={`flex justify-between ${isMobile ? "text-xs" : "text-sm"}`}>
                        <span className="text-muted-foreground">• Sopra i 12 anni:</span>
                        <span className="font-medium">{childrenOver12}</span>
                      </div>
                    )}
                  </div>

                  {/* Sistemazioni speciali */}
                  {(childrenWithParents > 0 || childrenInCribs > 0) && (
                    <div className="bg-yellow-50 rounded-lg p-3 space-y-2">
                      <div className={`font-medium text-amber-800 ${isMobile ? "text-xs" : "text-sm"}`}>
                        Sistemazioni speciali:
                      </div>
                      
                      {childrenWithParents > 0 && (
                        <div className={`flex justify-between ${isMobile ? "text-xs" : "text-sm"}`}>
                          <span className="text-muted-foreground">• Con i genitori:</span>
                          <span className="font-medium text-blue-600">
                            {childrenWithParents} (no posto letto)
                          </span>
                        </div>
                      )}
                      
                      {childrenInCribs > 0 && (
                        <div className={`flex justify-between ${isMobile ? "text-xs" : "text-sm"}`}>
                          <span className="text-muted-foreground">• In culla:</span>
                          <span className="font-medium text-green-600">
                            {childrenInCribs} (gratuita)
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Dettaglio individuale */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className={`font-medium text-gray-800 mb-2 ${isMobile ? "text-xs" : "text-sm"}`}>
                      Dettaglio per bambino:
                    </div>
                    
                    <div className="space-y-2">
                      {childrenDetails.map((child, index) => (
                        <div key={index} className="border-l-2 border-primary/30 pl-3 py-1">
                          <div className={`font-medium text-gray-700 ${isMobile ? "text-xs" : "text-sm"}`}>
                            Bambino {index + 1}:
                          </div>
                          <div className={`space-y-1 ${isMobile ? "text-xs" : "text-sm"}`}>
                            <div className={child.isUnder12 ? 'text-green-600' : 'text-gray-600'}>
                              • {child.isUnder12 ? 'Sotto i 12 anni (tassa gratuita)' : 'Sopra i 12 anni'}
                            </div>
                            
                            {child.sleepsWithParents && (
                              <div className="text-blue-600">• Dorme con i genitori</div>
                            )}
                            
                            {child.sleepsInCrib && (
                              <div className="text-green-600">• Dorme in culla (gratuita)</div>
                            )}
                            
                            {!child.sleepsWithParents && !child.sleepsInCrib && (
                              <div className="text-gray-600">• Posto letto singolo</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {/* Riepilogo finale essenziale */}
        <div className="pt-2 border-t space-y-2">
          {childrenUnder12 > 0 && (
            <div className={`flex justify-between items-center ${isMobile ? "text-sm" : "text-base"}`}>
              <span className="text-muted-foreground">Bambini esenti tassa:</span>
              <span className="font-semibold text-green-600">{childrenUnder12}</span>
            </div>
          )}
          
          {childrenNotOccupyingBed > 0 && (
            <div className={`flex justify-between items-center ${isMobile ? "text-sm" : "text-base"}`}>
              <span className="text-muted-foreground">Non occupano letto:</span>
              <span className="font-semibold text-blue-600">{childrenNotOccupyingBed}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GuestSummary;
