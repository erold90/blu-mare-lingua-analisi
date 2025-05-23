
import React, { useState, useEffect } from "react";
import { useReservations } from "@/hooks/useReservations";
import { CleaningTask } from "./types";
import CleaningContext from "./CleaningContext";
import { 
  generateTasksFromReservationsUtil,
  getTasksByDateUtil,
  getTasksByApartmentIdUtil
} from "./cleaningOperations";
import { loadCleaningTasks, saveCleaningTasks, syncCleaningTasks } from "./cleaningStorage";
import { toast } from "sonner";
import { externalStorage, DataType } from "@/services/externalStorage";

export const CleaningProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [cleaningTasks, setCleaningTasks] = useState<CleaningTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { reservations, apartments } = useReservations();
  
  // Load cleaning tasks from external storage on start
  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const tasks = await loadCleaningTasks();
        setCleaningTasks(tasks);
      } catch (error) {
        console.error("Errore nel caricamento delle attività di pulizia:", error);
        toast.error("Errore nel caricamento delle attività di pulizia");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTasks();
    
    // Subscribe to updates
    const unsubscribe = externalStorage.subscribe(DataType.CLEANING_TASKS, async () => {
      console.log("Cleaning tasks updated externally, reloading");
      fetchTasks();
    });
    
    return () => {
      unsubscribe();
    };
  }, []);
  
  // Save cleaning tasks to external storage when they change
  useEffect(() => {
    if (!isLoading && cleaningTasks.length >= 0) {
      saveCleaningTasks(cleaningTasks);
    }
  }, [cleaningTasks, isLoading]);
  
  // Add a new cleaning task
  const addTask = (task: Omit<CleaningTask, "id">) => {
    const newTask: CleaningTask = {
      ...task,
      id: crypto.randomUUID()
    };
    
    setCleaningTasks(prev => [...prev, newTask]);
  };
  
  // Update a task's status
  const updateTaskStatus = (id: string, status: CleaningTask["status"]) => {
    setCleaningTasks(prev => 
      prev.map(task => task.id === id ? { ...task, status } : task)
    );
  };
  
  // Update a task's notes
  const updateTaskNotes = (id: string, notes: string) => {
    setCleaningTasks(prev => 
      prev.map(task => task.id === id ? { ...task, notes } : task)
    );
  };
  
  // Assign a task to a person
  const updateTaskAssignment = (id: string, assignedTo: string) => {
    setCleaningTasks(prev => 
      prev.map(task => task.id === id ? { ...task, assignedTo } : task)
    );
  };
  
  // Delete a task
  const deleteTask = (id: string) => {
    setCleaningTasks(prev => prev.filter(task => task.id !== id));
  };
  
  // Force refresh cleaning tasks
  const refreshTasks = async () => {
    setIsLoading(true);
    try {
      await syncCleaningTasks();
      const tasks = await loadCleaningTasks();
      setCleaningTasks(tasks);
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
    const newTasks = generateTasksFromReservationsUtil(
      reservations, 
      apartments, 
      cleaningTasks
    );
    
    // Add each new task
    newTasks.forEach(task => addTask(task));
  };
  
  // Get tasks for a specific date
  const getTasksByDate = (date: Date) => {
    return getTasksByDateUtil(cleaningTasks, date);
  };
  
  // Get tasks for a specific apartment
  const getTasksByApartmentId = (apartmentId: string) => {
    return getTasksByApartmentIdUtil(cleaningTasks, apartmentId);
  };
  
  return (
    <CleaningContext.Provider value={{
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
    }}>
      {children}
    </CleaningContext.Provider>
  );
};
