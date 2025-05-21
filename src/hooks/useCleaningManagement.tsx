
import React, { createContext, useContext, useState, useEffect } from "react";
import { useReservations, Reservation } from "@/hooks/useReservations";
import { addDays, format } from "date-fns";
import { it } from 'date-fns/locale';

// Definizione dei tipi
export interface CleaningTask {
  id: string;
  apartmentId: string;
  apartmentName: string;
  date: string; // ISO date string
  status: "pending" | "inProgress" | "completed";
  notes?: string;
  assignedTo?: string;
}

interface CleaningContextType {
  cleaningTasks: CleaningTask[];
  addTask: (task: Omit<CleaningTask, "id">) => void;
  updateTaskStatus: (id: string, status: CleaningTask["status"]) => void;
  updateTaskNotes: (id: string, notes: string) => void;
  updateTaskAssignment: (id: string, assignedTo: string) => void;
  deleteTask: (id: string) => void;
  generateTasksFromReservations: () => void;
  getTasksByDate: (date: Date) => CleaningTask[];
  getTasksByApartmentId: (apartmentId: string) => CleaningTask[];
}

const CleaningContext = createContext<CleaningContextType | undefined>(undefined);

export const CleaningProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [cleaningTasks, setCleaningTasks] = useState<CleaningTask[]>([]);
  const { reservations, apartments } = useReservations();
  
  // Carica le attività di pulizia da localStorage all'avvio
  useEffect(() => {
    const savedTasks = localStorage.getItem("cleaningTasks");
    if (savedTasks) {
      try {
        setCleaningTasks(JSON.parse(savedTasks));
      } catch (error) {
        console.error("Errore nel parsing delle attività di pulizia:", error);
      }
    }
  }, []);
  
  // Salva le attività di pulizia su localStorage quando cambiano
  useEffect(() => {
    localStorage.setItem("cleaningTasks", JSON.stringify(cleaningTasks));
  }, [cleaningTasks]);
  
  // Aggiunge una nuova attività di pulizia
  const addTask = (task: Omit<CleaningTask, "id">) => {
    const newTask: CleaningTask = {
      ...task,
      id: crypto.randomUUID()
    };
    
    setCleaningTasks(prev => [...prev, newTask]);
  };
  
  // Aggiorna lo stato di un'attività
  const updateTaskStatus = (id: string, status: CleaningTask["status"]) => {
    setCleaningTasks(prev => 
      prev.map(task => task.id === id ? { ...task, status } : task)
    );
  };
  
  // Aggiorna le note di un'attività
  const updateTaskNotes = (id: string, notes: string) => {
    setCleaningTasks(prev => 
      prev.map(task => task.id === id ? { ...task, notes } : task)
    );
  };
  
  // Assegna un'attività a una persona
  const updateTaskAssignment = (id: string, assignedTo: string) => {
    setCleaningTasks(prev => 
      prev.map(task => task.id === id ? { ...task, assignedTo } : task)
    );
  };
  
  // Elimina un'attività
  const deleteTask = (id: string) => {
    setCleaningTasks(prev => prev.filter(task => task.id !== id));
  };
  
  // Genera automaticamente attività di pulizia dalle prenotazioni
  const generateTasksFromReservations = () => {
    const newTasks: Omit<CleaningTask, "id">[] = [];
    
    // Per ogni prenotazione, crea un'attività di pulizia per il giorno del check-out
    reservations.forEach(reservation => {
      const checkoutDate = new Date(reservation.endDate);
      
      // Per ogni appartamento nella prenotazione
      reservation.apartmentIds.forEach(apartmentId => {
        // Trova il nome dell'appartamento
        const apartment = apartments.find(apt => apt.id === apartmentId);
        if (!apartment) return;
        
        // Crea l'attività di pulizia
        newTasks.push({
          apartmentId,
          apartmentName: apartment.name,
          date: checkoutDate.toISOString(),
          status: "pending",
          notes: `Pulizia dopo il checkout di ${reservation.guestName}`
        });
      });
    });
    
    // Aggiungi le nuove attività (evitando duplicati)
    const existingDates = cleaningTasks.map(task => 
      `${task.apartmentId}-${new Date(task.date).toISOString().split('T')[0]}`
    );
    
    newTasks.forEach(task => {
      const taskKey = `${task.apartmentId}-${new Date(task.date).toISOString().split('T')[0]}`;
      if (!existingDates.includes(taskKey)) {
        addTask(task);
      }
    });
  };
  
  // Ottieni le attività per una data specifica
  const getTasksByDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return cleaningTasks.filter(task => 
      new Date(task.date).toISOString().split('T')[0] === dateStr
    );
  };
  
  // Ottieni le attività per un appartamento specifico
  const getTasksByApartmentId = (apartmentId: string) => {
    return cleaningTasks.filter(task => task.apartmentId === apartmentId);
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

export const useCleaningManagement = () => {
  const context = useContext(CleaningContext);
  
  if (context === undefined) {
    throw new Error("useCleaningManagement deve essere usato all'interno di un CleaningProvider");
  }
  
  return context;
};
