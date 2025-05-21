
import React, { useState, useEffect } from "react";
import { useReservations } from "@/hooks/useReservations";
import { CleaningTask } from "./types";
import CleaningContext from "./CleaningContext";
import { 
  generateTasksFromReservationsUtil,
  getTasksByDateUtil,
  getTasksByApartmentIdUtil
} from "./cleaningOperations";
import { loadCleaningTasks, saveCleaningTasks } from "./cleaningStorage";

export const CleaningProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [cleaningTasks, setCleaningTasks] = useState<CleaningTask[]>([]);
  const { reservations, apartments } = useReservations();
  
  // Load cleaning tasks from localStorage on start
  useEffect(() => {
    setCleaningTasks(loadCleaningTasks());
  }, []);
  
  // Save cleaning tasks to localStorage when they change
  useEffect(() => {
    saveCleaningTasks(cleaningTasks);
  }, [cleaningTasks]);
  
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
      getTasksByApartmentId
    }}>
      {children}
    </CleaningContext.Provider>
  );
};
