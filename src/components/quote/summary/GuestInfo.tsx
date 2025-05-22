
import React from "react";
import { FormValues } from "@/utils/quoteFormSchema";
import { getEffectiveGuestCount } from "@/utils/apartmentRecommendation";
import { Users } from "lucide-react";

interface GuestInfoProps {
  formValues: FormValues;
}

const GuestInfo: React.FC<GuestInfoProps> = ({ formValues }) => {
  const { totalGuests, effectiveGuestCount, sleepingWithParents, sleepingInCribs } = getEffectiveGuestCount(formValues);

  return (
    <div className="border rounded-md p-4 space-y-4 bg-white">
      <div className="flex items-center space-x-2 mb-2">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="font-medium text-lg">Dettagli ospiti</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <span className="text-muted-foreground">Adulti:</span>
        <span className="font-medium">{formValues.adults}</span>
        
        <span className="text-muted-foreground">Bambini:</span>
        <span className="font-medium">{formValues.children}</span>
        
        {sleepingWithParents > 0 && (
          <>
            <span className="text-muted-foreground">Bambini con i genitori:</span>
            <span className="font-medium">{sleepingWithParents}</span>
          </>
        )}
        
        {sleepingInCribs > 0 && (
          <>
            <span className="text-muted-foreground">Bambini in culla:</span>
            <span className="font-medium flex items-center">
              {sleepingInCribs} 
              <span className="text-green-600 ml-2 text-xs font-normal">(gratuito)</span>
            </span>
          </>
        )}
      </div>
      
      <div className="pt-3 border-t flex justify-between items-center">
        <span className="font-medium">Totale ospiti:</span>
        <span className="font-medium">{totalGuests}</span>
      </div>
      
      {(sleepingWithParents > 0 || sleepingInCribs > 0) && (
        <div className="pt-3 border-t flex justify-between items-center">
          <span className="font-medium text-muted-foreground">Posti letto necessari:</span>
          <span className="text-primary font-medium">{effectiveGuestCount}</span>
        </div>
      )}
    </div>
  );
};

export default GuestInfo;
