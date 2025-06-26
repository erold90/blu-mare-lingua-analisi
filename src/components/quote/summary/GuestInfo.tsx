
import React from "react";
import { FormValues } from "@/utils/quoteFormSchema";
import { getEffectiveGuestCount } from "@/utils/apartmentRecommendation";
import { Users, Baby, BedDouble, UserCheck, Heart } from "lucide-react";

interface GuestInfoProps {
  formValues: FormValues;
}

const GuestInfo: React.FC<GuestInfoProps> = ({ formValues }) => {
  console.log("🔍 GuestInfo: Form values received", formValues);
  console.log("🔍 GuestInfo: Children details", formValues.childrenDetails);
  
  const { totalGuests, effectiveGuestCount, sleepingWithParents, sleepingInCribs } = getEffectiveGuestCount(formValues);

  // Calcola bambini sotto i 12 anni
  const childrenDetails = formValues.childrenDetails || [];
  const childrenUnder12 = childrenDetails.filter(child => child.isUnder12).length;
  const childrenOver12 = (formValues.children || 0) - childrenUnder12;

  return (
    <div className="border rounded-lg p-4 md:p-5 space-y-4 bg-white shadow-sm">
      <div className="flex items-center space-x-2 mb-3">
        <Users className="h-5 w-5 text-primary" />
        <h4 className="font-medium text-lg">Dettagli ospiti</h4>
      </div>
      
      <div className="space-y-4">
        {/* Riepilogo base adulti e bambini */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <span className="text-muted-foreground">Adulti:</span>
          <span className="font-semibold">{formValues.adults || 0}</span>
          
          <span className="text-muted-foreground">Bambini:</span>
          <span className="font-semibold">{formValues.children || 0}</span>
        </div>
        
        {/* Dettagli bambini SE ci sono bambini */}
        {(formValues.children || 0) > 0 && childrenDetails.length > 0 && (
          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center gap-2 text-primary font-medium">
              <Baby className="h-4 w-4" />
              <span>Dettagli bambini</span>
            </div>
            
            {/* Breakdown per età */}
            <div className="bg-blue-50 rounded-lg p-3 space-y-2">
              <div className="text-sm font-medium text-blue-800 mb-2">Classificazione per età:</div>
              
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
            
            {/* Sistemazioni speciali */}
            {(sleepingWithParents > 0 || sleepingInCribs > 0) && (
              <div className="bg-yellow-50 rounded-lg p-3 space-y-2">
                <div className="text-sm font-medium text-amber-800 mb-2">Sistemazioni speciali:</div>
                
                {sleepingWithParents > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      Dormono con i genitori:
                    </span>
                    <span className="font-medium text-blue-600">
                      {sleepingWithParents} (non occupano posto letto)
                    </span>
                  </div>
                )}
                
                {sleepingInCribs > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <BedDouble className="h-3 w-3" />
                      Dormono in culla:
                    </span>
                    <span className="font-medium text-green-600">
                      {sleepingInCribs} (servizio gratuito)
                    </span>
                  </div>
                )}
              </div>
            )}
            
            {/* Dettaglio individuale per ogni bambino */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-3">
              <div className="text-sm font-medium text-gray-800 mb-2">Dettaglio per bambino:</div>
              
              {childrenDetails.map((child, index) => (
                <div key={index} className="border-l-2 border-primary/30 pl-3 py-1">
                  <div className="font-medium text-sm text-gray-700 mb-1">
                    Bambino {index + 1}:
                  </div>
                  <div className="text-xs space-y-1">
                    {/* Età */}
                    <div className={`flex items-center gap-1 ${child.isUnder12 ? 'text-green-600' : 'text-gray-600'}`}>
                      <UserCheck className="h-3 w-3" />
                      {child.isUnder12 ? 'Sotto i 12 anni (tassa gratuita)' : 'Sopra i 12 anni'}
                    </div>
                    
                    {/* Sistemazione */}
                    {child.sleepsWithParents && (
                      <div className="flex items-center gap-1 text-blue-600">
                        <Heart className="h-3 w-3" />
                        Dorme con i genitori
                      </div>
                    )}
                    
                    {child.sleepsInCrib && (
                      <div className="flex items-center gap-1 text-green-600">
                        <BedDouble className="h-3 w-3" />
                        Dorme in culla (gratuita)
                      </div>
                    )}
                    
                    {!child.sleepsWithParents && !child.sleepsInCrib && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <BedDouble className="h-3 w-3" />
                        Posto letto singolo
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Riepilogo totali */}
        <div className="pt-3 border-t space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium">Totale ospiti:</span>
            <span className="font-semibold text-lg text-primary">{totalGuests}</span>
          </div>
          
          {(sleepingWithParents > 0 || sleepingInCribs > 0) && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Posti letto necessari:</span>
              <span className="text-primary font-semibold">{effectiveGuestCount}</span>
            </div>
          )}
          
          {childrenUnder12 > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Bambini esenti tassa:</span>
              <span className="text-green-600 font-semibold">{childrenUnder12}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestInfo;
