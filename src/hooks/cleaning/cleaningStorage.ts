
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
      toast.loading("Verificando connessione al database...");
      
      // Test di connessione prima di procedere
      const connectionTest = await pingApi.testDatabaseConnection();
      
      if (connectionTest.success) {
        toast.dismiss();
        toast.success("Database connesso, caricamento dati...");
        
        const response = await cleaningApi.getAll();
        
        if (response.success && Array.isArray(response.data)) {
          console.log(`Caricate ${response.data.length} attività dal database remoto`);
          toast.success(`Caricate ${response.data.length} attività dal database`);
          
          // Salviamo anche in modalità persistente
          savePersistentCleaningTasks(response.data);
          return response.data;
        } else {
          toast.dismiss();
          toast.warning("Risposta API non valida, utilizzo dati locali");
          console.warn("Risposta API non valida:", response);
        }
      } else {
        toast.dismiss();
        toast.warning("Database non raggiungibile, utilizzo dati locali");
        console.warn("Test connessione database fallito:", connectionTest.error);
      }
    } catch (apiError) {
      toast.dismiss();
      toast.error("Errore nell'accesso al database remoto");
      console.error("Errore nell'API cleaningApi.getAll():", apiError);
    }
    
    // Se il caricamento dal database remoto fallisce, tentiamo il database proxy
    console.log("Tentativo di caricamento dal database proxy...");
    try {
      const tasks = await databaseProxy.loadData<CleaningTask[]>(DataType.CLEANING_TASKS);
      
      if (tasks && Array.isArray(tasks) && tasks.length > 0) {
        console.log(`Loaded ${tasks.length} cleaning tasks from database proxy`);
        toast.info(`Caricate ${tasks.length} attività dal proxy database`);
        
        // Salviamo anche in modalità persistente
        savePersistentCleaningTasks(tasks);
        return tasks;
      }
    } catch (proxyError) {
      console.error("Errore nel caricamento dal database proxy:", proxyError);
    }
    
    // Se il database è vuoto o non disponibile, proviamo a caricare da localStorage persistente
    console.log("No cleaning tasks found in database, trying persistent storage");
    const persistentTasks = loadPersistentCleaningTasks();
    
    if (persistentTasks.length > 0) {
      console.log(`Loaded ${persistentTasks.length} cleaning tasks from persistent storage`);
      toast.info(`Caricate ${persistentTasks.length} attività dalla memoria locale`);
      
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
    toast.dismiss();
    toast.error("Errore nel caricamento delle attività di pulizia");
    
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
    toast.loading("Salvataggio attività in corso...");
    
    // Strategia 1: Tentativo diretto tramite API cleaning
    try {
      // Verifichiamo prima la connessione al database
      const connectionTest = await pingApi.testDatabaseConnection();
      
      if (connectionTest.success) {
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
          toast.dismiss();
          toast.success(`Salvate ${tasks.length} attività nel database`);
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
            toast.dismiss();
            toast.success(`Salvate ${tasks.length} attività nel database in batch`);
            return;
          } else {
            console.warn("Risposta batch non valida:", await response.text());
            throw new Error("Batch save failed");
          }
        }
      } else {
        throw new Error("Database non raggiungibile");
      }
    } catch (apiError) {
      console.error("Errore nel salvataggio diretto via API:", apiError);
    }
    
    // Strategia 2: Fallback al database proxy
    console.log("Fallback al database proxy per il salvataggio");
    try {
      await databaseProxy.saveData(DataType.CLEANING_TASKS, tasks);
      console.log("Attività salvate tramite database proxy");
      toast.dismiss();
      toast.success("Attività salvate nel database locale");
    } catch (proxyError) {
      console.error("Errore nel salvataggio tramite database proxy:", proxyError);
      toast.dismiss();
      toast.warning("Attività di pulizia salvate solo localmente");
    }
  } catch (error) {
    console.error("Errore nel salvataggio delle attività di pulizia:", error);
    toast.dismiss();
    toast.error("Errore nel salvataggio delle attività di pulizia");
  }
};

// Force a sync of cleaning tasks with improved robustness
export const syncCleaningTasks = async (): Promise<void> => {
  toast.loading("Sincronizzazione attività di pulizia in corso...");
  
  try {
    // Test della connessione prima di procedere con feedback visivo dettagliato
    console.log("Testando la connessione al database prima di sincronizzare...");
    const connTest = await pingApi.testDatabaseConnection();
    
    if (!connTest.success) {
      toast.dismiss();
      toast.error("Database non raggiungibile, impossibile sincronizzare");
      return;
    }
    
    toast.loading("Database raggiungibile, sincronizzazione in corso...");
    
    // Strategia 1: Sincronizzazione diretta via API
    try {
      console.log("Tentativo di sincronizzazione via API dedicata");
      const syncResponse = await fetch('/api/sync/cleaning_tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (syncResponse.ok) {
        try {
          const data = await syncResponse.json();
          if (data && data.success) {
            toast.dismiss();
            toast.success("Attività di pulizia sincronizzate con successo");
            console.log("Sincronizzazione completata via API dedicata:", data);
            return;
          } else {
            console.warn("Risposta di sincronizzazione non valida:", data);
            throw new Error("Sincronizzazione non riuscita");
          }
        } catch (parseError) {
          console.error("Errore nel parsing della risposta di sincronizzazione:", parseError);
          throw new Error("Errore nella risposta di sincronizzazione");
        }
      } else {
        console.warn("Risposta di sincronizzazione non valida:", await syncResponse.text());
        throw new Error("Sincronizzazione API fallita");
      }
    } catch (apiError) {
      console.error("Errore nella sincronizzazione via API:", apiError);
    }
    
    // Strategia 2: Fallback al database proxy con log dettagliati
    console.log("Fallback al database proxy per la sincronizzazione");
    try {
      await databaseProxy.synchronize(DataType.CLEANING_TASKS);
      toast.dismiss();
      toast.success("Attività di pulizia sincronizzate con successo via proxy");
      
      // Aggiorna timestamp dell'ultima sincronizzazione
      const now = Date.now();
      localStorage.setItem('last_sync_CLEANING_TASKS', now.toString());
      console.log("Timestamp sincronizzazione aggiornato:", new Date(now).toLocaleString());
    } catch (proxyError) {
      console.error("Errore nella sincronizzazione via proxy:", proxyError);
      toast.dismiss();
      toast.error("Errore nella sincronizzazione delle attività di pulizia");
      throw proxyError;
    }
  } catch (error) {
    console.error("Errore nella sincronizzazione delle attività di pulizia:", error);
    toast.dismiss();
    toast.error("Errore nella sincronizzazione delle attività di pulizia");
    throw error;
  }
};

// Test della connessione al database con dettagli diagnostici avanzati
export const testDatabaseConnection = async (): Promise<boolean> => {
  toast.loading("Test connessione al database in corso...");
  
  try {
    console.log("Inviando richiesta di test connessione database...");
    const response = await pingApi.testDatabaseConnection();
    
    if (response.success) {
      toast.dismiss();
      toast.success("Connessione al database MySQL stabilita con successo");
      console.info("Dettagli connessione database:", response.data);
      
      // Verifica ulteriore: prova a caricare un dato di test
      try {
        const testResponse = await cleaningApi.getAll();
        console.log("Test caricamento dati completato:", testResponse);
        
        if (testResponse.success) {
          toast.success("Test di lettura dati completato con successo");
        } else {
          toast.warning("Database connesso ma lettura dati non disponibile");
        }
      } catch (testError) {
        console.warn("Errore nel test di lettura dati:", testError);
        toast.warning("Database connesso ma test lettura fallito");
      }
      
      return true;
    } else {
      toast.dismiss();
      toast.error(`Errore di connessione al database: ${response.error || 'Connessione rifiutata'}`);
      console.error("Errore nel test di connessione al database:", response.error);
      return false;
    }
  } catch (error) {
    console.error("Eccezione durante il test di connessione al database:", error);
    
    // Analisi dettagliata dell'errore
    if (error instanceof Response) {
      try {
        const errorText = await error.text();
        console.error("Risposta errore dal server:", errorText);
        toast.dismiss();
        toast.error(`Errore server: ${errorText.substring(0, 50)}...`);
      } catch (e) {
        toast.dismiss();
        toast.error("Errore nella risposta del server");
      }
    } else {
      toast.dismiss();
      toast.error("Impossibile verificare la connessione al database");
    }
    
    return false;
  }
};
