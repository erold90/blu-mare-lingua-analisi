
import React from "react";
import { DateRange } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Moon } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface StaySummaryProps {
  dateRange: DateRange;
  numberOfNights: number;
}

const StaySummary: React.FC<StaySummaryProps> = ({ dateRange, numberOfNights }) => {
  if (!dateRange.from || !dateRange.to) {
    return null;
  }

  return (
    <Card className="h-full bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-primary">
          <CalendarDays className="h-5 w-5" />
          Riepilogo Soggiorno
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Check-in */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Check-in:</span>
          <div className="text-right">
            <div className="font-semibold">
              {format(dateRange.from, "EEEE d MMMM", { locale: it })}
            </div>
            <div className="text-xs text-muted-foreground">
              {format(dateRange.from, "yyyy")}
            </div>
          </div>
        </div>
        
        {/* Check-out */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Check-out:</span>
          <div className="text-right">
            <div className="font-semibold">
              {format(dateRange.to, "EEEE d MMMM", { locale: it })}
            </div>
            <div className="text-xs text-muted-foreground">
              {format(dateRange.to, "yyyy")}
            </div>
          </div>
        </div>
        
        {/* Duration */}
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Moon className="h-4 w-4" />
            Durata:
          </span>
          <Badge variant="secondary" className="font-semibold">
            {numberOfNights} {numberOfNights === 1 ? 'notte' : 'notti'}
          </Badge>
        </div>
        
        {/* Info */}
        <div className="bg-white/50 rounded-md p-3 text-xs text-center text-muted-foreground">
          <Clock className="h-4 w-4 mx-auto mb-1" />
          I prezzi sono calcolati settimanalmente
        </div>
      </CardContent>
    </Card>
  );
};

export default StaySummary;
