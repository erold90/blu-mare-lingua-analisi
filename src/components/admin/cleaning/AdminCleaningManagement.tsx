import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCleaningManagement } from "@/hooks/cleaning/useCleaningManagement";
import { Calendar, Plus, CheckCircle2, Clock, AlertTriangle, Users, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

export const AdminCleaningManagement = () => {
  const {
    tasks,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    completeTask,
    getStats
  } = useCleaningManagement();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    apartment_id: '',
    task_date: '',
    task_type: 'checkout',
    priority: 'medium',
    assignee: '',
    estimated_duration: 60,
    notes: ''
  });

  const stats = getStats();

  const handleCreateTask = async () => {
    if (!newTask.apartment_id || !newTask.task_date) return;
    
    const success = await createTask(newTask);
    if (success) {
      setIsCreateDialogOpen(false);
      setNewTask({
        apartment_id: '',
        task_date: '',
        task_type: 'checkout',
        priority: 'medium',
        assignee: '',
        estimated_duration: 60,
        notes: ''
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      in_progress: 'default',
      completed: 'success',
      cancelled: 'destructive'
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: 'secondary',
      medium: 'default',
      high: 'warning',
      urgent: 'destructive'
    } as const;
    
    return <Badge variant={variants[priority as keyof typeof variants] || 'secondary'}>{priority}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestione Pulizie</h1>
          <p className="text-muted-foreground">
            Sistema completo di gestione delle pulizie e manutenzioni
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuova Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crea Nuova Task di Pulizia</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="apartment">Appartamento</Label>
                <Input
                  id="apartment"
                  value={newTask.apartment_id}
                  onChange={(e) => setNewTask({...newTask, apartment_id: e.target.value})}
                  placeholder="ID Appartamento"
                />
              </div>
              
              <div>
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={newTask.task_date}
                  onChange={(e) => setNewTask({...newTask, task_date: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="type">Tipo Task</Label>
                <Select value={newTask.task_type} onValueChange={(value) => setNewTask({...newTask, task_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checkout">Check-out</SelectItem>
                    <SelectItem value="checkin">Check-in</SelectItem>
                    <SelectItem value="maintenance">Manutenzione</SelectItem>
                    <SelectItem value="deep_clean">Pulizia Profonda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="priority">Priorità</Label>
                <Select value={newTask.priority} onValueChange={(value) => setNewTask({...newTask, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Bassa</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="assignee">Assegnato a</Label>
                <Input
                  id="assignee"
                  value={newTask.assignee}
                  onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}
                  placeholder="Email addetto pulizie"
                />
              </div>
              
              <div>
                <Label htmlFor="duration">Durata Stimata (minuti)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={newTask.estimated_duration}
                  onChange={(e) => setNewTask({...newTask, estimated_duration: parseInt(e.target.value)})}
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Note</Label>
                <Textarea
                  id="notes"
                  value={newTask.notes}
                  onChange={(e) => setNewTask({...newTask, notes: e.target.value})}
                  placeholder="Note aggiuntive..."
                />
              </div>
              
              <Button onClick={handleCreateTask} className="w-full">
                Crea Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiche */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale Task</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Attesa</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingTasks}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completionRate}% completamento
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgenti</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.urgentTasks}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista Task */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Task di Pulizia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nessuna task di pulizia presente
              </div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Appartamento {task.apartment_id}</h4>
                      {getStatusBadge(task.status)}
                      {getPriorityBadge(task.priority)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(task.task_date), "dd MMMM yyyy", { locale: it })} - {task.task_type}
                    </p>
                    {task.assignee && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {task.assignee}
                      </p>
                    )}
                    {task.notes && (
                      <p className="text-sm text-muted-foreground">{task.notes}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {task.status !== 'completed' && (
                      <Button
                        size="sm"
                        onClick={() => completeTask(task.id)}
                        variant="outline"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Completa
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteTask(task.id)}
                    >
                      Elimina
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};