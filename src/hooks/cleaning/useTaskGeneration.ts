
import { CleaningTask } from "../useCleaningManagement";
import { generateTasksFromReservationsUtil } from "./cleaningOperations";
import { toast } from "sonner";

export const useTaskGeneration = (
  reservations: any[],
  apartments: any[],
  cleaningTasks: CleaningTask[],
  addTask: (task: Omit<CleaningTask, "id" | "createdAt" | "updatedAt">) => Promise<void>
) => {
  const generateTasksFromReservations = () => {
    console.log("Generating tasks from reservations...", { 
      reservationsCount: reservations?.length || 0,
      apartmentsCount: apartments?.length || 0,
      cleaningTasksCount: cleaningTasks?.length || 0
    });
    
    if (!reservations || !apartments || reservations.length === 0) {
      console.warn("No reservations available for task generation", {
        reservations: !!reservations,
        reservationsLength: reservations?.length || 0,
        apartments: !!apartments,
        apartmentsLength: apartments?.length || 0
      });
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
    
    Promise.all(newTasks.map(task => addTask(task)))
      .then(() => {
        toast.success(`Generate ${newTasks.length} nuove attività di pulizia`);
      })
      .catch((error) => {
        console.error("Errore nella generazione delle attività:", error);
        toast.error("Errore nella generazione delle attività");
      });
  };

  return { generateTasksFromReservations };
};
