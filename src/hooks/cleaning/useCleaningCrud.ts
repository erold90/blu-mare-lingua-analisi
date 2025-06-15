
import { CleaningTask } from "../useCleaningManagement";
import { supabaseService } from "@/services/supabaseService";
import { toast } from "sonner";

export const useCleaningCrud = (
  cleaningTasks: CleaningTask[],
  setCleaningTasks: React.Dispatch<React.SetStateAction<CleaningTask[]>>,
  apartments: any[]
) => {
  const addTask = async (task: Omit<CleaningTask, "id" | "createdAt" | "updatedAt">) => {
    try {
      console.log("Aggiunta nuova attività di pulizia:", task);
      
      // Verifica che l'appartamento esista
      const apartment = apartments.find(apt => apt.id === task.apartmentId);
      if (!apartment) {
        console.error(`Appartamento con ID ${task.apartmentId} non trovato`);
        toast.error(`Appartamento non trovato: ${task.apartmentId}`);
        return;
      }
      
      const newTask = {
        apartment_id: task.apartmentId,
        task_date: task.taskDate,
        task_type: task.taskType,
        status: task.status === "inProgress" ? "in_progress" : task.status,
        priority: task.priority,
        assignee: task.assignee,
        notes: task.notes,
        estimated_duration: task.estimatedDuration,
        actual_duration: task.actualDuration,
        device_id: task.deviceId || crypto.randomUUID()
      };
      
      const createdTask = await supabaseService.cleaningTasks.create(newTask);
      
      const localTask: CleaningTask = {
        id: createdTask.id,
        apartmentId: createdTask.apartment_id,
        apartmentName: apartment.name,
        taskDate: createdTask.task_date,
        taskType: createdTask.task_type as CleaningTask["taskType"],
        status: (createdTask.status === "in_progress" ? "inProgress" : createdTask.status) as CleaningTask["status"],
        priority: createdTask.priority as CleaningTask["priority"],
        assignee: createdTask.assignee || undefined,
        notes: createdTask.notes || undefined,
        estimatedDuration: createdTask.estimated_duration,
        actualDuration: createdTask.actual_duration || undefined,
        deviceId: createdTask.device_id || undefined,
        createdAt: createdTask.created_at || undefined,
        updatedAt: createdTask.updated_at || undefined
      };
      
      setCleaningTasks(prev => [...prev, localTask]);
      toast.success("Attività di pulizia aggiunta con successo");
    } catch (error) {
      console.error("Errore nell'aggiunta dell'attività:", error);
      toast.error("Errore nell'aggiungere l'attività di pulizia");
      throw error;
    }
  };

  const updateTaskStatus = async (id: string, status: CleaningTask["status"]) => {
    try {
      const task = cleaningTasks.find(t => t.id === id);
      if (!task) return;

      const supabaseTask = {
        apartment_id: task.apartmentId,
        task_date: task.taskDate,
        task_type: task.taskType,
        status: status === "inProgress" ? "in_progress" : status,
        priority: task.priority,
        assignee: task.assignee,
        notes: task.notes,
        estimated_duration: task.estimatedDuration,
        actual_duration: task.actualDuration,
        device_id: task.deviceId || crypto.randomUUID()
      };
      
      await supabaseService.cleaningTasks.update(id, supabaseTask);
      
      setCleaningTasks(prev => 
        prev.map(task => task.id === id ? { ...task, status } : task)
      );
      
      toast.success("Stato attività aggiornato");
    } catch (error) {
      console.error("Errore nell'aggiornamento dello stato:", error);
      toast.error("Errore nell'aggiornare lo stato dell'attività");
    }
  };

  const updateTaskNotes = async (id: string, notes: string) => {
    try {
      const task = cleaningTasks.find(t => t.id === id);
      if (!task) return;

      const supabaseTask = {
        apartment_id: task.apartmentId,
        task_date: task.taskDate,
        task_type: task.taskType,
        status: task.status === "inProgress" ? "in_progress" : task.status,
        priority: task.priority,
        assignee: task.assignee,
        notes: notes,
        estimated_duration: task.estimatedDuration,
        actual_duration: task.actualDuration,
        device_id: task.deviceId || crypto.randomUUID()
      };
      
      await supabaseService.cleaningTasks.update(id, supabaseTask);
      
      setCleaningTasks(prev => 
        prev.map(task => task.id === id ? { ...task, notes } : task)
      );
      
      toast.success("Note aggiornate");
    } catch (error) {
      console.error("Errore nell'aggiornamento delle note:", error);
      toast.error("Errore nell'aggiornare le note");
    }
  };

  const updateTaskAssignment = async (id: string, assignedTo: string) => {
    try {
      const task = cleaningTasks.find(t => t.id === id);
      if (!task) return;

      const supabaseTask = {
        apartment_id: task.apartmentId,
        task_date: task.taskDate,
        task_type: task.taskType,
        status: task.status === "inProgress" ? "in_progress" : task.status,
        priority: task.priority,
        assignee: assignedTo,
        notes: task.notes,
        estimated_duration: task.estimatedDuration,
        actual_duration: task.actualDuration,
        device_id: task.deviceId || crypto.randomUUID()
      };
      
      await supabaseService.cleaningTasks.update(id, supabaseTask);
      
      setCleaningTasks(prev => 
        prev.map(task => task.id === id ? { ...task, assignee: assignedTo } : task)
      );
      
      toast.success("Assegnazione aggiornata");
    } catch (error) {
      console.error("Errore nell'aggiornamento dell'assegnazione:", error);
      toast.error("Errore nell'aggiornare l'assegnazione");
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await supabaseService.cleaningTasks.delete(id);
      
      setCleaningTasks(prev => prev.filter(task => task.id !== id));
      
      toast.success("Attività eliminata");
    } catch (error) {
      console.error("Errore nell'eliminazione dell'attività:", error);
      toast.error("Errore nell'eliminare l'attività");
    }
  };

  return {
    addTask,
    updateTaskStatus,
    updateTaskNotes,
    updateTaskAssignment,
    deleteTask
  };
};
