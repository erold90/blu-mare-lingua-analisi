
import React from "react";
import { format } from "date-fns";
import { it } from 'date-fns/locale';
import { CalendarDays } from "lucide-react";

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
    <div className="space-y-4 bg-white p-4 rounded-lg border">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-md">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Check-in:</div>
            <div className="font-medium">{checkIn ? format(checkIn, "EEEE d MMMM yyyy", { locale: it }) : "-"}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-md">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Check-out:</div>
            <div className="font-medium">{checkOut ? format(checkOut, "dd/MM/yyyy", { locale: it }) : "-"}</div>
          </div>
        </div>
      </div>
      
      <div className="pt-3 border-t flex justify-between items-center">
        <span className="font-medium">Durata:</span>
        <span className="text-primary font-serif font-semibold text-xl">{nights} notti</span>
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
              <span className="text-sm text-muted-foreground">Giorno check-in:</span>
              <p className="text-emerald-600 font-medium">Sabato</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateDurationInfo;
