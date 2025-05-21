
import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, addDays } from "date-fns";
import { it } from "date-fns/locale";
import { Reservation, Apartment } from "@/hooks/useReservations";
import { useIsMobile } from "@/hooks/use-mobile";

interface UpcomingMovementsProps {
  upcomingMovements: Reservation[];
  apartments: Apartment[];
}

export const UpcomingMovements: React.FC<UpcomingMovementsProps> = ({ upcomingMovements, apartments }) => {
  const isMobile = useIsMobile();
  
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Prossimi Movimenti</CardTitle>
        <CardDescription>Check-in e check-out nei prossimi 7 giorni</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`grid grid-cols-1 ${isMobile ? "" : "md:grid-cols-2 lg:grid-cols-3"} gap-4`}>
          {upcomingMovements.map(res => {
            const checkIn = new Date(res.startDate);
            const checkOut = new Date(res.endDate);
            const today = new Date();
            
            const isCheckInSoon = checkIn >= today && checkIn <= addDays(today, 7);
            const isCheckOutSoon = checkOut >= today && checkOut <= addDays(today, 7);
            
            return (
              <div key={res.id} className="border rounded-md p-4">
                <div className="font-medium">{res.guestName}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {res.apartmentIds.map(aptId => {
                    const apt = apartments.find(a => a.id === aptId);
                    return apt?.name;
                  }).join(", ")}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {isCheckInSoon && (
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                      Check-in {format(checkIn, "d MMM", { locale: it })}
                    </Badge>
                  )}
                  {isCheckOutSoon && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                      Check-out {format(checkOut, "d MMM", { locale: it })}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
          {upcomingMovements.length === 0 && (
            <div className="col-span-full p-8 text-center text-muted-foreground">
              Nessun movimento previsto nei prossimi 7 giorni
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
