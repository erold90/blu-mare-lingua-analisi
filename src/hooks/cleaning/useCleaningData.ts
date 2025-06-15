
import { useState, useEffect } from "react";
import { CleaningTask } from "../useCleaningManagement";
import { supabaseService } from "@/services/supabaseService";
import { loadCleaningTasks, saveCleaningTasks, syncCleaningTasks } from "./cleaningStorage";
import { toast } from "sonner";
import { externalStorage, DataType } from "@/services/externalStorage";

export const useCleaningData = (apartments: any[], reservationsLoading: boolean) => {
  const [cleaningTasks, setCleaningTasks] = useState<CleaningTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const transformSupabaseTask = (task: any): CleaningTask => {
    const apartment = apartments.find(apt => apt.id === task.apartment_id);
    return {
      id: task.id,
      apartmentId: task.apartment_id,
      apartmentName: apartment?.name || 'Appartamento sconosciuto',
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
    if (reservationsLoading) return;
    
    setIsLoading(true);
    try {
      console.log("Loading cleaning tasks from Supabase...");
      const data = await supabaseService.cleaningTasks.getAll();
      
      const transformedTasks: CleaningTask[] = data.map(transformSupabaseTask);
      
      setCleaningTasks(transformedTasks);
      console.log(`Loaded ${transformedTasks.length} cleaning tasks from Supabase`);
    } catch (error) {
      console.error("Errore nel caricamento delle attività di pulizia:", error);
      try {
        const localTasks = await loadCleaningTasks();
        setCleaningTasks(localTasks);
        console.log("Loaded cleaning tasks from local storage as fallback");
      } catch (localError) {
        console.error("Errore anche nel caricamento locale:", localError);
        toast.error("Errore nel caricamento delle attività di pulizia");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTasks = async () => {
    setIsLoading(true);
    try {
      console.log("Refreshing cleaning tasks...");
      await syncCleaningTasks();
      
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
    if (apartments.length > 0) {
      fetchTasks();
    }
    
    const unsubscribe = externalStorage.subscribe(DataType.CLEANING_TASKS, async () => {
      console.log("Cleaning tasks updated externally, reloading");
      fetchTasks();
    });
    
    return () => {
      unsubscribe();
    };
  }, [apartments, reservationsLoading]);

  return {
    cleaningTasks,
    setCleaningTasks,
    isLoading,
    refreshTasks
  };
};
