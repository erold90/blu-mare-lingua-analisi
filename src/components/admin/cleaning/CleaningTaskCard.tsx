
import * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, MapPin, Trash2, Edit2, Save, X } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useCleaningManagement, type CleaningTask } from "@/hooks/useCleaningManagement";
import { useReservations } from "@/hooks/useReservations";

interface CleaningTaskCardProps {
  task: CleaningTask;
}

const CleaningTaskCard: React.FC<CleaningTaskCardProps> = ({ task }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState(task.notes || "");
  const [editedAssignee, setEditedAssignee] = useState(task.assignee || "");
  const { updateTaskStatus, updateTaskNotes, updateTaskAssignment, deleteTask } = useCleaningManagement();
  const { apartments } = useReservations();
  
  const apartment = apartments.find(apt => apt.id === task.apartmentId);
  
  const getStatusColor = (status: CleaningTask["status"]) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "inProgress": return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  
  const getPriorityColor = (priority: CleaningTask["priority"]) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium": return "bg-blue-100 text-blue-800 border-blue-200";
      case "low": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  
  const getStatusLabel = (status: CleaningTask["status"]) => {
    switch (status) {
      case "pending": return "In Attesa";
      case "inProgress": return "In Corso";
      case "completed": return "Completata";
      case "cancelled": return "Annullata";
      default: return status;
    }
  };
  
  const getPriorityLabel = (priority: CleaningTask["priority"]) => {
    switch (priority) {
      case "urgent": return "Urgente";
      case "high": return "Alta";
      case "medium": return "Media";
      case "low": return "Bassa";
      default: return priority;
    }
  };
  
  const getTaskTypeLabel = (type: CleaningTask["taskType"]) => {
    switch (type) {
      case "checkout": return "Check-out";
      case "maintenance": return "Manutenzione";
      case "deep_clean": return "Pulizia Profonda";
      case "inspection": return "Ispezione";
      default: return type;
    }
  };
  
  const handleStatusChange = (newStatus: CleaningTask["status"]) => {
    updateTaskStatus(task.id, newStatus);
  };
  
  const handleSaveEdit = () => {
    if (editedNotes !== task.notes) {
      updateTaskNotes(task.id, editedNotes);
    }
    if (editedAssignee !== task.assignee) {
      updateTaskAssignment(task.id, editedAssignee);
    }
    setIsEditing(false);
  };
  
  const handleCancelEdit = () => {
    setEditedNotes(task.notes || "");
    setEditedAssignee(task.assignee || "");
    setIsEditing(false);
  };
  
  const handleDelete = () => {
    if (window.confirm("Sei sicuro di voler eliminare questa attività?")) {
      deleteTask(task.id);
    }
  };

  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{task.apartmentName || apartment?.name || 'Appartamento sconosciuto'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(task.taskDate), "EEEE d MMMM yyyy", { locale: it })}</span>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge className={getStatusColor(task.status)}>
            {getStatusLabel(task.status)}
          </Badge>
          <Badge className={getPriorityColor(task.priority)}>
            {getPriorityLabel(task.priority)}
          </Badge>
          <Badge variant="outline">
            {getTaskTypeLabel(task.taskType)}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Durata stimata: {task.estimatedDuration} minuti</span>
        </div>
        
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Assegnato a:</label>
              <Input
                value={editedAssignee}
                onChange={(e) => setEditedAssignee(e.target.value)}
                placeholder="Nome della persona"
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Note:</label>
              <Textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                placeholder="Aggiungi note..."
                className="mt-1"
                rows={3}
              />
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveEdit}>
                <Save className="h-4 w-4 mr-1" />
                Salva
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                <X className="h-4 w-4 mr-1" />
                Annulla
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {task.assignee && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Assegnato a: <strong>{task.assignee}</strong></span>
              </div>
            )}
            
            {task.notes && (
              <div className="text-sm bg-muted p-2 rounded">
                <strong>Note:</strong> {task.notes}
              </div>
            )}
          </div>
        )}
        
        <div className="pt-2">
          <Select
            value={task.status}
            onValueChange={(value) => handleStatusChange(value as CleaningTask["status"])}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">In Attesa</SelectItem>
              <SelectItem value="inProgress">In Corso</SelectItem>
              <SelectItem value="completed">Completata</SelectItem>
              <SelectItem value="cancelled">Annullata</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default CleaningTaskCard;
