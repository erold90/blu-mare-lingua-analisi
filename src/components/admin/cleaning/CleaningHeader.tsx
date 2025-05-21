import * as React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import NewTaskDialog from "./NewTaskDialog";
import { useReservations } from "@/hooks/useReservations";
import { useCleaningManagement } from "@/hooks/cleaning";

interface CleaningHeaderProps {
  view: "calendar" | "list" | "statistics";
  setView: (view: "calendar" | "list" | "statistics") => void;
  selectedApartment: string;
  setSelectedApartment: (apartment: string) => void;
}

const CleaningHeader: React.FC<CleaningHeaderProps> = ({
  view,
  setView,
  selectedApartment,
  setSelectedApartment
}) => {
  const { apartments } = useReservations();
  const { addTask, generateTasksFromReservations } = useCleaningManagement();
  
  const handleGenerateTasks = () => {
    generateTasksFromReservations();
    toast.success("Attività di pulizia generate automaticamente");
  };

  return (
    <>
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
    </>
  );
};

export default CleaningHeader;
