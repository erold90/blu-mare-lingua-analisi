
import * as React from "react";
import { useMemo } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CircleAlert } from "lucide-react";
import { CleaningTask, useCleaningManagement } from "@/hooks/useCleaningManagement";
import { useReservations } from "@/hooks/useReservations";

const StatisticsView: React.FC = () => {
  const { cleaningTasks } = useCleaningManagement();
  const { apartments } = useReservations();
  
  // Statistiche
  const statistics = useMemo(() => {
    const totalTasks = cleaningTasks.length;
    const completedTasks = cleaningTasks.filter(t => t.status === "completed").length;
    const inProgressTasks = cleaningTasks.filter(t => t.status === "inProgress").length;
    const pendingTasks = cleaningTasks.filter(t => t.status === "pending").length;
    
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      completionRate
    };
  }, [cleaningTasks]);
  
  // Prossime attività
  const upcomingTasks = useMemo(() => {
    return cleaningTasks
      .filter(task => {
        const taskDate = new Date(task.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(today.getDate() + 3);
        threeDaysFromNow.setHours(23, 59, 59, 999);
        
        return (
          task.status !== "completed" && 
          taskDate >= today && 
          taskDate <= threeDaysFromNow
        );
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [cleaningTasks]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Statistiche generali */}
      <Card>
        <CardHeader>
          <CardTitle>Panoramica</CardTitle>
          <CardDescription>Statistiche generali sulle pulizie</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-md p-4 text-center">
              <div className="text-2xl font-bold">{statistics.totalTasks}</div>
              <div className="text-sm text-muted-foreground">Totale</div>
            </div>
            <div className="border rounded-md p-4 text-center bg-green-50 text-green-800">
              <div className="text-2xl font-bold">{statistics.completedTasks}</div>
              <div className="text-sm">Completate</div>
            </div>
            <div className="border rounded-md p-4 text-center bg-yellow-50 text-yellow-800">
              <div className="text-2xl font-bold">{statistics.inProgressTasks}</div>
              <div className="text-sm">In corso</div>
            </div>
            <div className="border rounded-md p-4 text-center bg-gray-50 text-gray-800">
              <div className="text-2xl font-bold">{statistics.pendingTasks}</div>
              <div className="text-sm">Da fare</div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-medium">Tasso di completamento</div>
              <div className="text-sm font-medium">{statistics.completionRate}%</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-primary rounded-full h-2.5" 
                style={{ width: `${statistics.completionRate}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Statistiche per appartamento */}
      <Card>
        <CardHeader>
          <CardTitle>Attività per Appartamento</CardTitle>
          <CardDescription>
            Distribuzione delle pulizie per appartamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {apartments.map(apt => {
            const tasks = cleaningTasks.filter(t => t.apartmentId === apt.id);
            const completed = tasks.filter(t => t.status === "completed").length;
            const rate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
            
            return (
              <div key={apt.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{apt.name}</div>
                  <div className="text-sm">
                    {completed} / {tasks.length} completate
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary rounded-full h-2" 
                    style={{ width: `${rate}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
      
      {/* Prossime attività */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CircleAlert className="h-5 w-5 text-yellow-500" />
            Attività imminenti
          </CardTitle>
          <CardDescription>Pulizie da completare entro 3 giorni</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingTasks.map(task => (
              <div key={task.id} className="flex items-center p-3 border rounded-md">
                <div>
                  <div className="font-medium">{task.apartmentName}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(task.date), "EEEE d MMMM", { locale: it })}
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  {task.assignedTo && (
                    <Badge variant="outline">
                      {task.assignedTo}
                    </Badge>
                  )}
                  <Badge 
                    className={
                      task.status === "inProgress" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                      "bg-gray-100 text-gray-800 border-gray-200"
                    }
                  >
                    {task.status === "inProgress" ? "In corso" : "Da fare"}
                  </Badge>
                </div>
              </div>
            ))}
            
            {upcomingTasks.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                Nessuna attività imminente da completare
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsView;
