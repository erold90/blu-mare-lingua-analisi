import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReservations } from "@/hooks/useReservations";
import { Calendar, Building, Users, Euro } from "lucide-react";

const AdminDashboard = () => {
  const { reservations, apartments, loading } = useReservations();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse">Caricamento dashboard...</div>
      </div>
    );
  }

  const today = new Date();
  const activeReservations = reservations.filter(r => {
    const start = new Date(r.startDate);
    const end = new Date(r.endDate);
    return start <= today && end >= today;
  });

  const totalRevenue = reservations.reduce((sum, r) => sum + r.finalPrice, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Panoramica generale della struttura</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prenotazioni Attive</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeReservations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appartamenti</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apartments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale Prenotazioni</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reservations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fatturato Totale</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Prenotazioni Recenti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reservations.slice(0, 5).map((reservation) => (
                <div key={reservation.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{reservation.guestName}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(reservation.startDate).toLocaleDateString()} - 
                      {new Date(reservation.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">€{reservation.finalPrice}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appartamenti Disponibili</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {apartments.map((apartment) => (
                <div key={apartment.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{apartment.name}</p>
                    <p className="text-sm text-gray-500">Capacità: {apartment.capacity} persone</p>
                  </div>
                  <div className="text-sm text-green-600">Disponibile</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;