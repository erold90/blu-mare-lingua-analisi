import * as React from "react";
import { useState } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash } from "lucide-react";
import { CleaningTask } from "@/hooks/cleaning";

interface CleaningTaskCardProps {
  task: CleaningTask;
  onUpdateStatus: (id: string, status: CleaningTask["status"]) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onUpdateAssignment: (id: string, assignedTo: string) => void;
  onDelete: (id: string) => void;
}

const CleaningTaskCard: React.FC<CleaningTaskCardProps> = ({ 
  task, 
  onUpdateStatus, 
  onUpdateNotes, 
  onUpdateAssignment, 
  onDelete 
}) => {
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

export default CleaningTaskCard;
