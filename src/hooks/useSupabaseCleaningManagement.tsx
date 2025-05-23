
import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { supabaseService } from "@/services/supabaseService";

export interface CleaningTask {
  id: string;
  apartmentId: string;
  taskDate: string;
  taskType: "checkout" | "maintenance" | "deep_clean" | "inspection";
  status: "pending" | "inProgress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  assignee?: string;
  notes?: string;
  estimatedDuration: number;
  actualDuration?: number;
  deviceId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const useSupabaseCleaningManagement = () => {
  const [cleaningTasks, setCleaningTasks] = useState<CleaningTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deviceId] = useState<string>(() => {
    let id = localStorage.getItem('vmb_device_id');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('vmb_device_id', id);
    }
    return id;
  });

  const loadCleaningTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await supabaseService.cleaningTasks.getAll();
      
      // Transform Supabase data to match our interface
      const transformedTasks: CleaningTask[] = data.map(task => ({
        id: task.id,
        apartmentId: task.apartment_id,
        taskDate: task.task_date,
        taskType: task.task_type as "checkout" | "maintenance" | "deep_clean" | "inspection",
        status: task.status === "in_progress" ? "inProgress" : task.status as "pending" | "inProgress" | "completed" | "cancelled",
        priority: task.priority as "low" | "medium" | "high" | "urgent",
        assignee: task.assignee || undefined,
        notes: task.notes || undefined,
        estimatedDuration: task.estimated_duration || 60,
        actualDuration: task.actual_duration || undefined,
        deviceId: task.device_id || undefined,
        createdAt: task.created_at || undefined,
        updatedAt: task.updated_at || undefined
      }));
      
      setCleaningTasks(transformedTasks);
      console.log(`Loaded ${transformedTasks.length} cleaning tasks from Supabase`);
    } catch (error) {
      console.error("Failed to load cleaning tasks:", error);
      toast.error("Errore nel caricamento delle attività di pulizia");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addCleaningTask = useCallback(async (task: Omit<CleaningTask, "id" | "createdAt" | "updatedAt">) => {
    try {
      const newTask = {
        id: uuidv4(),
        apartment_id: task.apartmentId,
        task_date: task.taskDate,
        task_type: task.taskType,
        status: task.status === "inProgress" ? "in_progress" : task.status,
        priority: task.priority,
        assignee: task.assignee,
        notes: task.notes,
        estimated_duration: task.estimatedDuration,
        actual_duration: task.actualDuration,
        device_id: deviceId
      };
      
      await supabaseService.cleaningTasks.create(newTask);
      await loadCleaningTasks();
      toast.success("Attività di pulizia aggiunta con successo");
    } catch (error) {
      console.error("Error adding cleaning task:", error);
      toast.error("Errore nell'aggiungere l'attività di pulizia");
    }
  }, [deviceId, loadCleaningTasks]);

  const updateCleaningTask = useCallback(async (updatedTask: CleaningTask) => {
    try {
      const supabaseTask = {
        apartment_id: updatedTask.apartmentId,
        task_date: updatedTask.taskDate,
        task_type: updatedTask.taskType,
        status: updatedTask.status === "inProgress" ? "in_progress" : updatedTask.status,
        priority: updatedTask.priority,
        assignee: updatedTask.assignee,
        notes: updatedTask.notes,
        estimated_duration: updatedTask.estimatedDuration,
        actual_duration: updatedTask.actualDuration,
        device_id: deviceId
      };
      
      await supabaseService.cleaningTasks.update(updatedTask.id, supabaseTask);
      await loadCleaningTasks();
      toast.success("Attività di pulizia aggiornata con successo");
    } catch (error) {
      console.error("Error updating cleaning task:", error);
      toast.error("Errore nell'aggiornare l'attività di pulizia");
    }
  }, [deviceId, loadCleaningTasks]);

  const deleteCleaningTask = useCallback(async (id: string) => {
    try {
      await supabaseService.cleaningTasks.delete(id);
      await loadCleaningTasks();
      toast.success("Attività di pulizia eliminata con successo");
    } catch (error) {
      console.error("Error deleting cleaning task:", error);
      toast.error("Errore nell'eliminare l'attività di pulizia");
    }
  }, [loadCleaningTasks]);

  const saveCleaningTasks = useCallback(async (tasks: CleaningTask[]) => {
    try {
      const supabaseTasks = tasks.map(task => ({
        id: task.id,
        apartment_id: task.apartmentId,
        task_date: task.taskDate,
        task_type: task.taskType,
        status: task.status === "inProgress" ? "in_progress" : task.status,
        priority: task.priority,
        assignee: task.assignee,
        notes: task.notes,
        estimated_duration: task.estimatedDuration,
        actual_duration: task.actualDuration,
        device_id: deviceId
      }));
      
      await supabaseService.cleaningTasks.saveBatch(supabaseTasks);
      await loadCleaningTasks();
      toast.success(`Salvate ${tasks.length} attività di pulizia`);
    } catch (error) {
      console.error("Error saving cleaning tasks:", error);
      toast.error("Errore nel salvare le attività di pulizia");
    }
  }, [deviceId, loadCleaningTasks]);

  const syncCleaningTasks = useCallback(async () => {
    toast.loading("Sincronizzazione in corso...");
    try {
      await loadCleaningTasks();
      toast.dismiss();
      toast.success("Attività di pulizia sincronizzate con successo");
    } catch (error) {
      console.error("Error syncing cleaning tasks:", error);
      toast.dismiss();
      toast.error("Errore nella sincronizzazione");
    }
  }, [loadCleaningTasks]);

  useEffect(() => {
    loadCleaningTasks();
  }, [loadCleaningTasks]);

  return {
    cleaningTasks,
    isLoading,
    addCleaningTask,
    updateCleaningTask,
    deleteCleaningTask,
    saveCleaningTasks,
    syncCleaningTasks,
    refreshData: loadCleaningTasks
  };
};
