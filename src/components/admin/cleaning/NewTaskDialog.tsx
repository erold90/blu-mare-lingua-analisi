
import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { CleaningTask } from "@/hooks/cleaning";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface NewTaskDialogProps {
  onAddTask: (task: Omit<CleaningTask, "id">) => void;
  apartments: { id: string; name: string }[];
}

const NewTaskDialog: React.FC<NewTaskDialogProps> = ({ onAddTask, apartments }) => {
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

export default NewTaskDialog;
