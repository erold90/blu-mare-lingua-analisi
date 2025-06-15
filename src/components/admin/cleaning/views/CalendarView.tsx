
import * as React from "react";
import { useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useCleaningContext } from "@/hooks/cleaning/useCleaningContext";
import CleaningTaskCard from "../CleaningTaskCard";

interface CalendarViewProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  selectedApartment: string;
  isMobile: boolean;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  selectedDate,
  setSelectedDate,
  selectedApartment,
  isMobile
}) => {
  const { cleaningTasks, getTasksByDate } = useCleaningContext();
  
  // Calcola le attività per la data selezionata
  const selectedDateTasks = useMemo(() => {
    const tasks = getTasksByDate(selectedDate);
    
    if (selectedApartment === "all") {
      return tasks;
    }
    
    return tasks.filter(task => task.apartmentId === selectedApartment);
  }, [selectedDate, selectedApartment, getTasksByDate]);
  
  // Calcola i giorni con attività per evidenziarli nel calendario
  const daysWithTasks = useMemo(() => {
    const days = new Set<string>();
    
    cleaningTasks.forEach(task => {
      if (selectedApartment === "all" || task.apartmentId === selectedApartment) {
        days.add(task.taskDate);
      }
    });
    
    return days;
  }, [cleaningTasks, selectedApartment]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendario principale */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Calendario Pulizie</CardTitle>
          <CardDescription>
            Clicca su una data per vedere le attività programmate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="w-full"
            modifiers={{
              hasTasks: (date) => {
                const dateString = format(date, "yyyy-MM-dd");
                return daysWithTasks.has(dateString);
              }
            }}
            modifiersStyles={{
              hasTasks: { 
                backgroundColor: "hsl(var(--primary))", 
                color: "hsl(var(--primary-foreground))",
                fontWeight: "bold"
              }
            }}
          />
        </CardContent>
      </Card>
      
      {/* Dettaglio del giorno selezionato */}
      <Card>
        <CardHeader>
          <CardTitle>
            {format(selectedDate, "EEEE d MMMM yyyy", { locale: it })}
          </CardTitle>
          <CardDescription>
            {selectedDateTasks.length === 0
              ? "Nessuna attività programmata"
              : `${selectedDateTasks.length} attività programmate`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {selectedDateTasks.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p>Nessuna attività di pulizia programmata per oggi</p>
              </div>
            ) : (
              selectedDateTasks.map((task) => (
                <CleaningTaskCard key={task.id} task={task} />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarView;
