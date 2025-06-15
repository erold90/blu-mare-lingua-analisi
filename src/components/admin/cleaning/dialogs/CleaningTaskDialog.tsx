
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCleaningContext } from "@/hooks/cleaning/useCleaningContext";
import { useReservations } from "@/hooks/useReservations";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { CalendarIcon, Clock, User, AlertCircle } from "lucide-react";
import type { CleaningTask } from "@/hooks/useCleaningManagement";

interface CleaningTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CleaningTaskDialog: React.FC<CleaningTaskDialogProps> = ({ open, onOpenChange }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [apartmentId, setApartmentId] = useState<string>("");
  const [taskType, setTaskType] = useState<CleaningTask["taskType"]>("checkout");
  const [priority, setPriority] = useState<CleaningTask["priority"]>("medium");
  const [assignee, setAssignee] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [estimatedDuration, setEstimatedDuration] = useState<number>(60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addTask } = useCleaningContext();
  const { apartments } = useReservations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apartmentId) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await addTask({
        apartmentId,
        taskDate: format(selectedDate, 'yyyy-MM-dd'),
        taskType,
        status: "pending",
        priority,
        assignee: assignee || undefined,
        notes: notes || undefined,
        estimatedDuration,
      });
      
      // Reset form
      setApartmentId("");
      setTaskType("checkout");
      setPriority("medium");
      setAssignee("");
      setNotes("");
      setEstimatedDuration(60);
      setSelectedDate(new Date());
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTaskTypeInfo = (type: CleaningTask["taskType"]) => {
    switch (type) {
      case "checkout": return { icon: "🛏️", label: "Pulizia Check-out", duration: 90 };
      case "maintenance": return { icon: "🔧", label: "Manutenzione", duration: 120 };
      case "deep_clean": return { icon: "✨", label: "Pulizia Profonda", duration: 180 };
      case "inspection": return { icon: "🔍", label: "Ispezione", duration: 30 };
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Nuova Attività di Pulizia
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Appartamento */}
          <div>
            <Label htmlFor="apartment">Appartamento</Label>
            <Select value={apartmentId} onValueChange={setApartmentId} required>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona appartamento" />
              </SelectTrigger>
              <SelectContent>
                {apartments.map((apt) => (
                  <SelectItem key={apt.id} value={apt.id}>
                    {apt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data */}
          <div>
            <Label>Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "PPP", { locale: it })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  locale={it}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Tipo di attività */}
          <div>
            <Label htmlFor="taskType">Tipo di Attività</Label>
            <Select 
              value={taskType} 
              onValueChange={(value) => {
                setTaskType(value as CleaningTask["taskType"]);
                const info = getTaskTypeInfo(value as CleaningTask["taskType"]);
                setEstimatedDuration(info.duration);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checkout">
                  <div className="flex items-center gap-2">
                    <span>🛏️</span>
                    <span>Pulizia Check-out</span>
                  </div>
                </SelectItem>
                <SelectItem value="maintenance">
                  <div className="flex items-center gap-2">
                    <span>🔧</span>
                    <span>Manutenzione</span>
                  </div>
                </SelectItem>
                <SelectItem value="deep_clean">
                  <div className="flex items-center gap-2">
                    <span>✨</span>
                    <span>Pulizia Profonda</span>
                  </div>
                </SelectItem>
                <SelectItem value="inspection">
                  <div className="flex items-center gap-2">
                    <span>🔍</span>
                    <span>Ispezione</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priorità */}
          <div>
            <Label htmlFor="priority">Priorità</Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as CleaningTask["priority"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <span>📝</span>
                    <span>Bassa</span>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <span>📋</span>
                    <span>Media</span>
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <span>⚡</span>
                    <span>Alta</span>
                  </div>
                </SelectItem>
                <SelectItem value="urgent">
                  <div className="flex items-center gap-2">
                    <span>🚨</span>
                    <span>Urgente</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Durata stimata */}
          <div>
            <Label htmlFor="duration">Durata Stimata (minuti)</Label>
            <Input
              type="number"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(Number(e.target.value))}
              min="15"
              max="480"
              step="15"
            />
          </div>

          {/* Assegnatario */}
          <div>
            <Label htmlFor="assignee">Assegnato a (opzionale)</Label>
            <Input
              placeholder="Nome della persona"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
            />
          </div>

          {/* Note */}
          <div>
            <Label htmlFor="notes">Note (opzionali)</Label>
            <Textarea
              placeholder="Dettagli aggiuntivi..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Azioni */}
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={!apartmentId || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Creazione..." : "Crea Attività"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CleaningTaskDialog;
