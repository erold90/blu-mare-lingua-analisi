
import React from "react";
import { format } from "date-fns";
import { it } from 'date-fns/locale';
import { DateRange } from "react-day-picker";
import { CalendarDays, ArrowRight } from "lucide-react";

interface StaySummaryProps {
  dateRange: DateRange;
  numberOfNights: number;
}

const StaySummary: React.FC<StaySummaryProps> = ({ dateRange, numberOfNights }) => {
  if (!dateRange.from || !dateRange.to) return null;
  
  return (
    <div className="border rounded-lg p-5 bg-secondary/30 shadow-sm">
      <h3 className="font-serif font-semibold text-lg mb-4 text-primary">Riepilogo del soggiorno</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start">
          <div className="p-2 bg-primary/10 rounded-md mr-3">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Check-in</p>
            <p className="font-medium">
              {format(dateRange.from, "EEEE d MMMM yyyy", { locale: it })}
            </p>
          </div>
        </div>
        <div className="flex items-start">
          <div className="p-2 bg-primary/10 rounded-md mr-3">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Check-out</p>
            <p className="font-medium">
              {format(dateRange.to, "EEEE d MMMM yyyy", { locale: it })}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t">
        <p className="font-medium flex items-center gap-1 justify-center">
          Durata del soggiorno: 
          <span className="text-primary font-semibold text-lg ml-1">
            {numberOfNights} notti
          </span>
        </p>
      </div>
    </div>
  );
};

export default StaySummary;
