
import React from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay } from "date-fns";
import { it } from "date-fns/locale";
import { Reservation } from "@/hooks/useReservations";

interface ApartmentCalendarProps {
  apartment: {
    id: string;
    name: string;
  };
  reservations: Reservation[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onReservationClick: (reservation: Reservation) => void;
}

export const ApartmentCalendar: React.FC<ApartmentCalendarProps> = ({
  apartment,
  reservations,
  selectedDate,
  onDateSelect,
  onReservationClick
}) => {
  // Filtra le prenotazioni per questo appartamento
  const apartmentReservations = reservations.filter(res => 
    res.apartmentIds.includes(apartment.id)
  );

  // Crea un map di date occupate
  const occupiedDates = new Set<string>();
  const checkInDates = new Set<string>();
  const checkOutDates = new Set<string>();

  apartmentReservations.forEach(reservation => {
    const startDate = new Date(reservation.startDate);
    const endDate = new Date(reservation.endDate);
    
    // Aggiungi check-in
    checkInDates.add(format(startDate, 'yyyy-MM-dd'));
    
    // Aggiungi check-out
    checkOutDates.add(format(endDate, 'yyyy-MM-dd'));
    
    // Aggiungi tutti i giorni occupati
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      occupiedDates.add(format(d, 'yyyy-MM-dd'));
    }
  });

  // Trova prenotazioni per la data selezionata
  const selectedDateReservations = apartmentReservations.filter(res => {
    const startDate = new Date(res.startDate);
    const endDate = new Date(res.endDate);
    return selectedDate >= startDate && selectedDate <= endDate;
  });

  // Custom modifiers per colorare i giorni
  const modifiers = {
    occupied: (date: Date) => occupiedDates.has(format(date, 'yyyy-MM-dd')),
    checkIn: (date: Date) => checkInDates.has(format(date, 'yyyy-MM-dd')),
    checkOut: (date: Date) => checkOutDates.has(format(date, 'yyyy-MM-dd')),
  };

  const modifiersStyles = {
    occupied: { 
      backgroundColor: '#fee2e2', 
      color: '#991b1b',
      border: '1px solid #fca5a5'
    },
    checkIn: { 
      backgroundColor: '#dbeafe', 
      color: '#1d4ed8',
      border: '1px solid #93c5fd',
      fontWeight: 'bold'
    },
    checkOut: { 
      backgroundColor: '#fed7aa', 
      color: '#ea580c',
      border: '1px solid #fdba74',
      fontWeight: 'bold'
    },
  };

  const getDayStyle = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    if (checkInDates.has(dateStr)) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (checkOutDates.has(dateStr)) return 'bg-orange-100 text-orange-800 border-orange-300';
    if (occupiedDates.has(dateStr)) return 'bg-red-100 text-red-800 border-red-300';
    return 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100';
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          {apartment.name}
          <Badge variant="outline" className="text-xs">
            {apartmentReservations.length} prenotazioni
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onDateSelect(date)}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          locale={it}
          className="w-full text-xs"
          classNames={{
            day: "h-8 w-8 text-xs font-medium transition-colors cursor-pointer",
            day_today: "font-bold text-primary border-2 border-primary",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
          }}
        />
        
        {/* Dettagli per la data selezionata */}
        <div className="mt-3 pt-3 border-t">
          <div className="text-sm font-medium mb-2">
            {format(selectedDate, "d MMMM yyyy", { locale: it })}
          </div>
          {selectedDateReservations.length > 0 ? (
            <div className="space-y-2">
              {selectedDateReservations.map((reservation) => {
                const isCheckIn = isSameDay(selectedDate, new Date(reservation.startDate));
                const isCheckOut = isSameDay(selectedDate, new Date(reservation.endDate));
                
                return (
                  <div 
                    key={reservation.id}
                    className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => onReservationClick(reservation)}
                  >
                    <div className="font-medium text-sm">{reservation.guestName}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {format(new Date(reservation.startDate), "d MMM", { locale: it })} - 
                      {format(new Date(reservation.endDate), "d MMM", { locale: it })}
                    </div>
                    <div className="flex gap-1 mt-1">
                      {isCheckIn && (
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                          Arrivo
                        </Badge>
                      )}
                      {isCheckOut && (
                        <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                          Partenza
                        </Badge>
                      )}
                      {!isCheckIn && !isCheckOut && (
                        <Badge variant="secondary" className="text-xs">
                          In corso
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
              ✅ Disponibile
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
