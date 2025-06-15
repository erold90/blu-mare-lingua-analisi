
import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { supabaseService } from "@/services/supabaseService";
import { useReservations } from "@/hooks/useReservations";

export interface CleaningTask {
  id: string;
  apartmentId: string;
  apartmentName?: string;
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

export interface CleaningContextType {
  cleaningTasks: CleaningTask[];
  addTask: (task: Omit<CleaningTask, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateTaskStatus: (id: string, status: CleaningTask["status"]) => Promise<void>;
  updateTaskNotes: (id: string, notes: string) => Promise<void>;
  updateTaskAssignment: (id: string, assignedTo: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  generateTasksFromReservations: () => void;
  getTasksByDate: (date: Date) => CleaningTask[];
  getTasksByApartmentId: (apartmentId: string) => CleaningTask[];
  refreshTasks: () => Promise<void>;
  isLoading: boolean;
}

export const useCleaningManagement = () => {
  const [cleaningTasks, setCleaningTasks] = useState<CleaningTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { apartments, reservations } = useReservations();
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
      const transformedTasks: CleaningTask[] = data.map(task => {
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
      });
      
      setCleaningTasks(transformedTasks);
      console.log(`Loaded ${transformedTasks.length} cleaning tasks from Supabase`);
    } catch (error) {
      console.error("Failed to load cleaning tasks:", error);
      toast.error("Errore nel caricamento delle attività di pulizia");
    } finally {
      setIsLoading(false);
    }
  }, [apartments]);

  const addTask = useCallback(async (task: Omit<CleaningTask, "id" | "createdAt" | "updatedAt">) => {
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

  const updateTaskStatus = useCallback(async (id: string, status: CleaningTask["status"]) => {
    try {
      const task = cleaningTasks.find(t => t.id === id);
      if (!task) return;

      const updatedTask = {
        ...task,
        status,
        apartment_id: task.apartmentId,
        task_date: task.taskDate,
        task_type: task.taskType,
        priority: task.priority,
        assignee: task.assignee,
        notes: task.notes,
        estimated_duration: task.estimatedDuration,
        actual_duration: task.actualDuration,
        device_id: deviceId
      };

      const supabaseTask = {
        apartment_id: updatedTask.apartment_id,
        task_date: updatedTask.task_date,
        task_type: updatedTask.task_type,
        status: status === "inProgress" ? "in_progress" : status,
        priority: updatedTask.priority,
        assignee: updatedTask.assignee,
        notes: updatedTask.notes,
        estimated_duration: updatedTask.estimated_duration,
        actual_duration: updatedTask.actual_duration,
        device_id: deviceId
      };
      
      await supabaseService.cleaningTasks.update(id, supabaseTask);
      await loadCleaningTasks();
      toast.success("Stato attività aggiornato con successo");
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Errore nell'aggiornare lo stato dell'attività");
    }
  }, [cleaningTasks, deviceId, loadCleaningTasks]);

  const updateTaskNotes = useCallback(async (id: string, notes: string) => {
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
        device_id: deviceId
      };
      
      await supabaseService.cleaningTasks.update(id, supabaseTask);
      await loadCleaningTasks();
      toast.success("Note attività aggiornate con successo");
    } catch (error) {
      console.error("Error updating task notes:", error);
      toast.error("Errore nell'aggiornare le note dell'attività");
    }
  }, [cleaningTasks, deviceId, loadCleaningTasks]);

  const updateTaskAssignment = useCallback(async (id: string, assignedTo: string) => {
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
        device_id: deviceId
      };
      
      await supabaseService.cleaningTasks.update(id, supabaseTask);
      await loadCleaningTasks();
      toast.success("Assegnazione attività aggiornata con successo");
    } catch (error) {
      console.error("Error updating task assignment:", error);
      toast.error("Errore nell'aggiornare l'assegnazione dell'attività");
    }
  }, [cleaningTasks, deviceId, loadCleaningTasks]);

  const deleteTask = useCallback(async (id: string) => {
    try {
      await supabaseService.cleaningTasks.delete(id);
      await loadCleaningTasks();
      toast.success("Attività di pulizia eliminata con successo");
    } catch (error) {
      console.error("Error deleting cleaning task:", error);
      toast.error("Errore nell'eliminare l'attività di pulizia");
    }
  }, [loadCleaningTasks]);

  const generateTasksFromReservations = useCallback(() => {
    if (!reservations || !apartments) {
      toast.error("Dati prenotazioni o appartamenti non disponibili");
      return;
    }

    const newTasks: Omit<CleaningTask, "id" | "createdAt" | "updatedAt">[] = [];
    const today = new Date();
    
    reservations.forEach(reservation => {
      const checkOutDate = new Date(reservation.endDate);
      
      // Genera attività di pulizia solo per check-out futuri o di oggi
      if (checkOutDate >= today) {
        reservation.apartmentIds.forEach(apartmentId => {
          const apartment = apartments.find(apt => apt.id === apartmentId);
          if (apartment) {
            // Verifica se esiste già un'attività per questo appartamento e data
            const existingTask = cleaningTasks.find(task => 
              task.apartmentId === apartmentId && 
              task.taskDate === reservation.endDate &&
              task.taskType === "checkout"
            );

            if (!existingTask) {
              newTasks.push({
                apartmentId: apartmentId,
                apartmentName: apartment.name,
                taskDate: reservation.endDate,
                taskType: "checkout",
                status: "pending",
                priority: "medium",
                estimatedDuration: 90,
                deviceId: deviceId,
                notes: `Pulizia post check-out - Ospite: ${reservation.guestName}`
              });
            }
          }
        });
      }
    });

    if (newTasks.length > 0) {
      // Aggiungi tutte le nuove attività
      Promise.all(newTasks.map(task => addTask(task)))
        .then(() => {
          toast.success(`Generate ${newTasks.length} nuove attività di pulizia`);
        })
        .catch((error) => {
          console.error("Error generating tasks:", error);
          toast.error("Errore nella generazione delle attività");
        });
    } else {
      toast.info("Nessuna nuova attività da generare");
    }
  }, [reservations, apartments, cleaningTasks, deviceId, addTask]);

  const getTasksByDate = useCallback((date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return cleaningTasks.filter(task => task.taskDate === dateString);
  }, [cleaningTasks]);

  const getTasksByApartmentId = useCallback((apartmentId: string) => {
    return cleaningTasks.filter(task => task.apartmentId === apartmentId);
  }, [cleaningTasks]);

  const refreshTasks = useCallback(async () => {
    await loadCleaningTasks();
  }, [loadCleaningTasks]);

  useEffect(() => {
    if (apartments.length > 0) {
      loadCleaningTasks();
    }
  }, [loadCleaningTasks, apartments]);

  return {
    cleaningTasks,
    isLoading,
    addTask,
    updateTaskStatus,
    updateTaskNotes,
    updateTaskAssignment,
    deleteTask,
    generateTasksFromReservations,
    getTasksByDate,
    getTasksByApartmentId,
    refreshTasks
  };
};
