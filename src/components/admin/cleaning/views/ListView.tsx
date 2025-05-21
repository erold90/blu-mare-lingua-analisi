
import * as React from "react";
import { useMemo } from "react";
import { format, isSameDay } from "date-fns";
import { it } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CleaningTask, useCleaningManagement } from "@/hooks/useCleaningManagement";
import CleaningTaskCard from "../CleaningTaskCard";

interface ListViewProps {
  selectedApartment: string;
  isMobile: boolean;
}

const ListView: React.FC<ListViewProps> = ({
  selectedApartment,
  isMobile
}) => {
  const { 
    cleaningTasks, 
    updateTaskStatus,
    updateTaskNotes,
    updateTaskAssignment,
    deleteTask
  } = useCleaningManagement();
  
  // Raggruppa le attività per data per la visualizzazione in lista
  const tasksByDate = useMemo(() => {
    let tasks = [...cleaningTasks];
    
    if (selectedApartment !== "all") {
      tasks = tasks.filter(task => task.apartmentId === selectedApartment);
    }
    
    return tasks.reduce<Record<string, CleaningTask[]>>((acc, task) => {
      const dateKey = new Date(task.date).toISOString().split('T')[0];
      
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      
      acc[dateKey].push(task);
      return acc;
    }, {});
  }, [cleaningTasks, selectedApartment]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Elenco Pulizie</CardTitle>
        <CardDescription>
          Tutte le attività di pulizia pianificate
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(tasksByDate)
            .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
            .map(([dateStr, tasks]) => {
              const dateObj = new Date(dateStr);
              const isToday = isSameDay(dateObj, new Date());
              const isPast = dateObj < new Date() && !isToday;
              const isFuture = dateObj > new Date();
              
              return (
                <div key={dateStr} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-medium ${isToday ? "text-primary" : isPast ? "text-muted-foreground" : ""}`}>
                      {format(dateObj, "EEEE d MMMM yyyy", { locale: it })}
                    </h3>
                    {isToday && <Badge>Oggi</Badge>}
                    {isPast && <Badge variant="outline">Passata</Badge>}
                    {isFuture && <Badge variant="outline">Futura</Badge>}
                  </div>
                  
                  <div className={`grid grid-cols-1 ${isMobile ? "" : "md:grid-cols-2"} gap-3`}>
                    {tasks.map(task => (
                      <CleaningTaskCard 
                        key={task.id}
                        task={task}
                        onUpdateStatus={updateTaskStatus}
                        onUpdateNotes={updateTaskNotes}
                        onUpdateAssignment={updateTaskAssignment}
                        onDelete={deleteTask}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          
          {Object.keys(tasksByDate).length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              Nessuna attività di pulizia pianificata
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ListView;
