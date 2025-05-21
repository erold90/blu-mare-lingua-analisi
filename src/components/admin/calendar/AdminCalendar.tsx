
import * as React from "react";
import { useState, useMemo } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReservations, Reservation } from "@/hooks/useReservations";
import { Button } from "@/components/ui/button";
import { format, isSameDay } from "date-fns";
import { it } from "date-fns/locale";
import { useIsMobile } from "@/hooks/use-mobile";

const AdminCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<"month" | "day" | "list">("month");
  const { reservations, apartments } = useReservations();
  const isMobile = useIsMobile();
  
  // Funzione per trovare le prenotazioni per una data specifica
  const getReservationsForDate = (date: Date): Reservation[] => {
    return reservations.filter(reservation => {
      const startDate = new Date(reservation.startDate);
      const endDate = new Date(reservation.endDate);
      return date >= startDate && date <= endDate;
    });
  };

  // Mappatura colori per gli appartamenti
  const apartmentColors = useMemo(() => {
    const colors = [
      "bg-blue-500", "bg-green-500", "bg-yellow-500", 
      "bg-purple-500", "bg-pink-500", "bg-indigo-500"
    ];
    
    const colorMap: Record<string, string> = {};
    apartments.forEach((apt, index) => {
      colorMap[apt.id] = colors[index % colors.length];
    });
    
    return colorMap;
  }, [apartments]);
  
  // Aggiungi i giorni speciali al calendario
  const specialDays = useMemo(() => {
    const days: Record<string, { reservations: Reservation[] }> = {};
    
    reservations.forEach(reservation => {
      const start = new Date(reservation.startDate);
      const end = new Date(reservation.endDate);
      
      for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
        const dateKey = format(day, "yyyy-MM-dd");
        if (!days[dateKey]) {
          days[dateKey] = { reservations: [] };
        }
        days[dateKey].reservations.push(reservation);
      }
    });
    
    return days;
  }, [reservations]);
  
  // Calcola le prenotazioni per la data selezionata
  const selectedDateReservations = useMemo(() => {
    return getReservationsForDate(selectedDate);
  }, [selectedDate, reservations]);
  
  // Filtra per appartamento
  const [selectedApartment, setSelectedApartment] = useState<string>("all");
  
  const filteredReservations = useMemo(() => {
    if (selectedApartment === "all") {
      return selectedDateReservations;
    }
    
    return selectedDateReservations.filter(reservation => 
      reservation.apartmentIds.includes(selectedApartment)
    );
  }, [selectedDateReservations, selectedApartment]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Calendario Prenotazioni</h2>
          <p className="text-muted-foreground">
            Visualizza e gestisci tutte le prenotazioni
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Select 
            value={selectedApartment} 
            onValueChange={setSelectedApartment}
          >
            <SelectTrigger className="min-w-[180px]">
              <SelectValue placeholder="Filtra per appartamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti gli appartamenti</SelectItem>
              {apartments.map((apt) => (
                <SelectItem key={apt.id} value={apt.id}>
                  {apt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Tabs value={view} onValueChange={(v) => setView(v as "month" | "day" | "list")}>
            <TabsList className="grid grid-cols-3 w-full sm:w-auto">
              <TabsTrigger value="month">Mese</TabsTrigger>
              <TabsTrigger value="day">Giorno</TabsTrigger>
              <TabsTrigger value="list">Lista</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calendario principale */}
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="w-full"
              modifiersStyles={{
                today: { fontWeight: "bold", color: "var(--primary)" }
              }}
              modifiers={{
                booked: (date) => {
                  const dateKey = format(date, "yyyy-MM-dd");
                  const day = specialDays[dateKey];
                  
                  if (selectedApartment === "all") {
                    return !!day;
                  }
                  
                  return !!day?.reservations.some(r => 
                    r.apartmentIds.includes(selectedApartment)
                  );
                }
              }}
              styles={{
                day: (date) => {
                  const dateStr = format(date, "yyyy-MM-dd");
                  const hasBooking = specialDays[dateStr];
                  
                  if (!hasBooking) return {};
                  
                  if (selectedApartment !== "all") {
                    const hasSelectedApartment = hasBooking.reservations.some(r => 
                      r.apartmentIds.includes(selectedApartment)
                    );
                    
                    if (!hasSelectedApartment) return {};
                  }
                  
                  return {
                    position: "relative",
                    backgroundColor: "var(--accent)",
                    color: "var(--accent-foreground)",
                    borderRadius: "0.375rem"
                  };
                }
              }}
            />
          </CardContent>
        </Card>
        
        {/* Dettaglio del giorno selezionato */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {format(selectedDate, "EEEE d MMMM yyyy", { locale: it })}
            </CardTitle>
            <CardDescription>
              {filteredReservations.length === 0
                ? "Nessuna prenotazione per questa data"
                : `${filteredReservations.length} prenotazioni`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredReservations.map((reservation) => (
                <div 
                  key={reservation.id} 
                  className="p-3 border rounded-md bg-card hover:bg-accent transition-colors"
                >
                  <div className="font-medium">{reservation.guestName}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(reservation.startDate), "d MMM", { locale: it })} - {format(new Date(reservation.endDate), "d MMM", { locale: it })}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {reservation.apartmentIds.map((aptId) => {
                      const apt = apartments.find(a => a.id === aptId);
                      return (
                        <Badge 
                          key={aptId} 
                          className={`${apartmentColors[aptId]} text-white`}
                        >
                          {apt?.name || "Appartamento"}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              ))}
              {filteredReservations.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  Nessuna prenotazione per {format(selectedDate, "d MMMM", { locale: it })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vista mensile */}
      {view === "month" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Occupazione Mensile</CardTitle>
              <CardDescription>
                Panoramica delle prenotazioni del mese corrente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {apartments.map(apartment => {
                  // Calcola il numero di giorni prenotati questo mese
                  const today = new Date();
                  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                  
                  let bookedDays = 0;
                  const daysInMonth = lastDay.getDate();
                  
                  for (let i = 1; i <= daysInMonth; i++) {
                    const currentDay = new Date(today.getFullYear(), today.getMonth(), i);
                    const dateKey = format(currentDay, "yyyy-MM-dd");
                    
                    if (specialDays[dateKey]?.reservations.some(r => 
                      r.apartmentIds.includes(apartment.id)
                    )) {
                      bookedDays++;
                    }
                  }
                  
                  const occupancyRate = Math.round((bookedDays / daysInMonth) * 100);
                  
                  return (
                    <div key={apartment.id} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{apartment.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {bookedDays} giorni su {daysInMonth} prenotati
                        </div>
                      </div>
                      <Badge variant={occupancyRate > 70 ? "default" : "outline"}>
                        {occupancyRate}%
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Prossimi Check-in/Check-out</CardTitle>
              <CardDescription>
                Movimenti previsti nei prossimi giorni
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reservations
                  .filter(res => {
                    const checkIn = new Date(res.startDate);
                    const checkOut = new Date(res.endDate);
                    const today = new Date();
                    
                    // Filtra per i prossimi 7 giorni
                    const next7Days = new Date();
                    next7Days.setDate(today.getDate() + 7);
                    
                    return (checkIn >= today && checkIn <= next7Days) || 
                           (checkOut >= today && checkOut <= next7Days);
                  })
                  .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                  .slice(0, 5)
                  .map(res => {
                    const checkIn = new Date(res.startDate);
                    const checkOut = new Date(res.endDate);
                    const today = new Date();
                    
                    const isCheckInSoon = checkIn >= today && checkIn <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                    const isCheckOutSoon = checkOut >= today && checkOut <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                    
                    return (
                      <div key={res.id} className="p-3 border rounded-md">
                        <div className="font-medium">{res.guestName}</div>
                        <div className="flex flex-col sm:flex-row sm:justify-between text-sm">
                          <div>
                            {res.apartmentIds.map(aptId => {
                              const apt = apartments.find(a => a.id === aptId);
                              return apt?.name;
                            }).join(", ")}
                          </div>
                          <div className="flex gap-2">
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
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Vista giorno */}
      {view === "day" && (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Dettaglio Giornaliero</CardTitle>
              <CardDescription>
                Prenotazioni per {format(selectedDate, "EEEE d MMMM yyyy", { locale: it })}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {apartments.map(apartment => {
                const apartmentReservations = filteredReservations.filter(
                  res => res.apartmentIds.includes(apartment.id)
                );
                
                return (
                  <div key={apartment.id} className="border rounded-lg p-4">
                    <h3 className="font-medium text-lg">{apartment.name}</h3>
                    {apartmentReservations.length > 0 ? (
                      <div className="space-y-2 mt-2">
                        {apartmentReservations.map(res => {
                          const isCheckIn = isSameDay(selectedDate, new Date(res.startDate));
                          const isCheckOut = isSameDay(selectedDate, new Date(res.endDate));
                          
                          return (
                            <div key={res.id} className="p-3 bg-accent rounded-md">
                              <div className="font-medium">{res.guestName}</div>
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(res.startDate), "d MMM", { locale: it })} - {format(new Date(res.endDate), "d MMM", { locale: it })}
                              </div>
                              <div className="flex gap-1 mt-2">
                                {isCheckIn && (
                                  <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                                    Arrivo
                                  </Badge>
                                )}
                                {isCheckOut && (
                                  <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                                    Partenza
                                  </Badge>
                                )}
                                {!isCheckIn && !isCheckOut && (
                                  <Badge variant="outline">In corso</Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-20 flex items-center justify-center text-muted-foreground text-sm">
                        Disponibile
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Vista lista */}
      {view === "list" && (
        <Card>
          <CardHeader>
            <CardTitle>Elenco Prenotazioni</CardTitle>
            <CardDescription>
              Tutte le prenotazioni in ordine cronologico
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reservations.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                  Nessuna prenotazione presente
                </div>
              ) : (
                reservations
                  .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                  .filter(res => {
                    if (selectedApartment === "all") return true;
                    return res.apartmentIds.includes(selectedApartment);
                  })
                  .map(res => {
                    const startDate = new Date(res.startDate);
                    const endDate = new Date(res.endDate);
                    const isUpcoming = startDate > new Date();
                    const isActive = startDate <= new Date() && endDate >= new Date();
                    const isPast = endDate < new Date();
                    
                    return (
                      <div 
                        key={res.id} 
                        className={`p-4 border rounded-md ${
                          isActive ? "border-primary" : 
                          isUpcoming ? "border-green-300" : 
                          "border-gray-200"
                        }`}
                      >
                        <div className="flex flex-col md:flex-row justify-between gap-2">
                          <div>
                            <div className="font-medium">{res.guestName}</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {res.apartmentIds.map((aptId) => {
                                const apt = apartments.find(a => a.id === aptId);
                                return (
                                  <Badge 
                                    key={aptId} 
                                    variant="outline"
                                  >
                                    {apt?.name || "Appartamento"}
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                          <div className="text-sm">
                            <div className="flex flex-col items-start md:items-end gap-1">
                              <span>{format(startDate, "EEEE d MMMM", { locale: it })}</span>
                              <span>→</span>
                              <span>{format(endDate, "EEEE d MMMM", { locale: it })}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <Badge 
                            variant={isActive ? "default" : "outline"}
                            className={`${
                              isActive ? "bg-primary" : 
                              isUpcoming ? "bg-green-50 text-green-600 border-green-200" : 
                              "bg-gray-50"
                            }`}
                          >
                            {isActive ? "In corso" : isUpcoming ? "Futura" : "Completata"}
                          </Badge>
                          <div className="text-sm font-medium">
                            € {res.finalPrice.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminCalendar;
