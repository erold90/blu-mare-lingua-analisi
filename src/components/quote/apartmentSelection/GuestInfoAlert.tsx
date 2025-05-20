
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users as UsersIcon } from "lucide-react";
import { FormValues } from "@/utils/quoteFormSchema";
import { getEffectiveGuestCount } from "@/utils/apartmentRecommendation";

interface GuestInfoAlertProps {
  formValues: FormValues;
}

const GuestInfoAlert: React.FC<GuestInfoAlertProps> = ({ formValues }) => {
  const { totalGuests, effectiveGuestCount, sleepingWithParents, sleepingInCribs } = getEffectiveGuestCount(formValues);

  return (
    <Alert variant="default" className="bg-blue-50 border-blue-200 mb-4">
      <UsersIcon className="h-4 w-4 text-blue-500 shrink-0" />
      <AlertDescription className="text-blue-700 text-balance whitespace-normal">
        {sleepingWithParents > 0 || sleepingInCribs > 0 ? (
          <div className="flex flex-col w-full max-w-full">
            <span className="w-full text-balance">
              Il tuo gruppo è di {totalGuests} ospiti ({formValues.adults} adulti, {formValues.children} bambini)
            </span>
            {sleepingWithParents > 0 && (
              <span className="w-full text-balance">
                di cui {sleepingWithParents} {sleepingWithParents === 1 ? 'bambino dorme' : 'bambini dormono'} con i genitori
              </span>
            )}
            {sleepingInCribs > 0 && (
              <span className="w-full text-balance">
                {sleepingInCribs} {sleepingInCribs === 1 ? 'bambino dorme' : 'bambini dormono'} in culla
              </span>
            )}
            <span className="font-medium mt-1 w-full text-balance">
              Posti letto necessari: {effectiveGuestCount}
            </span>
          </div>
        ) : (
          <span className="w-full text-balance">
            Il tuo gruppo è di {totalGuests} ospiti ({formValues.adults} adulti, {formValues.children} bambini)
          </span>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default GuestInfoAlert;
