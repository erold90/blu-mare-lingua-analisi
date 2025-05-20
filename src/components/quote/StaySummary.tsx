
import React from "react";
import { format } from "date-fns";
import { it } from 'date-fns/locale';
import { DateRange } from "react-day-picker";

interface StaySummaryProps {
  dateRange: DateRange;
  numberOfNights: number;
}

const StaySummary: React.FC<StaySummaryProps> = ({ dateRange, numberOfNights }) => {
  if (!dateRange.from || !dateRange.to) return null;
  
  return (
    <div className="border rounded-lg p-4 bg-muted/30">
      <h3 className="font-semibold mb-2">Riepilogo del soggiorno</h3>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-muted-foreground text-sm">Check-in</p>
          <p className="font-medium">
            {format(dateRange.from, "EEEE d MMMM yyyy", { locale: it })}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground text-sm">Check-out</p>
          <p className="font-medium">
            {format(dateRange.to, "EEEE d MMMM yyyy", { locale: it })}
          </p>
        </div>
      </div>
      <div className="mt-3 border-t pt-2">
        <p className="font-medium">
          Durata del soggiorno: <span className="text-primary">{numberOfNights} notti</span>
        </p>
      </div>
    </div>
  );
};

export default StaySummary;
