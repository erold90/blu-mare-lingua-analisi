
import React from "react";
import { format } from "date-fns";
import { it } from 'date-fns/locale';
import { CalendarDays } from "lucide-react";

interface DateDurationInfoProps {
  checkIn: Date;
  checkOut: Date;
  nights: number;
}

/**
 * Calcola settimane e notti extra da un numero totale di notti
 */
const calculateWeeksAndExtraNights = (totalNights: number): { weeks: number; extraNights: number } => {
  const weeks = Math.floor(totalNights / 7);
  const extraNights = totalNights % 7;
  return { weeks, extraNights };
};

/**
 * Formatta la durata del soggiorno con settimane e notti extra
 */
const formatDuration = (totalNights: number): string => {
  const { weeks, extraNights } = calculateWeeksAndExtraNights(totalNights);
  
  if (weeks === 0) {
    return `${totalNights} ${totalNights === 1 ? 'notte' : 'notti'}`;
  }
  
  if (extraNights === 0) {
    return `${weeks} ${weeks === 1 ? 'settimana' : 'settimane'}`;
  }
  
  return `${weeks} ${weeks === 1 ? 'settimana' : 'settimane'} + ${extraNights} ${extraNights === 1 ? 'notte' : 'notti'}`;
};

const DateDurationInfo: React.FC<DateDurationInfoProps> = ({ checkIn, checkOut, nights }) => {
  // Check if reservation is during high season (June-September)
  const isHighSeason = checkIn ? 
    (checkIn.getMonth() >= 5 && checkIn.getMonth() <= 8) : false;
  
  // Check if check-in is on Saturday
  const isCheckInSaturday = checkIn ? checkIn.getDay() === 6 : false;
  
  return (
    <div className="space-y-4 bg-white p-4 rounded-lg border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-md">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Check-in:</div>
            <div className="font-medium">{checkIn ? format(checkIn, "EEEE d MMMM yyyy", { locale: it }) : "-"}</div>
            <div className="text-xs text-muted-foreground">Ore 15:00-19:00</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-md">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Check-out:</div>
            <div className="font-medium">{checkOut ? format(checkOut, "EEEE d MMMM yyyy", { locale: it }) : "-"}</div>
            <div className="text-xs text-muted-foreground">Entro le ore 10:00</div>
          </div>
        </div>
      </div>
      
      <div className="pt-3 border-t">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Durata:</span>
          <span className="text-primary font-serif font-semibold text-xl">{nights} notti</span>
        </div>
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>Equivalenti a:</span>
          <span>{formatDuration(nights)}</span>
        </div>
      </div>
      
      {(isHighSeason || isCheckInSaturday) && (
        <div className="pt-3 border-t grid grid-cols-2 gap-4">
          {isHighSeason && (
            <div>
              <span className="text-sm text-muted-foreground">Periodo:</span>
              <p className="text-amber-600 font-medium">Alta stagione</p>
            </div>
          )}
          
          {isCheckInSaturday && (
            <div>
              <span className="text-sm text-muted-foreground">Check-in:</span>
              <p className="text-emerald-600 font-medium">Sabato</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateDurationInfo;
