
import * as React from "react";
import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCleaningManagement } from "@/hooks/useCleaningManagement";
import { useReservations } from "@/hooks/useReservations";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { it } from "date-fns/locale";

const StatisticsView: React.FC = () => {
  const { cleaningTasks } = useCleaningManagement();
  const { apartments } = useReservations();
  
  // Statistiche generali
  const stats = useMemo(() => {
    const total = cleaningTasks.length;
    const pending = cleaningTasks.filter(task => task.status === "pending").length;
    const inProgress = cleaningTasks.filter(task => task.status === "inProgress").length;
    const completed = cleaningTasks.filter(task => task.status === "completed").length;
    const cancelled = cleaningTasks.filter(task => task.status === "cancelled").length;
    
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    
    return {
      total,
      pending,
      inProgress,
      completed,
      cancelled,
      completionRate
    };
  }, [cleaningTasks]);
  
  // Statistiche per appartamento
  const apartmentStats = useMemo(() => {
    return apartments.map(apartment => {
      const apartmentTasks = cleaningTasks.filter(task => task.apartmentId === apartment.id);
      const completed = apartmentTasks.filter(task => task.status === "completed").length;
      const total = apartmentTasks.length;
      const completionRate = total > 0 ? (completed / total) * 100 : 0;
      
      return {
        apartment,
        total,
        completed,
        completionRate
      };
    });
  }, [apartments, cleaningTasks]);
  
  // Statistiche settimanali
  const weeklyStats = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    return daysOfWeek.map(day => {
      const dayString = format(day, "yyyy-MM-dd");
      const dayTasks = cleaningTasks.filter(task => task.taskDate === dayString);
      
      return {
        day: format(day, "EEEE", { locale: it }),
        date: format(day, "d MMM", { locale: it }),
        tasks: dayTasks.length,
        completed: dayTasks.filter(task => task.status === "completed").length
      };
    });
  }, [cleaningTasks]);
  
  // Statistiche per tipo di attività
  const taskTypeStats = useMemo(() => {
    const types = ["checkout", "maintenance", "deep_clean", "inspection"];
    
    return types.map(type => {
      const typeTasks = cleaningTasks.filter(task => task.taskType === type);
      const completed = typeTasks.filter(task => task.status === "completed").length;
      const total = typeTasks.length;
      
      const typeLabels = {
        checkout: "Check-out",
        maintenance: "Manutenzione", 
        deep_clean: "Pulizia Profonda",
        inspection: "Ispezione"
      };
      
      return {
        type,
        label: typeLabels[type as keyof typeof typeLabels],
        total,
        completed,
        completionRate: total > 0 ? (completed / total) * 100 : 0
      };
    });
  }, [cleaningTasks]);

  return (
    <div className="space-y-6">
      {/* Statistiche generali */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Totale Attività
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Attesa
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completate
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tasso Completamento
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold">{stats.completionRate.toFixed(1)}%</div>
            <Progress value={stats.completionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>
      
      {/* Statistiche per appartamento */}
      <Card>
        <CardHeader>
          <CardTitle>Statistiche per Appartamento</CardTitle>
          <CardDescription>
            Performance di pulizia per ogni appartamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {apartmentStats.map(({ apartment, total, completed, completionRate }) => (
              <div key={apartment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{apartment.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {completed} di {total} attività completate
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-sm font-medium">{completionRate.toFixed(1)}%</div>
                    <Progress value={completionRate} className="w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Statistiche settimanali */}
      <Card>
        <CardHeader>
          <CardTitle>Attività Settimanali</CardTitle>
          <CardDescription>
            Distribuzione delle attività durante la settimana
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weeklyStats.map(({ day, date, tasks, completed }) => (
              <div key={day} className="text-center p-3 border rounded-lg">
                <div className="text-sm font-medium">{day}</div>
                <div className="text-xs text-muted-foreground mb-2">{date}</div>
                <div className="text-lg font-bold">{tasks}</div>
                <div className="text-xs text-green-600">{completed} completate</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Statistiche per tipo di attività */}
      <Card>
        <CardHeader>
          <CardTitle>Statistiche per Tipo di Attività</CardTitle>
          <CardDescription>
            Performance per ogni tipo di attività di pulizia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {taskTypeStats.map(({ type, label, total, completed, completionRate }) => (
              <div key={type} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{label}</div>
                  <Badge variant="outline">{total} totali</Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {completed} di {total} completate
                </div>
                <Progress value={completionRate} />
                <div className="text-xs text-muted-foreground mt-1">
                  {completionRate.toFixed(1)}% di completamento
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsView;
