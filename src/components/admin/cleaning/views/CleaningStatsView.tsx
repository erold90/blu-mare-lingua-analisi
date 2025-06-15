
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCleaningContext } from "@/hooks/cleaning/useCleaningContext";
import { useReservations } from "@/hooks/useReservations";
import { format, isToday, isTomorrow, subDays, startOfWeek, endOfWeek } from "date-fns";
import { it } from "date-fns/locale";
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Users,
  Calendar,
  Target
} from "lucide-react";

const CleaningStatsView = () => {
  const { cleaningTasks } = useCleaningContext();
  const { apartments } = useReservations();

  // Calcola statistiche temporali
  const today = new Date();
  const yesterday = subDays(today, 1);
  const weekStart = startOfWeek(today, { locale: it });
  const weekEnd = endOfWeek(today, { locale: it });

  // Filtra attività per periodo
  const todayTasks = cleaningTasks.filter(task => isToday(new Date(task.taskDate)));
  const tomorrowTasks = cleaningTasks.filter(task => isTomorrow(new Date(task.taskDate)));
  const weekTasks = cleaningTasks.filter(task => {
    const taskDate = new Date(task.taskDate);
    return taskDate >= weekStart && taskDate <= weekEnd;
  });

  // Statistiche per stato
  const pendingTasks = cleaningTasks.filter(task => task.status === "pending");
  const inProgressTasks = cleaningTasks.filter(task => task.status === "inProgress");
  const completedTasks = cleaningTasks.filter(task => task.status === "completed");
  const cancelledTasks = cleaningTasks.filter(task => task.status === "cancelled");

  // Statistiche per priorità
  const urgentTasks = cleaningTasks.filter(task => task.priority === "urgent");
  const highTasks = cleaningTasks.filter(task => task.priority === "high");
  const mediumTasks = cleaningTasks.filter(task => task.priority === "medium");
  const lowTasks = cleaningTasks.filter(task => task.priority === "low");

  // Statistiche per tipo di attività
  const checkoutTasks = cleaningTasks.filter(task => task.taskType === "checkout");
  const maintenanceTasks = cleaningTasks.filter(task => task.taskType === "maintenance");
  const deepCleanTasks = cleaningTasks.filter(task => task.taskType === "deep_clean");
  const inspectionTasks = cleaningTasks.filter(task => task.taskType === "inspection");

  // Calcola tempo medio di completamento
  const completedTasksWithDuration = completedTasks.filter(task => task.actualDuration);
  const averageCompletionTime = completedTasksWithDuration.length > 0
    ? Math.round(completedTasksWithDuration.reduce((sum, task) => sum + (task.actualDuration || 0), 0) / completedTasksWithDuration.length)
    : 0;

  // Statistiche per appartamento
  const apartmentStats = apartments.map(apartment => {
    const apartmentTasks = cleaningTasks.filter(task => task.apartmentId === apartment.id);
    const completed = apartmentTasks.filter(task => task.status === "completed").length;
    const pending = apartmentTasks.filter(task => task.status === "pending").length;
    const total = apartmentTasks.length;
    
    return {
      ...apartment,
      total,
      completed,
      pending,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  });

  const StatCard = ({ title, value, icon: Icon, color = "text-gray-600", badge, trend }: any) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${color}`} />
            {title}
          </span>
          {badge && <Badge variant="outline">{badge}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className={`text-2xl font-bold ${color}`}>{value}</div>
          {trend && (
            <div className={`flex items-center text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className="h-3 w-3 mr-1" />
              {trend > 0 ? '+' : ''}{trend}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Statistiche temporali */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Panoramica Temporale
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard 
            title="Oggi" 
            value={todayTasks.length} 
            icon={Clock}
            color="text-blue-600"
            badge={`${todayTasks.filter(t => t.status === "completed").length} completate`}
          />
          <StatCard 
            title="Domani" 
            value={tomorrowTasks.length} 
            icon={Calendar}
            color="text-green-600"
          />
          <StatCard 
            title="Questa Settimana" 
            value={weekTasks.length} 
            icon={BarChart3}
            color="text-purple-600"
          />
          <StatCard 
            title="Tempo Medio" 
            value={averageCompletionTime > 0 ? `${averageCompletionTime}min` : "N/A"} 
            icon={Target}
            color="text-orange-600"
            badge="completamento"
          />
        </div>
      </div>

      {/* Statistiche per stato */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Stati Attività
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard 
            title="In Attesa" 
            value={pendingTasks.length} 
            icon={Clock}
            color="text-yellow-600"
          />
          <StatCard 
            title="In Corso" 
            value={inProgressTasks.length} 
            icon={Target}
            color="text-blue-600"
          />
          <StatCard 
            title="Completate" 
            value={completedTasks.length} 
            icon={CheckCircle}
            color="text-green-600"
          />
          <StatCard 
            title="Annullate" 
            value={cancelledTasks.length} 
            icon={AlertTriangle}
            color="text-red-600"
          />
        </div>
      </div>

      {/* Statistiche per priorità */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Priorità
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard 
            title="Urgenti" 
            value={urgentTasks.length} 
            icon={AlertTriangle}
            color="text-red-600"
            badge="🚨"
          />
          <StatCard 
            title="Alta Priorità" 
            value={highTasks.length} 
            icon={TrendingUp}
            color="text-orange-600"
            badge="⚡"
          />
          <StatCard 
            title="Media Priorità" 
            value={mediumTasks.length} 
            icon={BarChart3}
            color="text-blue-600"
            badge="📋"
          />
          <StatCard 
            title="Bassa Priorità" 
            value={lowTasks.length} 
            icon={Clock}
            color="text-gray-600"
            badge="📝"
          />
        </div>
      </div>

      {/* Statistiche per tipo di attività */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Tipi di Attività
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard 
            title="Check-out" 
            value={checkoutTasks.length} 
            icon={Users}
            color="text-blue-600"
            badge="🛏️"
          />
          <StatCard 
            title="Manutenzione" 
            value={maintenanceTasks.length} 
            icon={Target}
            color="text-orange-600"
            badge="🔧"
          />
          <StatCard 
            title="Pulizia Profonda" 
            value={deepCleanTasks.length} 
            icon={CheckCircle}
            color="text-purple-600"
            badge="✨"
          />
          <StatCard 
            title="Ispezioni" 
            value={inspectionTasks.length} 
            icon={BarChart3}
            color="text-green-600"
            badge="🔍"
          />
        </div>
      </div>

      {/* Statistiche per appartamento */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Performance per Appartamento
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {apartmentStats.map((apartment) => (
            <Card key={apartment.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{apartment.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Totale:</span>
                    <span className="font-medium">{apartment.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Completate:</span>
                    <span className="font-medium text-green-600">{apartment.completed}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>In Attesa:</span>
                    <span className="font-medium text-yellow-600">{apartment.pending}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Completamento:</span>
                      <Badge 
                        variant="outline" 
                        className={
                          apartment.completionRate >= 80 ? "border-green-300 text-green-700" :
                          apartment.completionRate >= 60 ? "border-yellow-300 text-yellow-700" :
                          "border-red-300 text-red-700"
                        }
                      >
                        {apartment.completionRate}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Riepilogo generale */}
      {cleaningTasks.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Riepilogo Generale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{cleaningTasks.length}</div>
                <div className="text-sm text-muted-foreground">Attività Totali</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((completedTasks.length / cleaningTasks.length) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Tasso Completamento</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{apartments.length}</div>
                <div className="text-sm text-muted-foreground">Appartamenti Gestiti</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {urgentTasks.filter(t => t.status !== "completed").length}
                </div>
                <div className="text-sm text-muted-foreground">Urgenti Attive</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CleaningStatsView;
