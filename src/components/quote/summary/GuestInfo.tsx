
import React from "react";
import { FormValues } from "@/utils/quoteFormSchema";
import { getEffectiveGuestCount } from "@/utils/apartmentRecommendation";

interface GuestInfoProps {
  formValues: FormValues;
}

const GuestInfo: React.FC<GuestInfoProps> = ({ formValues }) => {
  const { totalGuests, effectiveGuestCount, sleepingWithParents, sleepingInCribs } = getEffectiveGuestCount(formValues);

  return (
    <div className="border rounded-md p-4 space-y-2">
      <h3 className="font-medium">Ospiti</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <span className="text-muted-foreground">Adulti:</span>
        <span>{formValues.adults}</span>
        <span className="text-muted-foreground">Bambini:</span>
        <span>{formValues.children}</span>
        
        {sleepingWithParents > 0 && (
          <>
            <span className="text-muted-foreground">Bambini che dormono con i genitori:</span>
            <span>{sleepingWithParents}</span>
          </>
        )}
        
        {sleepingInCribs > 0 && (
          <>
            <span className="text-muted-foreground">Bambini in culla:</span>
            <span>{sleepingInCribs} <span className="text-green-600">(gratuito)</span></span>
          </>
        )}
        
        <span className="text-muted-foreground">Totale ospiti:</span>
        <span>{totalGuests}</span>
        
        {(sleepingWithParents > 0 || sleepingInCribs > 0) && (
          <>
            <span className="text-muted-foreground font-medium">Posti letto effettivi necessari:</span>
            <span className="font-medium">{effectiveGuestCount}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default GuestInfo;
