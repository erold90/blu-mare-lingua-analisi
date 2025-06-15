
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCleaningContext } from "@/hooks/cleaning/useCleaningContext";
import { useReservations } from "@/hooks/useReservations";
import { format, isToday, isPast } from "date-fns";
import { it } from "date-fns/locale";
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  CheckCircle, 
  Play, 
  Pause, 
  X,
  Edit2,
  MoreHorizontal 
} from "lucide-react";
import type { CleaningTask } from "@/hooks/useCleaningManagement";

interface CleaningTaskCardProps {
  task: CleaningTask;
}

const CleaningTaskCard: React.FC<CleaningTaskCardProps> = ({ task }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { updateTaskStatus } = useCleaningContext();
  const { apartments } = useReservations();

  const apartment = apartments.find(apt => apt.id === task.apartmentId);
  const taskDate = new Date(task.taskDate);
  const isTaskToday = isToday(taskDate);
  const isTaskOverdue = isPast(taskDate) && !isToday(taskDate) && task.status !== "completed";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "inProgress": return "bg-blue-100 text-blue-800 border-blue-300";
      case "completed": return "bg-green-100 text-green-800 border-green-300";
      case "cancelled": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "border-l-red-500";
      case "high": return "border-l-orange-500";
      case "medium": return "border-l-blue-500";
      case "low": return "border-l-gray-400";
      default: return "border-l-gray-400";
    }
  };

  const getTaskTypeInfo = (taskType: string) => {
    switch (taskType) {
      case "checkout": return { icon: "🛏️", label: "Check-out", color: "text-blue-600" };
      case "maintenance": return { icon: "🔧", label: "Manutenzione", color: "text-orange-600" };
      case "deep_clean": return { icon: "✨", label: "Pulizia Profonda", color: "text-purple-600" };
      case "inspection": return { icon: "🔍", label: "Ispezione", color: "text-green-600" };
      default: return { icon: "📝", label: "Attività", color: "text-gray-600" };
    }
  };

  const handleStatusChange = (newStatus: CleaningTask["status"]) => {
    updateTaskStatus(task.id, newStatus);
  };

  const getQuickActions = () => {
    switch (task.status) {
      case "pending":
        return (
          <Button 
            size="sm" 
            onClick={() => handleStatusChange("inProgress")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Play className="h-3 w-3 mr-1" />
            Inizia
          </Button>
        );
      case "inProgress":
        return (
          <div className="flex gap-1">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleStatusChange("pending")}
            >
              <Pause className="h-3 w-3 mr-1" />
              Pausa
            </Button>
            <Button 
              size="sm" 
              onClick={() => handleStatusChange("completed")}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              Completa
            </Button>
          </div>
        );
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completata
          </Badge>
        );
      default:
        return null;
    }
  };

  const taskTypeInfo = getTaskTypeInfo(task.taskType);

  return (
    <Card 
      className={`
        border-l-4 ${getPriorityColor(task.priority)} 
        transition-all duration-200 hover:shadow-md
        ${isTaskOverdue ? 'bg-red-50 border-red-200' : ''}
        ${isTaskToday ? 'bg-blue-50' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{taskTypeInfo.icon}</span>
              <div>
                <h3 className="font-semibold text-sm">{apartment?.name || "Appartamento"}</h3>
                <p className={`text-xs ${taskTypeInfo.color}`}>{taskTypeInfo.label}</p>
              </div>
            </div>
            <Badge className={getStatusColor(task.status)}>
              {task.status === "pending" ? "In Attesa" : 
               task.status === "inProgress" ? "In Corso" : 
               task.status === "completed" ? "Completata" : "Annullata"}
            </Badge>
          </div>

          {/* Informazioni data e tempo */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Calendar className="h-3 w-3" />
              <span className={isTaskToday ? "font-semibold text-blue-600" : ""}>
                {format(taskDate, "EEEE d MMMM", { locale: it })}
              </span>
              {isTaskOverdue && (
                <Badge variant="destructive" className="text-xs">Scaduta</Badge>
              )}
              {isTaskToday && (
                <Badge variant="default" className="text-xs bg-blue-600">Oggi</Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Clock className="h-3 w-3" />
              <span>{task.estimatedDuration} min stimati</span>
              {task.actualDuration && (
                <span>• {task.actualDuration} min effettivi</span>
              )}
            </div>
          </div>

          {/* Assegnatario e priorità */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              {task.assignee ? (
                <>
                  <User className="h-3 w-3" />
                  <span>{task.assignee}</span>
                </>
              ) : (
                <span className="text-gray-400 italic">Non assegnato</span>
              )}
            </div>
            
            <Badge variant="outline" className={
              task.priority === "urgent" ? "border-red-300 text-red-700" :
              task.priority === "high" ? "border-orange-300 text-orange-700" :
              task.priority === "medium" ? "border-blue-300 text-blue-700" :
              "border-gray-300 text-gray-700"
            }>
              {task.priority === "urgent" ? "🚨" :
               task.priority === "high" ? "⚡" :
               task.priority === "medium" ? "📋" : "📝"}
            </Badge>
          </div>

          {/* Note (se presenti) */}
          {task.notes && (
            <div className="text-xs bg-gray-50 p-2 rounded border-l-2 border-gray-300">
              <span className="font-medium">Note: </span>
              <span className="text-gray-700">{task.notes}</span>
            </div>
          )}

          {/* Azioni rapide */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex gap-1">
              {getQuickActions()}
            </div>
            
            {isHovered && (
              <Button size="sm" variant="ghost" className="opacity-70 hover:opacity-100">
                <Edit2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CleaningTaskCard;
