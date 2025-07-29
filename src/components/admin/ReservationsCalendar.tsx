import React, { useState, useMemo } from 'react';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { apartments } from '@/data/apartments';

interface Reservation {
  id: string;
  guest_name: string;
  start_date: string;
  end_date: string;
  apartment_ids: string[];
  adults: number;
  children: number;
  payment_status?: string;
}

interface ReservationsCalendarProps {
  reservations: Reservation[];
}

const DAYS_TO_SHOW = 14; // Due settimane

export const ReservationsCalendar: React.FC<ReservationsCalendarProps> = ({ reservations }) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Genera i giorni da mostrare
  const days = useMemo(() => {
    const daysArray = [];
    for (let i = 0; i < DAYS_TO_SHOW; i++) {
      daysArray.push(addDays(currentWeekStart, i));
    }
    return daysArray;
  }, [currentWeekStart]);

  // Naviga settimane
  const goToPreviousWeek = () => {
    setCurrentWeekStart(prev => subWeeks(prev, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(prev => addWeeks(prev, 1));
  };

  const goToToday = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  // Ottieni le prenotazioni per un appartamento in un giorno specifico
  const getReservationForApartmentAndDay = (apartmentId: string, day: Date) => {
    return reservations.find(reservation => {
      const startDate = startOfDay(new Date(reservation.start_date));
      const endDate = endOfDay(new Date(reservation.end_date));
      return reservation.apartment_ids.includes(apartmentId) && 
             isWithinInterval(day, { start: startDate, end: endDate });
    });
  };

  // Ottieni il colore per lo stato della prenotazione
  const getReservationColor = (paymentStatus?: string) => {
    switch (paymentStatus) {
      case 'paid':
        return 'bg-success/20 border-success text-success-foreground';
      case 'partiallyPaid':
        return 'bg-warning/20 border-warning text-warning-foreground';
      case 'notPaid':
        return 'bg-destructive/20 border-destructive text-destructive-foreground';
      default:
        return 'bg-muted border-muted-foreground text-muted-foreground';
    }
  };

  // Verifica se è il primo giorno di una prenotazione
  const isFirstDayOfReservation = (reservation: Reservation, day: Date) => {
    return isSameDay(new Date(reservation.start_date), day);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Calendario Prenotazioni
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Oggi
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div className="min-w-[800px]">
            {/* Header con i giorni */}
            <div className="grid grid-cols-[120px_1fr] gap-0 border border-border rounded-lg overflow-hidden">
              <div className="bg-muted p-3 border-r border-border">
                <div className="text-sm font-medium">Appartamento</div>
              </div>
              <div className="grid grid-cols-14 gap-0">
                {days.map((day) => (
                  <div 
                    key={day.toISOString()} 
                    className="p-2 text-center border-r border-border last:border-r-0 bg-muted"
                  >
                    <div className="text-xs font-medium text-muted-foreground">
                      {format(day, 'EEE', { locale: it })}
                    </div>
                    <div className="text-sm font-semibold">
                      {format(day, 'd')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(day, 'MMM', { locale: it })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Righe degli appartamenti */}
            {apartments.map((apartment) => (
              <div key={apartment.id} className="grid grid-cols-[120px_1fr] gap-0 border-l border-r border-b border-border last:border-b-0">
                <div className="p-3 border-r border-border bg-background flex items-center">
                  <div>
                    <div className="font-medium text-sm">{apartment.name}</div>
                    <div className="text-xs text-muted-foreground">{apartment.beds} posti letto</div>
                  </div>
                </div>
                <div className="grid grid-cols-14 gap-0">
                  {days.map((day) => {
                    const reservation = getReservationForApartmentAndDay(apartment.id, day);
                    const isFirstDay = reservation && isFirstDayOfReservation(reservation, day);
                    
                    return (
                      <div 
                        key={`${apartment.id}-${day.toISOString()}`}
                        className="h-16 border-r border-border last:border-r-0 p-1 relative"
                      >
                        {reservation && (
                          <div 
                            className={`
                              h-full rounded border-2 flex items-center justify-center text-xs font-medium transition-all hover:opacity-80
                              ${getReservationColor(reservation.payment_status)}
                              ${isFirstDay ? 'px-1' : ''}
                            `}
                            title={`${reservation.guest_name} - ${reservation.adults + reservation.children} ospiti`}
                          >
                            {isFirstDay && (
                              <div className="truncate">
                                {reservation.guest_name}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Legenda */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 bg-success/20 border-success"></div>
            <span>Pagato</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 bg-warning/20 border-warning"></div>
            <span>Parzialmente Pagato</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 bg-destructive/20 border-destructive"></div>
            <span>Non Pagato</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};