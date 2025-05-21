
import React from "react";
import { format } from "date-fns";
import { it } from 'date-fns/locale';

interface DateDurationInfoProps {
  checkIn: Date;
  checkOut: Date;
  nights: number;
}

const DateDurationInfo: React.FC<DateDurationInfoProps> = ({ checkIn, checkOut, nights }) => {
  // Check if reservation is during high season (June-September)
  const isHighSeason = checkIn ? 
    (checkIn.getMonth() >= 5 && checkIn.getMonth() <= 8) : false;
  
  // Check if check-in is on Saturday
  const isCheckInSaturday = checkIn ? checkIn.getDay() === 6 : false;
  
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <span className="text-muted-foreground">Check-in:</span>
        <span>{checkIn ? format(checkIn, "dd/MM/yyyy", { locale: it }) : "-"}</span>
        <span className="text-muted-foreground">Check-out:</span>
        <span>{checkOut ? format(checkOut, "dd/MM/yyyy", { locale: it }) : "-"}</span>
        <span className="text-muted-foreground">Durata:</span>
        <span>{nights} notti</span>
        
        {isHighSeason && (
          <>
            <span className="text-muted-foreground">Periodo:</span>
            <span className="text-amber-600">Alta stagione</span>
          </>
        )}
        
        {isCheckInSaturday && (
          <>
            <span className="text-muted-foreground">Giorno check-in:</span>
            <span className="text-emerald-600">Sabato</span>
          </>
        )}
      </div>
    </div>
  );
};

export default DateDurationInfo;
