
import React, { useState, useEffect } from "react";
import { useReservations } from "@/hooks/useReservations";
import type { CleaningTask, CleaningContextType } from "../useCleaningManagement";
import CleaningContext from "./CleaningContext";
import { 
  generateTasksFromReservationsUtil,
  getTasksByDateUtil,
  getTasksByApartmentIdUtil
} from "./cleaningOperations";
import { loadCleaningTasks, saveCleaningTasks, syncCleaningTasks } from "./cleaningStorage";
import { toast } from "sonner";
import { externalStorage, DataType } from "@/services/externalStorage";
import { supabaseService } from "@/services/supabaseService";

export const CleaningProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [cleaningTasks, setCleaningTasks] = useState<CleaningTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { reservations, apartments, isLoading: reservationsLoading } = useReservations();
  
  // Load cleaning tasks from Supabase on start
  useEffect(() => {
    const fetchTasks = async () => {
      if (reservationsLoading) return; // Wait for reservations to load first
      
      setIsLoading(true);
      try {
        console.log("Loading cleaning tasks from Supabase...");
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
        console.error("Errore nel caricamento delle attività di pulizia:", error);
        // Fallback to local storage if Supabase fails
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
    
    if (apartments.length > 0) {
      fetchTasks();
    }
    
    // Subscribe to updates
    const unsubscribe = externalStorage.subscribe(DataType.CLEANING_TASKS, async () => {
      console.log("Cleaning tasks updated externally, reloading");
      fetchTasks();
    });
    
    return () => {
      unsubscribe();
    };
  }, [apartments, reservationsLoading]);
  
  // Add a new cleaning task
  const addTask = async (task: Omit<CleaningTask, "id" | "createdAt" | "updatedAt">) => {
    try {
      console.log("Adding new cleaning task:", task);
      
      const newTask = {
        id: crypto.randomUUID(),
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
      
      // Save to Supabase
      await supabaseService.cleaningTasks.create(newTask);
      
      // Update local state
      const localTask: CleaningTask = {
        id: newTask.id,
        apartmentId: newTask.apartment_id,
        apartmentName: apartments.find(apt => apt.id === newTask.apartment_id)?.name || 'Appartamento sconosciuto',
        taskDate: newTask.task_date,
        taskType: newTask.task_type as CleaningTask["taskType"],
        status: (newTask.status === "in_progress" ? "inProgress" : newTask.status) as CleaningTask["status"],
        priority: newTask.priority as CleaningTask["priority"],
        assignee: newTask.assignee || undefined,
        notes: newTask.notes || undefined,
        estimatedDuration: newTask.estimated_duration,
        actualDuration: newTask.actual_duration || undefined,
        deviceId: newTask.device_id || undefined
      };
      
      setCleaningTasks(prev => [...prev, localTask]);
      
      // Save to local storage as backup
      saveCleaningTasks([...cleaningTasks, localTask]);
      
      toast.success("Attività di pulizia aggiunta con successo");
    } catch (error) {
      console.error("Errore nell'aggiunta dell'attività:", error);
      toast.error("Errore nell'aggiungere l'attività di pulizia");
    }
  };
  
  // Update a task's status
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
      
      // Save to local storage as backup
      const updatedTasks = cleaningTasks.map(task => task.id === id ? { ...task, status } : task);
      saveCleaningTasks(updatedTasks);
      
      toast.success("Stato attività aggiornato");
    } catch (error) {
      console.error("Errore nell'aggiornamento dello stato:", error);
      toast.error("Errore nell'aggiornare lo stato dell'attività");
    }
  };
  
  // Update a task's notes
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
      
      // Save to local storage as backup
      const updatedTasks = cleaningTasks.map(task => task.id === id ? { ...task, notes } : task);
      saveCleaningTasks(updatedTasks);
      
      toast.success("Note aggiornate");
    } catch (error) {
      console.error("Errore nell'aggiornamento delle note:", error);
      toast.error("Errore nell'aggiornare le note");
    }
  };
  
  // Assign a task to a person
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
      
      // Save to local storage as backup
      const updatedTasks = cleaningTasks.map(task => task.id === id ? { ...task, assignee: assignedTo } : task);
      saveCleaningTasks(updatedTasks);
      
      toast.success("Assegnazione aggiornata");
    } catch (error) {
      console.error("Errore nell'aggiornamento dell'assegnazione:", error);
      toast.error("Errore nell'aggiornare l'assegnazione");
    }
  };
  
  // Delete a task
  const deleteTask = async (id: string) => {
    try {
      await supabaseService.cleaningTasks.delete(id);
      
      setCleaningTasks(prev => prev.filter(task => task.id !== id));
      
      // Save to local storage as backup
      const updatedTasks = cleaningTasks.filter(task => task.id !== id);
      saveCleaningTasks(updatedTasks);
      
      toast.success("Attività eliminata");
    } catch (error) {
      console.error("Errore nell'eliminazione dell'attività:", error);
      toast.error("Errore nell'eliminare l'attività");
    }
  };
  
  // Force refresh cleaning tasks
  const refreshTasks = async () => {
    setIsLoading(true);
    try {
      console.log("Refreshing cleaning tasks...");
      await syncCleaningTasks();
      
      // Reload from Supabase
      const data = await supabaseService.cleaningTasks.getAll();
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
      toast.success("Attività di pulizia sincronizzate");
    } catch (error) {
      console.error("Errore nella sincronizzazione delle attività:", error);
      toast.error("Errore nella sincronizzazione");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate tasks automatically from reservations
  const generateTasksFromReservations = () => {
    console.log("Generating tasks from reservations...", { reservations, apartments, cleaningTasks });
    
    if (!reservations || !apartments || reservations.length === 0) {
      toast.error("Nessuna prenotazione disponibile per generare attività");
      return;
    }

    const newTasks = generateTasksFromReservationsUtil(
      reservations, 
      apartments, 
      cleaningTasks
    );
    
    console.log("Generated new tasks:", newTasks);
    
    if (newTasks.length === 0) {
      toast.info("Nessuna nuova attività da generare");
      return;
    }
    
    // Add each new task
    Promise.all(newTasks.map(task => addTask(task)))
      .then(() => {
        toast.success(`Generate ${newTasks.length} nuove attività di pulizia`);
      })
      .catch((error) => {
        console.error("Errore nella generazione delle attività:", error);
        toast.error("Errore nella generazione delle attività");
      });
  };
  
  // Get tasks for a specific date
  const getTasksByDate = (date: Date) => {
    return getTasksByDateUtil(cleaningTasks, date);
  };
  
  // Get tasks for a specific apartment
  const getTasksByApartmentId = (apartmentId: string) => {
    return getTasksByApartmentIdUtil(cleaningTasks, apartmentId);
  };
  
  const contextValue: CleaningContextType = {
    cleaningTasks,
    addTask,
    updateTaskStatus,
    updateTaskNotes,
    updateTaskAssignment,
    deleteTask,
    generateTasksFromReservations,
    getTasksByDate,
    getTasksByApartmentId,
    refreshTasks,
    isLoading
  };
  
  return (
    <CleaningContext.Provider value={contextValue}>
      {children}
    </CleaningContext.Provider>
  );
};
