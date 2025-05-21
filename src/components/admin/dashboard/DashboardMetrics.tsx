
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Brush, Users, EuroIcon } from "lucide-react";

interface DashboardMetricsProps {
  futureReservations: number;
  pendingCleanings: number;
  totalGuests: number;
  totalRevenue: number;
}

// Memoize component to prevent unnecessary re-renders
export const DashboardMetrics: React.FC<DashboardMetricsProps> = React.memo(({
  futureReservations,
  pendingCleanings,
  totalGuests,
  totalRevenue
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Prenotazioni Future */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Prenotazioni Future
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{futureReservations}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Prenotazioni da gestire
          </p>
        </CardContent>
      </Card>
      
      {/* Pulizie da Fare */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pulizie da Fare
          </CardTitle>
          <Brush className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingCleanings}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Attività di pulizia pendenti
          </p>
        </CardContent>
      </Card>
      
      {/* Totale Ospiti */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Totale Ospiti
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalGuests}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Persone ospitate
          </p>
        </CardContent>
      </Card>
      
      {/* Guadagno Totale */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Guadagno Totale
          </CardTitle>
          <EuroIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">€{totalRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Incasso complessivo
          </p>
        </CardContent>
      </Card>
    </div>
  );
});

DashboardMetrics.displayName = "DashboardMetrics";
