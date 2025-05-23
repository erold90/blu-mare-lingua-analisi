
import { CleaningTask } from "./types";
import { DataType } from "@/services/externalStorage";
import { databaseProxy } from "@/services/databaseProxy";
import { toast } from "sonner";
import { pingApi } from "@/api/apiClient";

export const loadCleaningTasks = async (): Promise<CleaningTask[]> => {
  try {
    const tasks = await databaseProxy.loadData<CleaningTask[]>(DataType.CLEANING_TASKS);
    return tasks || [];
  } catch (error) {
    console.error("Errore nel caricamento delle attività di pulizia:", error);
    return [];
  }
};

export const saveCleaningTasks = async (tasks: CleaningTask[]): Promise<void> => {
  try {
    await databaseProxy.saveData(DataType.CLEANING_TASKS, tasks);
  } catch (error) {
    console.error("Errore nel salvataggio delle attività di pulizia:", error);
  }
};

// Force a sync of cleaning tasks
export const syncCleaningTasks = async (): Promise<void> => {
  try {
    await databaseProxy.synchronize(DataType.CLEANING_TASKS);
  } catch (error) {
    console.error("Errore nella sincronizzazione delle attività di pulizia:", error);
    throw error;
  }
};

// Test della connessione al database
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    const response = await pingApi.testDatabaseConnection();
    
    if (response.success) {
      toast.success("Connessione al database MySQL stabilita con successo");
      console.info("Dettagli connessione database:", response.data);
      return true;
    } else {
      toast.error(`Errore di connessione al database: ${response.error}`);
      console.error("Errore nel test di connessione al database:", response.error);
      return false;
    }
  } catch (error) {
    toast.error("Impossibile verificare la connessione al database");
    console.error("Eccezione durante il test di connessione al database:", error);
    return false;
  }
};
