
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
      <div className="p-4 bg-primary/10 border-b">
        <h3 className="font-serif font-semibold text-lg text-primary">Riepilogo del soggiorno</h3>
      </div>
      
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Check-in date */}
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-primary/10 rounded-md">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Check-in:</p>
              <p className="font-medium text-lg">
                {format(dateRange.from, "EEEE d MMMM yyyy", { locale: it })}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Dalle ore 15:00 alle 19:00</p>
            </div>
          </div>
          
          {/* Check-out date */}
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-primary/10 rounded-md">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Check-out:</p>
              <p className="font-medium text-lg">
                {format(dateRange.to, "EEEE d MMMM yyyy", { locale: it })}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Entro le ore 10:00</p>
            </div>
          </div>
        </div>
        
        {/* Durata soggiorno */}
        <div className="mt-6 pt-5 border-t">
          <div className="flex items-center justify-between">
            <p className="font-medium text-muted-foreground">Durata del soggiorno:</p>
            <p className="text-primary font-serif font-semibold text-xl">
              {numberOfNights} {numberOfNights === 1 ? 'notte' : 'notti'}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StaySummary;
