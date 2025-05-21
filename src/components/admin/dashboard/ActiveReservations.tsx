
import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Reservation, Apartment } from "@/hooks/useReservations";

interface ActiveReservationsProps {
  activeReservations: Reservation[];
  apartments: Apartment[];
}

export const ActiveReservations: React.FC<ActiveReservationsProps> = ({ 
  activeReservations, 
  apartments 
}) => {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Prenotazioni Attive</CardTitle>
        <CardDescription>Ospiti attualmente presenti</CardDescription>
      </CardHeader>
      <CardContent>
        {activeReservations.length > 0 ? (
          <div className="space-y-4">
            {activeReservations.map(res => (
              <div key={res.id} className="flex flex-col border rounded-md p-4">
                <div className="flex flex-col md:flex-row justify-between">
                  <div>
                    <div className="font-medium">{res.guestName}</div>
                    <div className="text-sm text-muted-foreground">
                      {res.adults} adulti, {res.children} bambini
                      {res.cribs > 0 && `, ${res.cribs} culle`}
                    </div>
                  </div>
                  <div className="text-sm mt-2 md:mt-0">
                    <div className="font-medium">
                      {format(new Date(res.startDate), "d MMM", { locale: it })} - {format(new Date(res.endDate), "d MMM", { locale: it })}
                    </div>
                    <div className="text-muted-foreground text-right">
                      € {res.finalPrice.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {res.apartmentIds.map(aptId => {
                    const apt = apartments.find(a => a.id === aptId);
                    return apt && (
                      <Badge key={aptId} variant="outline">
                        {apt.name}
                      </Badge>
                    );
                  })}
                  {res.hasPets && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
                      Animali
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center p-8 text-muted-foreground">
            Nessuna prenotazione attiva oggi
          </div>
        )}
      </CardContent>
    </Card>
  );
};
