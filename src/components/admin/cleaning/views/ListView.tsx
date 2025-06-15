
import * as React from "react";
import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useCleaningManagement } from "@/hooks/useCleaningManagement";
import { useReservations } from "@/hooks/useReservations";
import CleaningTaskCard from "../CleaningTaskCard";

interface ListViewProps {
  selectedApartment: string;
  isMobile: boolean;
}

const ListView: React.FC<ListViewProps> = ({
  selectedApartment,
  isMobile
}) => {
  const { cleaningTasks } = useCleaningManagement();
  const { apartments } = useReservations();
  
  // Filtra e ordina le attività
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = cleaningTasks;
    
    if (selectedApartment !== "all") {
      filtered = cleaningTasks.filter(task => task.apartmentId === selectedApartment);
    }
    
    // Ordina per data (più recenti prima) e poi per priorità
    return filtered.sort((a, b) => {
      const dateA = new Date(a.taskDate);
      const dateB = new Date(b.taskDate);
      
      if (dateA.getTime() !== dateB.getTime()) {
        return dateB.getTime() - dateA.getTime();
      }
      
      // Se le date sono uguali, ordina per priorità
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [cleaningTasks, selectedApartment]);
  
  // Raggruppa le attività per stato
  const tasksByStatus = useMemo(() => {
    const groups = {
      pending: filteredAndSortedTasks.filter(task => task.status === "pending"),
      inProgress: filteredAndSortedTasks.filter(task => task.status === "inProgress"),
      completed: filteredAndSortedTasks.filter(task => task.status === "completed"),
      cancelled: filteredAndSortedTasks.filter(task => task.status === "cancelled")
    };
    
    return groups;
  }, [filteredAndSortedTasks]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending": return "In Attesa";
      case "inProgress": return "In Corso";
      case "completed": return "Completate";
      case "cancelled": return "Annullate";
      default: return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "pending": return "outline";
      case "inProgress": return "default";
      case "completed": return "secondary";
      case "cancelled": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistiche rapide */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{tasksByStatus.pending.length}</div>
            <div className="text-sm text-muted-foreground">In Attesa</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{tasksByStatus.inProgress.length}</div>
            <div className="text-sm text-muted-foreground">In Corso</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{tasksByStatus.completed.length}</div>
            <div className="text-sm text-muted-foreground">Completate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{tasksByStatus.cancelled.length}</div>
            <div className="text-sm text-muted-foreground">Annullate</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Liste di attività per stato */}
      {(Object.keys(tasksByStatus) as Array<keyof typeof tasksByStatus>).map((status) => (
        <Card key={status}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getStatusLabel(status)}
                <Badge variant={getStatusVariant(status)}>
                  {tasksByStatus[status].length}
                </Badge>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {tasksByStatus[status].length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <p>Nessuna attività {getStatusLabel(status).toLowerCase()}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasksByStatus[status].map((task) => (
                  <CleaningTaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ListView;
