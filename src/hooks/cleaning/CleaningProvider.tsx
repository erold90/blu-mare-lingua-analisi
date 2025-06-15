
import React from "react";
import { useReservations } from "@/hooks/useReservations";
import type { CleaningContextType } from "../useCleaningManagement";
import CleaningContext from "./CleaningContext";
import { getTasksByDateUtil, getTasksByApartmentIdUtil } from "./cleaningOperations";
import { useCleaningData } from "./useCleaningData";
import { useCleaningCrud } from "./useCleaningCrud";
import { useTaskGeneration } from "./useTaskGeneration";

export const CleaningProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { reservations, apartments, isLoading: reservationsLoading } = useReservations();
  
  const { cleaningTasks, setCleaningTasks, isLoading, refreshTasks } = useCleaningData(
    apartments, 
    reservationsLoading
  );
  
  const { addTask, updateTaskStatus, updateTaskNotes, updateTaskAssignment, deleteTask } = useCleaningCrud(
    cleaningTasks,
    setCleaningTasks,
    apartments
  );
  
  const { generateTasksFromReservations } = useTaskGeneration(
    reservations,
    apartments,
    cleaningTasks,
    addTask
  );
  
  const getTasksByDate = (date: Date) => {
    return getTasksByDateUtil(cleaningTasks, date);
  };
  
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
