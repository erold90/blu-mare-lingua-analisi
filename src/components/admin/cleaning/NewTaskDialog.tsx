
import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { CleaningTask } from "@/hooks/useCleaningManagement";

interface NewTaskDialogProps {
  onAddTask: (task: Omit<CleaningTask, "id" | "createdAt" | "updatedAt">) => void;
  apartments: Array<{ id: string; name: string }>;
}

const NewTaskDialog: React.FC<NewTaskDialogProps> = ({ onAddTask, apartments }) => {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState({
    apartmentId: "",
    taskType: "checkout" as CleaningTask["taskType"],
    priority: "medium" as CleaningTask["priority"],
    assignee: "",
    notes: "",
    estimatedDuration: 60
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.apartmentId) {
      alert("Seleziona un appartamento");
      return;
    }
    
    const selectedApartment = apartments.find(apt => apt.id === formData.apartmentId);
    
    const newTask: Omit<CleaningTask, "id" | "createdAt" | "updatedAt"> = {
      apartmentId: formData.apartmentId,
      apartmentName: selectedApartment?.name,
      taskDate: format(selectedDate, "yyyy-MM-dd"),
      taskType: formData.taskType,
      status: "pending",
      priority: formData.priority,
      assignee: formData.assignee || undefined,
      notes: formData.notes || undefined,
      estimatedDuration: formData.estimatedDuration
    };
    
    onAddTask(newTask);
    
    // Reset form
    setFormData({
      apartmentId: "",
      taskType: "checkout",
      priority: "medium",
      assignee: "",
      notes: "",
      estimatedDuration: 60
    });
    setSelectedDate(new Date());
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuova Attività
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nuova Attività di Pulizia</DialogTitle>
          <DialogDescription>
            Crea una nuova attività di pulizia programmata
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="apartment">Appartamento</Label>
              <Select
                value={formData.apartmentId}
                onValueChange={(value) => setFormData({ ...formData, apartmentId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona appartamento" />
                </SelectTrigger>
                <SelectContent>
                  {apartments.map((apartment) => (
                    <SelectItem key={apartment.id} value={apartment.id}>
                      {apartment.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, "d MMM yyyy", { locale: it })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taskType">Tipo di Attività</Label>
              <Select
                value={formData.taskType}
                onValueChange={(value) => setFormData({ ...formData, taskType: value as CleaningTask["taskType"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checkout">Check-out</SelectItem>
                  <SelectItem value="maintenance">Manutenzione</SelectItem>
                  <SelectItem value="deep_clean">Pulizia Profonda</SelectItem>
                  <SelectItem value="inspection">Ispezione</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priorità</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as CleaningTask["priority"] })}
              >
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
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignee">Assegnato a</Label>
              <Input
                id="assignee"
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                placeholder="Nome della persona"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Durata stimata (min)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || 60 })}
                min="15"
                max="480"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Note</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Note aggiuntive..."
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button type="submit">
              Crea Attività
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewTaskDialog;
