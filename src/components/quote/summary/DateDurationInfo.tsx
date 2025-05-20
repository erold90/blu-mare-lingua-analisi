
import React from "react";
import { format } from "date-fns";
import { FormValues } from "@/utils/quoteFormSchema";
import { PriceCalculation } from "@/utils/quoteCalculator";

interface DateDurationInfoProps {
  formValues: FormValues;
  priceInfo: PriceCalculation;
}

const DateDurationInfo: React.FC<DateDurationInfoProps> = ({ formValues, priceInfo }) => {
  // Check if reservation is during high season (June-September)
  const isHighSeason = formValues.checkIn ? 
    (formValues.checkIn.getMonth() >= 5 && formValues.checkIn.getMonth() <= 8) : false;
  
  // Check if check-in is on Saturday
  const isCheckInSaturday = formValues.checkIn ? formValues.checkIn.getDay() === 6 : false;
  
  return (
    <div className="border rounded-md p-4 space-y-2">
      <h3 className="font-medium">Date del soggiorno</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <span className="text-muted-foreground">Check-in:</span>
        <span>{formValues.checkIn ? format(formValues.checkIn, "dd/MM/yyyy") : "-"}</span>
        <span className="text-muted-foreground">Check-out:</span>
        <span>{formValues.checkOut ? format(formValues.checkOut, "dd/MM/yyyy") : "-"}</span>
        <span className="text-muted-foreground">Durata:</span>
        <span>{priceInfo.nights} notti</span>
      </div>
    </div>
  );
};

export default DateDurationInfo;
