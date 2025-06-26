
import React from "react";
import { FormValues } from "@/utils/quoteFormSchema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, Moon } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { calculateNights } from "@/utils/price/dateUtils";
import { toDateSafe } from "@/utils/price/dateConverter";

interface BookingDatesProps {
  formValues: FormValues;
}

const BookingDates: React.FC<BookingDatesProps> = ({ formValues }) => {
  const checkIn = toDateSafe(formValues.checkIn);
  const checkOut = toDateSafe(formValues.checkOut);
  
  if (!checkIn || !checkOut) return null;
  
  const nights = calculateNights(checkIn, checkOut);
  const weeks = Math.floor(nights / 7);
  const extraNights = nights % 7;
  
  // Check if high season and Saturday check-in
  const isHighSeason = checkIn.getMonth() >= 5 && checkIn.getMonth() <= 8;
  const isSaturday = checkIn.getDay() === 6;

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarDays className="h-5 w-5 text-primary" />
          Date del soggiorno
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Check-in */}
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div>
            <div className="text-sm text-muted-foreground">Check-in</div>
            <div className="font-semibold text-green-800">
              {format(checkIn, "EEEE d MMMM yyyy", { locale: it })}
            </div>
            <div className="text-xs text-muted-foreground">Ore 15:00-19:00</div>
          </div>
          <div className="text-right">
            {isSaturday && (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Sabato
              </Badge>
            )}
          </div>
        </div>
        
        {/* Check-out */}
        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
          <div>
            <div className="text-sm text-muted-foreground">Check-out</div>
            <div className="font-semibold text-red-800">
              {format(checkOut, "EEEE d MMMM yyyy", { locale: it })}
            </div>
            <div className="text-xs text-muted-foreground">Entro le ore 10:00</div>
          </div>
        </div>
        
        {/* Duration */}
        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Durata:
            </span>
            <div className="text-right">
              <div className="text-xl font-bold text-primary">{nights} notti</div>
              {weeks > 0 && (
                <div className="text-sm text-muted-foreground">
                  {weeks} settiman{weeks === 1 ? 'a' : 'e'}
                  {extraNights > 0 && ` + ${extraNights} nott${extraNights === 1 ? 'e' : 'i'}`}
                </div>
              )}
            </div>
          </div>
          
          {/* Period info */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Periodo:</span>
            <Badge variant={isHighSeason ? "default" : "secondary"}>
              {isHighSeason ? "Alta stagione" : "Bassa stagione"}
            </Badge>
          </div>
        </div>
        
        {/* Info note */}
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <Clock className="h-4 w-4 mx-auto mb-1 text-blue-600" />
          <div className="text-xs text-blue-700">
            I prezzi sono calcolati settimanalmente
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingDates;
