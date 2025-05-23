
import { CleaningTask } from "./types";
import { DataType } from "@/services/externalStorage";
import { databaseProxy } from "@/services/databaseProxy";
import { toast } from "sonner";
import { pingApi, cleaningApi } from "@/api/apiClient";

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
    // Prima tentiamo il caricamento dal database con strategia robusta
    try {
      console.log("Tentativo di caricamento dal database remoto...");
      const response = await cleaningApi.getAll();
      
      if (response.success && Array.isArray(response.data)) {
        console.log(`Caricate ${response.data.length} attività dal database remoto`);
        
        // Salviamo anche in modalità persistente
        savePersistentCleaningTasks(response.data);
        return response.data;
      }
    } catch (apiError) {
      console.error("Errore nell'API cleaningApi.getAll():", apiError);
    }
    
    // Se il caricamento dal database remoto fallisce, tentiamo il database proxy
    console.log("Tentativo di caricamento dal database proxy...");
    const tasks = await databaseProxy.loadData<CleaningTask[]>(DataType.CLEANING_TASKS);
    
    if (tasks && Array.isArray(tasks) && tasks.length > 0) {
      console.log(`Loaded ${tasks.length} cleaning tasks from database proxy`);
      
      // Salviamo anche in modalità persistente
      savePersistentCleaningTasks(tasks);
      return tasks;
    }
    
    // Se il database è vuoto o non disponibile, proviamo a caricare da localStorage persistente
    console.log("No cleaning tasks found in database, trying persistent storage");
    const persistentTasks = loadPersistentCleaningTasks();
    
    if (persistentTasks.length > 0) {
      console.log(`Loaded ${persistentTasks.length} cleaning tasks from persistent storage`);
      
      // Sincronizziamo questi dati con il database se è disponibile
      try {
        await saveCleaningTasks(persistentTasks);
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
    // Salviamo prima in localStorage persistente (backup immediato)
    savePersistentCleaningTasks(tasks);
    
    // Strategia 1: Tentativo diretto tramite API cleaning
    try {
      // Se l'array è piccolo usiamo singole chiamate, altrimenti batch
      if (tasks.length <= 5) {
        console.log("Salvando attività una per una via API diretta");
        for (const task of tasks) {
          if (task.id) {
            await cleaningApi.update(task.id, task);
          } else {
            await cleaningApi.create(task);
          }
        }
        console.log("Tutte le attività salvate con successo via API diretta");
        return;
      } else {
        // Per array grandi, tentiamo il batch endpoint se disponibile
        console.log("Tentativo di salvataggio batch via API...");
        const response = await fetch('/api/cleaning/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          body: JSON.stringify(tasks)
        });
        
        if (response.ok) {
          console.log("Batch save successful");
          return;
        }
      }
    } catch (apiError) {
      console.error("Errore nel salvataggio diretto via API:", apiError);
    }
    
    // Strategia 2: Fallback al database proxy
    console.log("Fallback al database proxy per il salvataggio");
    try {
      await databaseProxy.saveData(DataType.CLEANING_TASKS, tasks);
      console.log("Attività salvate tramite database proxy");
    } catch (proxyError) {
      console.error("Errore nel salvataggio tramite database proxy:", proxyError);
      toast.warning("Attività di pulizia salvate solo localmente");
    }
  } catch (error) {
    console.error("Errore nel salvataggio delle attività di pulizia:", error);
    toast.error("Errore nel salvataggio delle attività di pulizia");
  }
};

// Force a sync of cleaning tasks with improved robustness
export const syncCleaningTasks = async (): Promise<void> => {
  toast.loading("Sincronizzazione attività di pulizia in corso...");
  
  try {
    // Test della connessione prima di procedere
    const connTest = await pingApi.testDatabaseConnection();
    if (!connTest.success) {
      toast.dismiss();
      toast.error("Database non raggiungibile, impossibile sincronizzare");
      return;
    }
    
    // Strategia 1: Sincronizzazione diretta via API
    try {
      const syncResponse = await fetch('/api/sync/cleaning_tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (syncResponse.ok) {
        const data = await syncResponse.json();
        if (data.success) {
          toast.dismiss();
          toast.success("Attività di pulizia sincronizzate con successo");
          return;
        }
      }
    } catch (apiError) {
      console.error("Errore nella sincronizzazione via API:", apiError);
    }
    
    // Strategia 2: Fallback al database proxy
    console.log("Fallback al database proxy per la sincronizzazione");
    await databaseProxy.synchronize(DataType.CLEANING_TASKS);
    toast.dismiss();
    toast.success("Attività di pulizia sincronizzate con successo");
  } catch (error) {
    console.error("Errore nella sincronizzazione delle attività di pulizia:", error);
    toast.dismiss();
    toast.error("Errore nella sincronizzazione delle attività di pulizia");
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
