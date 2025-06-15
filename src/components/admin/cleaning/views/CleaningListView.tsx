
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useCleaningContext } from "@/hooks/cleaning/useCleaningContext";
import { useReservations } from "@/hooks/useReservations";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import { it } from "date-fns/locale";
import { Search, Calendar, MapPin, Clock, User, Edit2, CheckCircle, Play, X } from "lucide-react";
import CleaningTaskCard from "../cards/CleaningTaskCard";

interface CleaningListViewProps {
  apartmentFilter: string;
}

const CleaningListView: React.FC<CleaningListViewProps> = ({ apartmentFilter }) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("date");

  const { cleaningTasks } = useCleaningContext();
  const { apartments } = useReservations();

  // Applica tutti i filtri
  let filteredTasks = cleaningTasks;

  if (apartmentFilter !== "all") {
    filteredTasks = filteredTasks.filter(task => task.apartmentId === apartmentFilter);
  }

  if (statusFilter !== "all") {
    filteredTasks = filteredTasks.filter(task => task.status === statusFilter);
  }

  if (priorityFilter !== "all") {
    filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
  }

  if (searchTerm) {
    filteredTasks = filteredTasks.filter(task => 
      task.apartmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignee?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Ordina le attività
  filteredTasks.sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(a.taskDate).getTime() - new Date(b.taskDate).getTime();
      case "priority":
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
      case "status":
        const statusOrder = { pending: 0, inProgress: 1, completed: 2, cancelled: 3 };
        return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
      case "apartment":
        return (a.apartmentName || "").localeCompare(b.apartmentName || "");
      default:
        return 0;
    }
  });

  // Raggruppa le attività per categoria temporale
  const todayTasks = filteredTasks.filter(task => isToday(new Date(task.taskDate)));
  const tomorrowTasks = filteredTasks.filter(task => isTomorrow(new Date(task.taskDate)));
  const overdueTasks = filteredTasks.filter(task => 
    isPast(new Date(task.taskDate)) && 
    !isToday(new Date(task.taskDate)) && 
    task.status !== "completed"
  );
  const futureTasks = filteredTasks.filter(task => {
    const taskDate = new Date(task.taskDate);
    return !isToday(taskDate) && !isTomorrow(taskDate) && !isPast(taskDate);
  });

  const TaskGroup = ({ title, tasks, icon: Icon, color = "text-gray-600" }: any) => {
    if (tasks.length === 0) return null;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${color}`}>
            <Icon className="h-5 w-5" />
            {title} ({tasks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <CleaningTaskCard key={task.id} task={task} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filtri e ricerca */}
      <Card>
        <CardHeader>
          <CardTitle>Filtri e Ricerca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cerca attività..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Stato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli stati</SelectItem>
                <SelectItem value="pending">In Attesa</SelectItem>
                <SelectItem value="inProgress">In Corso</SelectItem>
                <SelectItem value="completed">Completate</SelectItem>
                <SelectItem value="cancelled">Annullate</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priorità" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le priorità</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="low">Bassa</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Ordina per" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Data</SelectItem>
                <SelectItem value="priority">Priorità</SelectItem>
                <SelectItem value="status">Stato</SelectItem>
                <SelectItem value="apartment">Appartamento</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setStatusFilter("all");
                setPriorityFilter("all");
                setSearchTerm("");
                setSortBy("date");
              }}
            >
              Azzera Filtri
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Attività scadute */}
      <TaskGroup 
        title="⚠️ Attività Scadute" 
        tasks={overdueTasks}
        icon={X}
        color="text-red-600"
      />

      {/* Attività di oggi */}
      <TaskGroup 
        title="📅 Oggi" 
        tasks={todayTasks}
        icon={Calendar}
        color="text-blue-600"
      />

      {/* Attività di domani */}
      <TaskGroup 
        title="📋 Domani" 
        tasks={tomorrowTasks}
        icon={Calendar}
        color="text-green-600"
      />

      {/* Attività future */}
      <TaskGroup 
        title="🗓️ Prossime Attività" 
        tasks={futureTasks}
        icon={Calendar}
        color="text-gray-600"
      />

      {/* Nessun risultato */}
      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nessuna attività trovata
            </h3>
            <p className="text-gray-500 mb-4">
              Prova a modificare i filtri o la ricerca
            </p>
            <Button 
              variant="outline"
              onClick={() => {
                setStatusFilter("all");
                setPriorityFilter("all");
                setSearchTerm("");
              }}
            >
              Azzera tutti i filtri
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CleaningListView;
