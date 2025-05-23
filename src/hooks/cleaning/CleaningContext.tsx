
import React, { createContext, useContext } from "react";
import { CleaningTask } from "./types";

// Interface for the cleaning context
export interface CleaningContextType {
  cleaningTasks: CleaningTask[];
  addTask: (task: Omit<CleaningTask, "id">) => void;
  updateTaskStatus: (id: string, status: CleaningTask["status"]) => void;
  updateTaskNotes: (id: string, notes: string) => void;
  updateTaskAssignment: (id: string, assignedTo: string) => void;
  deleteTask: (id: string) => void;
  generateTasksFromReservations: () => void;
  getTasksByDate: (date: Date) => CleaningTask[];
  getTasksByApartmentId: (apartmentId: string) => CleaningTask[];
  refreshTasks: () => Promise<void>; // Nuova funzione per forzare l'aggiornamento
  isLoading: boolean; // Stato di caricamento
}

// Create the context
const CleaningContext = createContext<CleaningContextType | undefined>(undefined);

// Create a hook to use the cleaning context
export const useCleaningContext = () => {
  const context = useContext(CleaningContext);
  
  if (context === undefined) {
    throw new Error("useCleaningContext deve essere usato all'interno di un CleaningProvider");
  }
  
  return context;
};

export default CleaningContext;
