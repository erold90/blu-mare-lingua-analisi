
import * as React from "react";
import { useMemo } from "react";
import { format, isSameDay } from "date-fns";
import { it } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { CleaningTask, useCleaningManagement } from "@/hooks/useCleaningManagement";
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
  const { 
    cleaningTasks, 
    updateTaskStatus,
    updateTaskNotes,
    updateTaskAssignment,
    deleteTask,
    getTasksByDate
  } = useCleaningManagement();
  
  // Filtra le attività di pulizia per appartamento e data
  const filteredTasks = useMemo(() => {
    let tasks = getTasksByDate(selectedDate);
    
    if (selectedApartment !== "all") {
      tasks = tasks.filter(task => task.apartmentId === selectedApartment);
    }
    
    return tasks;
  }, [selectedDate, selectedApartment, getTasksByDate]);
  
  // Giorni con attività di pulizia per il calendario
  const specialDays = useMemo(() => {
    const days: Record<string, { tasks: CleaningTask[] }> = {};
    
    cleaningTasks.forEach(task => {
      const dateKey = new Date(task.date).toISOString().split('T')[0];
      
      if (!days[dateKey]) {
        days[dateKey] = { tasks: [] };
      }
      
      days[dateKey].tasks.push(task);
    });
    
    return days;
  }, [cleaningTasks]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Calendario */}
      <Card className={isMobile ? "" : "md:col-span-1"}>
        <CardContent className="pt-6">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            modifiers={{
              hasCleaningTask: (date) => {
                const dateKey = format(date, "yyyy-MM-dd");
                const day = specialDays[dateKey];
                
                if (selectedApartment === "all") {
                  return !!day;
                }
                
                return !!day?.tasks.some(t => 
                  t.apartmentId === selectedApartment
                );
              }
            }}
            modifiersClassNames={{
              hasCleaningTask: "bg-accent text-accent-foreground"
            }}
            classNames={{
              day_today: "font-bold text-primary",
              day_selected: "bg-primary text-primary-foreground"
            }}
            className="rounded-md border shadow-none"
          />
        </CardContent>
      </Card>
      
      {/* Attività per la data selezionata */}
      <Card className={isMobile ? "" : "md:col-span-2"}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>
              Attività per {format(selectedDate, "EEEE d MMMM", { locale: it })}
            </CardTitle>
            <CardDescription>
              {filteredTasks.length === 0
                ? "Nessuna attività di pulizia per questa data"
                : `${filteredTasks.length} attività di pulizia`}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className={`grid grid-cols-1 ${isMobile ? "" : "md:grid-cols-2"} gap-4`}>
            {filteredTasks.map(task => (
              <CleaningTaskCard 
                key={task.id}
                task={task}
                onUpdateStatus={updateTaskStatus}
                onUpdateNotes={updateTaskNotes}
                onUpdateAssignment={updateTaskAssignment}
                onDelete={deleteTask}
              />
            ))}
            {filteredTasks.length === 0 && (
              <div className="col-span-full p-8 text-center text-muted-foreground">
                Nessuna attività di pulizia pianificata per questa data
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarView;
