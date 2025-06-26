
import React from "react";
import { FormValues } from "@/utils/quoteFormSchema";
import { getEffectiveGuestCount } from "@/utils/apartmentRecommendation";
import { Users, Baby, BedDouble, UserCheck } from "lucide-react";

interface GuestInfoProps {
  formValues: FormValues;
}

const GuestInfo: React.FC<GuestInfoProps> = ({ formValues }) => {
  const { totalGuests, effectiveGuestCount, sleepingWithParents, sleepingInCribs } = getEffectiveGuestCount(formValues);

  // Calcola bambini sotto i 12 anni
  const childrenUnder12 = formValues.childrenDetails?.filter(child => child.isUnder12).length || 0;
  const childrenOver12 = (formValues.children || 0) - childrenUnder12;

  return (
    <div className="border rounded-lg p-4 md:p-5 space-y-4 bg-white shadow-sm">
      <div className="flex items-center space-x-2 mb-3">
        <Users className="h-5 w-5 text-primary" />
        <h4 className="font-medium text-lg">Dettagli ospiti</h4>
      </div>
      
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <span className="text-muted-foreground">Adulti:</span>
          <span className="font-semibold">{formValues.adults}</span>
          
          <span className="text-muted-foreground">Bambini:</span>
          <span className="font-semibold">{formValues.children}</span>
        </div>
        
        {/* Dettagli bambini se presenti */}
        {formValues.childrenDetails && formValues.childrenDetails.length > 0 && (
          <div className="space-y-3">
            {/* Breakdown bambini per età */}
            {(childrenUnder12 > 0 || childrenOver12 > 0) && (
              <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2 text-primary text-sm font-medium">
                  <UserCheck className="h-4 w-4" />
                  Età bambini
                </div>
                
                {childrenUnder12 > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sotto i 12 anni:</span>
                    <span className="font-medium text-green-600">{childrenUnder12} (tassa soggiorno gratuita)</span>
                  </div>
                )}
                
                {childrenOver12 > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sopra i 12 anni:</span>
                    <span className="font-medium">{childrenOver12}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Sistemazione speciale */}
            {(sleepingWithParents > 0 || sleepingInCribs > 0) && (
              <div className="bg-yellow-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2 text-amber-700 text-sm font-medium">
                  <BedDouble className="h-4 w-4" />
                  Sistemazione speciale
                </div>
                
                {sleepingWithParents > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dormono con i genitori:</span>
                    <span className="font-medium text-blue-600">{sleepingWithParents} (non occupano posto letto)</span>
                  </div>
                )}
                
                {sleepingInCribs > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dormono in culla:</span>
                    <span className="font-medium text-green-600">{sleepingInCribs} (gratuito)</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Dettaglio per ogni bambino */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 text-gray-700 text-sm font-medium">
                <Baby className="h-4 w-4" />
                Dettagli per bambino
              </div>
              
              {formValues.childrenDetails.map((child, index) => (
                <div key={index} className="text-sm border-l-2 border-gray-300 pl-3">
                  <span className="font-medium text-gray-700">Bambino {index + 1}:</span>
                  <div className="text-xs text-muted-foreground mt-1 space-y-1">
                    {child.isUnder12 ? (
                      <div className="text-green-600">• Sotto i 12 anni (tassa soggiorno gratuita)</div>
                    ) : (
                      <div className="text-gray-600">• Sopra i 12 anni</div>
                    )}
                    
                    {child.sleepsWithParents && (
                      <div className="text-blue-600">• Dorme con i genitori (non occupa posto letto)</div>
                    )}
                    
                    {child.sleepsInCrib && (
                      <div className="text-green-600">• Dorme in culla (gratuito)</div>
                    )}
                    
                    {!child.sleepsWithParents && !child.sleepsInCrib && (
                      <div className="text-gray-600">• Posto letto singolo</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="pt-3 border-t space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-medium">Totale ospiti:</span>
          <span className="font-semibold text-lg">{totalGuests}</span>
        </div>
        
        {(sleepingWithParents > 0 || sleepingInCribs > 0) && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Posti letto effettivi necessari:</span>
            <span className="text-primary font-semibold">{effectiveGuestCount}</span>
          </div>
        )}
        
        {childrenUnder12 > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Bambini esenti tassa soggiorno:</span>
            <span className="text-green-600 font-semibold">{childrenUnder12}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestInfo;
