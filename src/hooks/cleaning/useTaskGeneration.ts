
import { CleaningTask } from "../useCleaningManagement";
import { generateTasksFromReservationsUtil } from "./cleaningOperations";
import { useCleaningValidation } from "../validation/useCleaningValidation";
import { toast } from "sonner";

export const useTaskGeneration = (
  reservations: any[],
  apartments: any[],
  cleaningTasks: CleaningTask[],
  addTask: (task: Omit<CleaningTask, "id" | "createdAt" | "updatedAt">) => Promise<void>
) => {
  const { validateBeforeCreate } = useCleaningValidation();

  const generateTasksFromReservations = async () => {
    console.log("Generazione attività dalle prenotazioni...", { 
      reservationsCount: reservations?.length || 0,
      apartmentsCount: apartments?.length || 0,
      cleaningTasksCount: cleaningTasks?.length || 0
    });
    
    if (!reservations || !apartments || reservations.length === 0 || apartments.length === 0) {
      console.warn("Nessuna prenotazione o appartamento disponibile per la generazione delle attività");
      toast.error("Nessuna prenotazione o appartamento disponibile per generare attività");
      return;
    }

    const newTasks = generateTasksFromReservationsUtil(
      reservations, 
      apartments, 
      cleaningTasks
    );
    
    console.log("Nuove attività generate:", newTasks);
    
    if (newTasks.length === 0) {
      toast.info("Nessuna nuova attività da generare");
      return;
    }
    
    try {
      let addedCount = 0;
      
      for (const task of newTasks) {
        // Validate each task before adding
        if (validateBeforeCreate(task, cleaningTasks)) {
          await addTask(task);
          addedCount++;
        }
      }
      
      if (addedCount > 0) {
        toast.success(`Generate ${addedCount} nuove attività di pulizia validate`);
      } else {
        toast.warning("Nessuna attività è stata generata a causa di errori di validazione");
      }
    } catch (error) {
      console.error("Errore nella generazione delle attività:", error);
      toast.error("Errore nella generazione delle attività");
    }
  };

  return { generateTasksFromReservations };
};
