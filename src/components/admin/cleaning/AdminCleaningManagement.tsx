import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, isSameDay, addDays } from "date-fns";
import { it } from "date-fns/locale";
import { Brush, Plus, Trash, CheckCircle, CircleAlert } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useReservations } from "@/hooks/useReservations";
import { CleaningProvider, useCleaningManagement, CleaningTask } from "@/hooks/useCleaningManagement";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

const CleaningTaskCard: React.FC<{
  task: CleaningTask;
  onUpdateStatus: (id: string, status: CleaningTask["status"]) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onUpdateAssignment: (id: string, assignedTo: string) => void;
  onDelete: (id: string) => void;
}> = ({ task, onUpdateStatus, onUpdateNotes, onUpdateAssignment, onDelete }) => {
  const [notes, setNotes] = useState(task.notes || "");
  const [assignedTo, setAssignedTo] = useState(task.assignedTo || "");
  
  return (
    <div className="border rounded-md p-3 bg-card">
      <div className="flex items-center justify-between">
        <div className="font-medium">{task.apartmentName}</div>
        <Badge 
          className={
            task.status === "completed" ? "bg-green-100 text-green-800 border-green-200" :
            task.status === "inProgress" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
            "bg-gray-100 text-gray-800 border-gray-200"
          }
        >
          {task.status === "completed" ? "Completata" : 
           task.status === "inProgress" ? "In corso" : 
           "Da fare"}
        </Badge>
      </div>
      
      <div className="text-sm text-muted-foreground mt-1">
        {format(new Date(task.date), "EEEE d MMMM", { locale: it })}
      </div>
      
      <div className="mt-3">
        <Input
          placeholder="Note"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => onUpdateNotes(task.id, notes)}
          className="mb-2"
        />
        
        <Select 
          value={assignedTo} 
          onValueChange={(value) => {
            setAssignedTo(value);
            onUpdateAssignment(task.id, value);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Assegna" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Non assegnato</SelectItem>
            <SelectItem value="Maria">Maria</SelectItem>
            <SelectItem value="Giuseppe">Giuseppe</SelectItem>
            <SelectItem value="Anna">Anna</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex gap-2 mt-3">
        <Button 
          variant={task.status === "pending" ? "outline" : "secondary"} 
          size="sm"
          className="flex-1"
          onClick={() => onUpdateStatus(task.id, "pending")}
        >
          Da fare
        </Button>
        <Button 
          variant={task.status === "inProgress" ? "outline" : "secondary"} 
          size="sm"
          className="flex-1"
          onClick={() => onUpdateStatus(task.id, "inProgress")}
        >
          In corso
        </Button>
        <Button 
          variant={task.status === "completed" ? "outline" : "secondary"} 
          size="sm"
          className="flex-1"
          onClick={() => onUpdateStatus(task.id, "completed")}
        >
          Completata
        </Button>
      </div>
      
      <div className="mt-2 text-right">
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={() => onDelete(task.id)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const NewTaskDialog: React.FC<{
  onAddTask: (task: Omit<CleaningTask, "id">) => void;
  apartments: { id: string; name: string }[];
}> = ({ onAddTask, apartments }) => {
  const [date, setDate] = useState<Date>(new Date());
  const [apartmentId, setApartmentId] = useState("");
  const [notes, setNotes] = useState("");
  const [open, setOpen] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apartmentId) {
      toast.error("Seleziona un appartamento");
      return;
    }
    
    const apartmentName = apartments.find(apt => apt.id === apartmentId)?.name || "";
    
    onAddTask({
      apartmentId,
      apartmentName,
      date: date.toISOString(),
      status: "pending",
      notes
    });
    
    toast.success("Attività di pulizia aggiunta");
    
    // Reset form
    setApartmentId("");
    setNotes("");
    setOpen(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Aggiungi pulizia
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuova attività di pulizia</DialogTitle>
          <DialogDescription>
            Aggiungi una nuova attività di pulizia
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Appartamento</label>
            <Select value={apartmentId} onValueChange={setApartmentId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona appartamento" />
              </SelectTrigger>
              <SelectContent>
                {apartments.map(apt => (
                  <SelectItem key={apt.id} value={apt.id}>
                    {apt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium">Data</label>
            <div className="border rounded-md p-2">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                initialFocus
                className="mx-auto"
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium">Note</label>
            <Input
              placeholder="Note opzionali"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          
          <DialogFooter>
            <Button type="submit">Salva</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Componente principale avvolto nel provider
const AdminCleaningManagementWithProvider = () => (
  <CleaningProvider>
    <AdminCleaningManagementContent />
  </CleaningProvider>
);

// Contenuto interno che usa il context
const AdminCleaningManagementContent = () => {
  const { 
    cleaningTasks, 
    addTask, 
    updateTaskStatus, 
    updateTaskNotes, 
    updateTaskAssignment, 
    deleteTask, 
    generateTasksFromReservations, 
    getTasksByDate 
  } = useCleaningManagement();
  
  const { apartments } = useReservations();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<"calendar" | "list" | "statistics">("calendar");
  const isMobile = useIsMobile();
  
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
  
  // Filtra le attività di pulizia per appartamento
  const [selectedApartment, setSelectedApartment] = useState<string>("all");
  
  // Attività di pulizia filtrate per data e appartamento
  const filteredTasks = useMemo(() => {
    let tasks = getTasksByDate(selectedDate);
    
    if (selectedApartment !== "all") {
      tasks = tasks.filter(task => task.apartmentId === selectedApartment);
    }
    
    return tasks;
  }, [selectedDate, selectedApartment, getTasksByDate]);
  
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
  
  // Gestori eventi
  const handleGenerateTasks = () => {
    generateTasksFromReservations();
    toast.success("Attività di pulizia generate automaticamente");
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestione Pulizie</h2>
          <p className="text-muted-foreground">
            Pianifica e monitora le attività di pulizia
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Tabs value={view} onValueChange={(v) => setView(v as "calendar" | "list" | "statistics")}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="calendar">Calendario</TabsTrigger>
              <TabsTrigger value="list">Lista</TabsTrigger>
              <TabsTrigger value="statistics">Statistiche</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Select 
            value={selectedApartment} 
            onValueChange={setSelectedApartment}
          >
            <SelectTrigger className="min-w-[180px]">
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
          
          <Button variant="outline" onClick={handleGenerateTasks} className="whitespace-nowrap">
            Genera da prenotazioni
          </Button>
        </div>
        
        <NewTaskDialog onAddTask={addTask} apartments={apartments} />
      </div>
      
      {view === "calendar" && (
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
      )}
      
      {view === "list" && (
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
      )}
      
      {view === "statistics" && (
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
                {cleaningTasks
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
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map(task => (
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
                  ))
                }
                
                {cleaningTasks.filter(task => {
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
                }).length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    Nessuna attività imminente da completare
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// Esporta il componente avvolto nel provider
const AdminCleaningManagement = () => {
  return <AdminCleaningManagementWithProvider />;
};

export default AdminCleaningManagement;
