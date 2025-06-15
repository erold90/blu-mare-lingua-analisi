
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReservations } from "@/hooks/useReservations";
import { CalendarLegend } from "./CalendarLegend";
import { ApartmentCalendar } from "./ApartmentCalendar";
import { ReservationDetailsPopover } from "./ReservationDetailsPopover";
import { RefreshCw, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

const AdminCalendar = () => {
  const { reservations, apartments, refreshData, isLoading } = useReservations();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [showReservationDetails, setShowReservationDetails] = useState(false);

  const handleReservationClick = (reservation: any) => {
    setSelectedReservation(reservation);
    setShowReservationDetails(true);
  };

  const handleRefresh = async () => {
    await refreshData();
  };

  const today = new Date();
  const todayReservations = reservations.filter(res => {
    const startDate = new Date(res.startDate);
    const endDate = new Date(res.endDate);
    return today >= startDate && today <= endDate;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-6 w-6" />
            Calendario Prenotazioni
          </h2>
          <p className="text-muted-foreground">
            Vista dettagliata per ogni appartamento
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={isLoading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Aggiorna
        </Button>
      </div>

      {/* Legenda */}
      <CalendarLegend />

      {/* Statistiche rapide */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Prenotazioni attive oggi</div>
            <div className="text-2xl font-bold text-green-600">{todayReservations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Totale prenotazioni</div>
            <div className="text-2xl font-bold">{reservations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Appartamenti</div>
            <div className="text-2xl font-bold">{apartments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Data selezionata</div>
            <div className="text-lg font-semibold">
              {format(selectedDate, "d MMM", { locale: it })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="grid">Vista Griglia</TabsTrigger>
          <TabsTrigger value="list">Vista Lista</TabsTrigger>
        </TabsList>
        
        <TabsContent value="grid">
          {/* Calendari degli appartamenti */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            {apartments.map((apartment) => (
              <ApartmentCalendar
                key={apartment.id}
                apartment={apartment}
                reservations={reservations}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                onReservationClick={handleReservationClick}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list">
          {/* Vista lista per dispositivi mobili o preferenza utente */}
          <div className="space-y-4">
            {apartments.map((apartment) => {
              const apartmentReservations = reservations.filter(res => 
                res.apartmentIds.includes(apartment.id)
              );
              
              return (
                <Card key={apartment.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {apartment.name}
                      <span className="text-sm font-normal text-muted-foreground">
                        {apartmentReservations.length} prenotazioni
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {apartmentReservations.length > 0 ? (
                        apartmentReservations
                          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                          .slice(0, 5) // Mostra solo le prossime 5
                          .map((reservation) => (
                            <div 
                              key={reservation.id}
                              className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                              onClick={() => handleReservationClick(reservation)}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium">{reservation.guestName}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {format(new Date(reservation.startDate), "d MMM", { locale: it })} - 
                                    {format(new Date(reservation.endDate), "d MMM yyyy", { locale: it })}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">€ {reservation.finalPrice.toFixed(2)}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {reservation.adults} persone
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          Nessuna prenotazione per {apartment.name}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Popup dettagli prenotazione */}
      <ReservationDetailsPopover
        reservation={selectedReservation}
        isOpen={showReservationDetails}
        onClose={() => setShowReservationDetails(false)}
        apartments={apartments}
      />
    </div>
  );
};

export default AdminCalendar;
