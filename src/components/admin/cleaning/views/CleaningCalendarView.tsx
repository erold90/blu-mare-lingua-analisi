
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { useCleaningContext } from "@/hooks/cleaning/useCleaningContext";
import { useReservations } from "@/hooks/useReservations";
import { format, isSameDay } from "date-fns";
import { it } from "date-fns/locale";
import { Calendar as CalendarIcon, MapPin, Clock, User } from "lucide-react";

interface CleaningCalendarViewProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  apartmentFilter: string;
}

const CleaningCalendarView: React.FC<CleaningCalendarViewProps> = ({
  selectedDate,
  setSelectedDate,
  apartmentFilter
}) => {
  const { cleaningTasks } = useCleaningContext();
  const { apartments } = useReservations();

  // Filtra le attività per appartamento se necessario
  const filteredTasks = apartmentFilter === "all" 
    ? cleaningTasks 
    : cleaningTasks.filter(task => task.apartmentId === apartmentFilter);

  // Trova attività per la data selezionata
  const selectedDateTasks = filteredTasks.filter(task => 
    isSameDay(new Date(task.taskDate), selectedDate)
  );

  // Crea un set di date che hanno attività
  const datesWithTasks = new Set(
    filteredTasks.map(task => format(new Date(task.taskDate), 'yyyy-MM-dd'))
  );

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "inProgress": return "bg-blue-100 text-blue-800 border-blue-300";
      case "completed": return "bg-green-100 text-green-800 border-green-300";
      case "cancelled": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getTaskTypeIcon = (taskType: string) => {
    switch (taskType) {
      case "checkout": return "🛏️";
      case "maintenance": return "🔧";
      case "deep_clean": return "✨";
      case "inspection": return "🔍";
      default: return "📝";
    }
  };

  const modifiers = {
    hasTasks: (date: Date) => datesWithTasks.has(format(date, 'yyyy-MM-dd'))
  };

  const modifiersStyles = {
    hasTasks: { 
      backgroundColor: '#e0f2fe', 
      fontWeight: 'bold',
      border: '2px solid #0284c7'
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendario */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Calendario Pulizie
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Le date con attività sono evidenziate in blu
          </p>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            locale={it}
            className="w-full"
            classNames={{
              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center",
              caption_label: "text-sm font-medium",
              nav: "space-x-1 flex items-center",
              nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors",
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day_today: "bg-accent text-accent-foreground font-bold",
              day_outside: "text-muted-foreground opacity-50",
              day_disabled: "text-muted-foreground opacity-50",
              day_hidden: "invisible",
            }}
          />
        </CardContent>
      </Card>

      {/* Dettagli per la data selezionata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {format(selectedDate, "d MMMM yyyy", { locale: it })}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {selectedDateTasks.length} attività programmate
          </p>
        </CardHeader>
        <CardContent>
          {selectedDateTasks.length > 0 ? (
            <div className="space-y-3">
              {selectedDateTasks.map((task) => {
                const apartment = apartments.find(apt => apt.id === task.apartmentId);
                
                return (
                  <Card key={task.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getTaskTypeIcon(task.taskType)}</span>
                            <span className="font-medium">{apartment?.name}</span>
                          </div>
                          <Badge className={getTaskStatusColor(task.status)}>
                            {task.status === "pending" ? "In Attesa" : 
                             task.status === "inProgress" ? "In Corso" : 
                             task.status === "completed" ? "Completata" : "Annullata"}
                          </Badge>
                        </div>

                        {/* Dettagli */}
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            <span>
                              {task.taskType === "checkout" ? "Pulizia Check-out" :
                               task.taskType === "maintenance" ? "Manutenzione" :
                               task.taskType === "deep_clean" ? "Pulizia Profonda" : "Ispezione"}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span>{task.estimatedDuration} minuti stimati</span>
                          </div>

                          {task.assignee && (
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3" />
                              <span>Assegnato a: {task.assignee}</span>
                            </div>
                          )}
                        </div>

                        {/* Note */}
                        {task.notes && (
                          <div className="text-xs bg-gray-50 p-2 rounded">
                            <strong>Note:</strong> {task.notes}
                          </div>
                        )}

                        {/* Priority */}
                        <div className="flex justify-end">
                          <Badge variant="outline" className={
                            task.priority === "urgent" ? "border-red-300 text-red-700" :
                            task.priority === "high" ? "border-orange-300 text-orange-700" :
                            task.priority === "medium" ? "border-blue-300 text-blue-700" :
                            "border-gray-300 text-gray-700"
                          }>
                            {task.priority === "urgent" ? "🚨 Urgente" :
                             task.priority === "high" ? "⚡ Alta" :
                             task.priority === "medium" ? "📋 Media" : "📝 Bassa"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Nessuna attività programmata</p>
              <p className="text-sm">per questa data</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CleaningCalendarView;
