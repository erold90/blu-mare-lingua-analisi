
import { useState, useEffect } from "react";
import { CleaningTask } from "../useCleaningManagement";
import { supabaseService } from "@/services/supabaseService";
import { toast } from "sonner";

export const useCleaningData = (apartments: any[], reservationsLoading: boolean) => {
  const [cleaningTasks, setCleaningTasks] = useState<CleaningTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const transformSupabaseTask = (task: any): CleaningTask => {
    const apartment = apartments.find(apt => apt.id === task.apartment_id);
    
    return {
      id: task.id,
      apartmentId: task.apartment_id,
      apartmentName: apartment?.name || `Appartamento ${task.apartment_id}`,
      taskDate: task.task_date,
      taskType: task.task_type as CleaningTask["taskType"],
      status: (task.status === "in_progress" ? "inProgress" : task.status) as CleaningTask["status"],
      priority: task.priority as CleaningTask["priority"],
      assignee: task.assignee || undefined,
      notes: task.notes || undefined,
      estimatedDuration: task.estimated_duration || 60,
      actualDuration: task.actual_duration || undefined,
      deviceId: task.device_id || undefined,
      createdAt: task.created_at || undefined,
      updatedAt: task.updated_at || undefined
    };
  };

  const fetchTasks = async () => {
    if (reservationsLoading || apartments.length === 0) {
      console.log("Attendo il caricamento degli appartamenti...");
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("Caricamento attività di pulizia da Supabase...");
      const data = await supabaseService.cleaningTasks.getAll();
      
      const transformedTasks: CleaningTask[] = data.map(transformSupabaseTask);
      
      setCleaningTasks(transformedTasks);
      console.log(`Caricate ${transformedTasks.length} attività di pulizia da Supabase`);
    } catch (error) {
      console.error("Errore nel caricamento delle attività di pulizia:", error);
      toast.error("Errore nel caricamento delle attività di pulizia");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTasks = async () => {
    if (apartments.length === 0) {
      console.log("Impossibile aggiornare - appartamenti non ancora caricati");
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("Aggiornamento attività di pulizia...");
      const data = await supabaseService.cleaningTasks.getAll();
      const transformedTasks: CleaningTask[] = data.map(transformSupabaseTask);
      
      setCleaningTasks(transformedTasks);
      toast.success("Attività di pulizia sincronizzate");
    } catch (error) {
      console.error("Errore nella sincronizzazione delle attività:", error);
      toast.error("Errore nella sincronizzazione");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (apartments.length > 0 && !reservationsLoading) {
      fetchTasks();
    }
  }, [apartments.length, reservationsLoading]);

  return {
    cleaningTasks,
    setCleaningTasks,
    isLoading,
    refreshTasks
  };
};
