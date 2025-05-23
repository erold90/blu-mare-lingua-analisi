
import React from "react";
import { format } from "date-fns";
import { it } from 'date-fns/locale';
import { DateRange } from "react-day-picker";
import { CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StaySummaryProps {
  dateRange: DateRange;
  numberOfNights: number;
}

const StaySummary: React.FC<StaySummaryProps> = ({ dateRange, numberOfNights }) => {
  if (!dateRange.from || !dateRange.to) return null;
  
  return (
    <Card className="border shadow-sm bg-white overflow-hidden">
      <div className="p-3 md:p-4 bg-primary/10 border-b">
        <h3 className="font-serif font-semibold text-base md:text-lg text-primary">Riepilogo soggiorno</h3>
      </div>
      
      <div className="p-3 md:p-5 space-y-4 md:space-y-6">
        {/* Check-in date */}
        <div className="flex items-start space-x-3">
          <div className="p-1.5 md:p-2 bg-primary/10 rounded-md flex-shrink-0">
            <CalendarDays className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Check-in:</p>
            <p className="font-medium text-sm md:text-base leading-tight">
              {format(dateRange.from, "EEEE d MMMM yyyy", { locale: it })}
            </p>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">Ore 15:00-19:00</p>
          </div>
        </div>
        
        {/* Check-out date */}
        <div className="flex items-start space-x-3">
          <div className="p-1.5 md:p-2 bg-primary/10 rounded-md flex-shrink-0">
            <CalendarDays className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Check-out:</p>
            <p className="font-medium text-sm md:text-base leading-tight">
              {format(dateRange.to, "EEEE d MMMM yyyy", { locale: it })}
            </p>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">Entro le ore 10:00</p>
          </div>
        </div>
        
        {/* Durata soggiorno */}
        <div className="pt-3 md:pt-4 border-t">
          <div className="flex items-center justify-between">
            <p className="font-medium text-muted-foreground text-sm md:text-base">Durata:</p>
            <p className="text-primary font-serif font-semibold text-lg md:text-xl">
              {numberOfNights} {numberOfNights === 1 ? 'notte' : 'notti'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StaySummary;
