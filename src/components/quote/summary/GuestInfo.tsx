
import React from "react";
import { FormValues } from "@/utils/quoteFormSchema";
import { getEffectiveGuestCount } from "@/utils/apartmentRecommendation";
import { Users, Baby, BedDouble } from "lucide-react";

interface GuestInfoProps {
  formValues: FormValues;
}

const GuestInfo: React.FC<GuestInfoProps> = ({ formValues }) => {
  const { totalGuests, effectiveGuestCount, sleepingWithParents, sleepingInCribs } = getEffectiveGuestCount(formValues);

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
          <div className="bg-blue-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-primary text-sm font-medium">
              <Baby className="h-4 w-4" />
              Dettagli bambini
            </div>
            
            {formValues.childrenDetails.map((child, index) => (
              <div key={index} className="text-sm">
                <span className="font-medium">Bambino {index + 1}:</span>
                <div className="ml-2 text-muted-foreground">
                  {child.isUnder12 && <span className="mr-2">• Sotto i 12 anni</span>}
                  {child.sleepsWithParents && <span className="mr-2 text-blue-600">• Dorme con i genitori</span>}
                  {child.sleepsInCrib && <span className="mr-2 text-green-600">• Necessita di culla</span>}
                  {!child.isUnder12 && !child.sleepsWithParents && !child.sleepsInCrib && <span className="text-muted-foreground">• Standard</span>}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {(sleepingWithParents > 0 || sleepingInCribs > 0) && (
          <div className="bg-yellow-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-amber-700 text-sm font-medium">
              <BedDouble className="h-4 w-4" />
              Sistemazione speciale
            </div>
            
            {sleepingWithParents > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Con i genitori (non occupano posto letto):</span>
                <span className="font-medium text-blue-600">{sleepingWithParents}</span>
              </div>
            )}
            
            {sleepingInCribs > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">In culla (gratuito, non occupano posto letto):</span>
                <span className="font-medium text-green-600">{sleepingInCribs}</span>
              </div>
            )}
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
            <span className="text-sm text-muted-foreground">Posti letto necessari:</span>
            <span className="text-primary font-semibold">{effectiveGuestCount}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestInfo;
