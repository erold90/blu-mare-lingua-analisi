
import { CleaningTask } from "./types";
import { DataType } from "@/services/externalStorage";
import { databaseProxy } from "@/services/databaseProxy";
import { toast } from "sonner";
import { pingApi } from "@/api/apiClient";

// Chiave per il localStorage persistente
const PERSISTENT_STORAGE_KEY = 'persistent_cleaning_tasks';

// Funzione per salvare i dati in modo persistente (resistente ai cookie cancellati)
export const savePersistentCleaningTasks = (tasks: CleaningTask[]): void => {
  try {
    localStorage.setItem(PERSISTENT_STORAGE_KEY, JSON.stringify(tasks));
    console.log('Attività di pulizia salvate in localStorage persistente:', tasks.length, 'attività');
  } catch (error) {
    console.error('Errore nel salvare attività di pulizia persistenti:', error);
  }
};

// Funzione per caricare dati persistenti
export const loadPersistentCleaningTasks = (): CleaningTask[] => {
  try {
    const storedData = localStorage.getItem(PERSISTENT_STORAGE_KEY);
    if (storedData) {
      const data = JSON.parse(storedData);
      console.log('Attività di pulizia caricate da localStorage persistente:', data.length, 'attività');
      return data;
    }
  } catch (error) {
    console.error('Errore nel caricare attività di pulizia persistenti:', error);
  }
  return [];
};

export const loadCleaningTasks = async (): Promise<CleaningTask[]> => {
  try {
    // Prima tentiamo il caricamento dal database
    const tasks = await databaseProxy.loadData<CleaningTask[]>(DataType.CLEANING_TASKS);
    
    if (tasks && Array.isArray(tasks) && tasks.length > 0) {
      console.log(`Loaded ${tasks.length} cleaning tasks from database`);
      
      // Salviamo anche in modalità persistente
      savePersistentCleaningTasks(tasks);
      return tasks;
    }
    
    // Se il database è vuoto o non disponibile, proviamo a caricare da localStorage persistente
    console.log("No cleaning tasks found in database, trying persistent storage");
    const persistentTasks = loadPersistentCleaningTasks();
    
    if (persistentTasks.length > 0) {
      console.log(`Loaded ${persistentTasks.length} cleaning tasks from persistent storage`);
      
      // Sincronizziamo questi dati con il database
      try {
        await databaseProxy.saveData(DataType.CLEANING_TASKS, persistentTasks);
        console.log("Synchronized persistent cleaning tasks with database");
      } catch (syncError) {
        console.error("Failed to sync persistent cleaning tasks with database:", syncError);
      }
      
      return persistentTasks;
    }
    
    // Se non troviamo dati da nessuna parte
    console.log("No cleaning tasks found in any storage");
    return [];
  } catch (error) {
    console.error("Errore nel caricamento delle attività di pulizia:", error);
    
    // In caso di errore, proviamo comunque a caricare da localStorage persistente
    const persistentTasks = loadPersistentCleaningTasks();
    if (persistentTasks.length > 0) {
      console.log(`Recovered ${persistentTasks.length} cleaning tasks from persistent storage after error`);
      toast.info("Utilizzando dati di pulizia salvati localmente");
      return persistentTasks;
    }
    
    return [];
  }
};

export const saveCleaningTasks = async (tasks: CleaningTask[]): Promise<void> => {
  try {
    await databaseProxy.saveData(DataType.CLEANING_TASKS, tasks);
    
    // Salviamo anche in localStorage persistente
    savePersistentCleaningTasks(tasks);
  } catch (error) {
    console.error("Errore nel salvataggio delle attività di pulizia:", error);
    
    // In caso di errore nel database, salviamo comunque in localStorage persistente
    savePersistentCleaningTasks(tasks);
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
