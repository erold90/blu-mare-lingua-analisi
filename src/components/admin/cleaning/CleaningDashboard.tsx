
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, ListTodo, BarChart3, Plus, Filter, Calendar, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useCleaningContext } from "@/hooks/cleaning/useCleaningContext";
import { useReservations } from "@/hooks/useReservations";
import { format, isToday, isTomorrow, addDays } from "date-fns";
import { it } from "date-fns/locale";

import CleaningCalendarView from "./views/CleaningCalendarView";
import CleaningListView from "./views/CleaningListView";
import CleaningStatsView from "./views/CleaningStatsView";
import CleaningTaskDialog from "./dialogs/CleaningTaskDialog";

const CleaningDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [apartmentFilter, setApartmentFilter] = useState<string>("all");
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false);
  
  const { cleaningTasks, generateTasksFromReservations, isLoading } = useCleaningContext();
  const { apartments } = useReservations();

  // Calcola statistiche rapide
  const today = new Date();
  const todayTasks = cleaningTasks.filter(task => isToday(new Date(task.taskDate)));
  const tomorrowTasks = cleaningTasks.filter(task => isTomorrow(new Date(task.taskDate)));
  const pendingTasks = cleaningTasks.filter(task => task.status === "pending");
  const inProgressTasks = cleaningTasks.filter(task => task.status === "inProgress");
  const urgentTasks = cleaningTasks.filter(task => task.priority === "urgent" && task.status !== "completed");

  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-blue-100 text-blue-800";
      case "low": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "inProgress": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const QuickStatsCard = ({ title, count, icon: Icon, color = "text-gray-600" }: any) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{count}</p>
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestione Pulizie</h1>
          <p className="text-muted-foreground">
            Dashboard completa per pianificare e monitorare le attività di pulizia
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={generateTasksFromReservations}
            disabled={isLoading}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Genera da Prenotazioni
          </Button>
          <Button 
            onClick={() => setShowNewTaskDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuova Attività
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <QuickStatsCard 
          title="Oggi" 
          count={todayTasks.length} 
          icon={Calendar}
          color={todayTasks.length > 0 ? "text-blue-600" : "text-gray-600"}
        />
        <QuickStatsCard 
          title="Domani" 
          count={tomorrowTasks.length} 
          icon={CalendarDays}
          color="text-green-600"
        />
        <QuickStatsCard 
          title="In Attesa" 
          count={pendingTasks.length} 
          icon={Clock}
          color={pendingTasks.length > 0 ? "text-yellow-600" : "text-gray-600"}
        />
        <QuickStatsCard 
          title="In Corso" 
          count={inProgressTasks.length} 
          icon={CheckCircle}
          color={inProgressTasks.length > 0 ? "text-blue-600" : "text-gray-600"}
        />
        <QuickStatsCard 
          title="Urgenti" 
          count={urgentTasks.length} 
          icon={AlertCircle}
          color={urgentTasks.length > 0 ? "text-red-600" : "text-gray-600"}
        />
      </div>

      {/* Filtri rapidi */}
      <div className="flex flex-wrap gap-4 items-center">
        <Select value={apartmentFilter} onValueChange={setApartmentFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtra per appartamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli appartamenti</SelectItem>
            {apartments.map((apt) => (
              <SelectItem key={apt.id} value={apt.id}>
                {apt.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Task urgenti di oggi */}
      {todayTasks.length > 0 && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Attività di Oggi ({todayTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {todayTasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={getTaskStatusColor(task.status)}>
                      {task.status === "pending" ? "In Attesa" : 
                       task.status === "inProgress" ? "In Corso" : 
                       task.status === "completed" ? "Completata" : "Annullata"}
                    </Badge>
                    <span className="font-medium">{task.apartmentName}</span>
                    <span className="text-sm text-gray-600">
                      {task.taskType === "checkout" ? "Check-out" :
                       task.taskType === "maintenance" ? "Manutenzione" :
                       task.taskType === "deep_clean" ? "Pulizia Profonda" : "Ispezione"}
                    </span>
                  </div>
                  <Badge className={getTaskPriorityColor(task.priority)}>
                    {task.priority === "urgent" ? "Urgente" :
                     task.priority === "high" ? "Alta" :
                     task.priority === "medium" ? "Media" : "Bassa"}
                  </Badge>
                </div>
              ))}
              {todayTasks.length > 3 && (
                <p className="text-sm text-muted-foreground text-center mt-2">
                  +{todayTasks.length - 3} altre attività...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs principali */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <ListTodo className="h-4 w-4" />
            Lista Attività
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Calendario
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Statistiche
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <CleaningListView apartmentFilter={apartmentFilter} />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <CleaningCalendarView 
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            apartmentFilter={apartmentFilter}
          />
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <CleaningStatsView />
        </TabsContent>
      </Tabs>

      {/* Dialog per nuova attività */}
      <CleaningTaskDialog 
        open={showNewTaskDialog}
        onOpenChange={setShowNewTaskDialog}
      />
    </div>
  );
};

export default CleaningDashboard;
