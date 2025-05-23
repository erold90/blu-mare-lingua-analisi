
import { toast } from "sonner";
import { DataType } from "./externalStorage";
import { 
  reservationsApi, 
  cleaningApi, 
  apartmentsApi, 
  pricesApi, 
  syncApi,
  pingApi,
  systemApi
} from "@/api/apiClient";

interface MySQLConnectionOptions {
  host: string;
  username: string;
  database: string;
  port?: number;
}

class MySQLStorage {
  private baseUrl: string = "/api";
  private connectionOptions: MySQLConnectionOptions;
  private connected: boolean = false;
  private isInitializing: boolean = false;
  private initPromise: Promise<boolean> | null = null;
  private storagePrefix: string = "mysql_data_";
  private retryAttempts: number = 0;
  private maxRetries: number = 3;
  private lastConnectionAttempt: number = 0; // timestamp dell'ultimo tentativo di connessione
  private connectionTimeout: number = 30000; // 30 secondi tra un tentativo e l'altro
  
  constructor(options: MySQLConnectionOptions) {
    this.connectionOptions = options;
  }
  
  /**
   * Initialize connection to MySQL database via API
   */
  public async initialize(): Promise<boolean> {
    try {
      // Se c'è già un tentativo di inizializzazione in corso, ritorna quello
      if (this.isInitializing) {
        return this.initPromise || false;
      }
      
      // Limita i tentativi di connessione troppo frequenti
      const now = Date.now();
      if (now - this.lastConnectionAttempt < this.connectionTimeout) {
        console.log("Tentativo di connessione troppo recente, usando lo stato precedente:", this.connected);
        return this.connected;
      }
      
      this.lastConnectionAttempt = now;
      this.isInitializing = true;
      
      // Test la connessione al database tramite API
      console.log("Inizializzazione connessione MySQL tramite API:", this.connectionOptions.host);
      
      // Verifichiamo se l'API è raggiungibile con un timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondi di timeout
      
      try {
        // Prima proviamo a testare direttamente la connessione al database
        const dbTestResponse = await pingApi.testDatabaseConnection();
        clearTimeout(timeoutId);
        
        if (dbTestResponse.success) {
          console.log("Connessione al database MySQL verificata con successo:", dbTestResponse.data);
          this.connected = true;
          this.retryAttempts = 0;
          toast.success("Connessione al database MySQL stabilita");
          return true;
        }
        
        console.log("Test di connessione al database fallito, provo con il ping generico");
        
        // Fallback al ping generico
        const response = await fetch(`${this.baseUrl}/ping`, {
          signal: controller.signal,
          headers: {
            // Aggiungi un timestamp per evitare caching
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (response.ok) {
          console.log("API raggiungibili e funzionanti, ma database non disponibile");
          this.connected = false;
          toast.warning("API raggiungibili ma database non disponibile. Dati salvati solo localmente.");
          return false;
        } else {
          console.log("API non disponibili (risposta non ok), modalità offline attiva");
          this.connected = false;
          toast.warning("Modalità offline attiva: dati salvati localmente");
          return false;
        }
      } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
          console.log("Timeout nella connessione alle API");
          toast.error("Timeout nella connessione al server");
        } else {
          console.error("Errore nella connessione alle API:", error);
        }
        
        if (this.retryAttempts < this.maxRetries) {
          this.retryAttempts++;
          console.log(`Tentativo ${this.retryAttempts}/${this.maxRetries} di connessione fallito`);
          return false;
        } else {
          this.retryAttempts = 0;
          console.log("Numero massimo di tentativi raggiunto, modalità offline attiva");
          toast.warning("Passaggio alla modalità offline dopo multipli tentativi falliti");
          this.connected = false;
          return false;
        }
      } finally {
        this.isInitializing = false;
      }
    } catch (error) {
      console.error("Errore nella connessione alle API:", error);
      toast.error("Errore di connessione al server, lavorando in modalità offline");
      this.connected = false;
      this.isInitializing = false;
      return false;
    }
  }
  
  /**
   * Salva dati nel localStorage come fallback
   */
  private saveToLocalStorage<T>(type: DataType, data: T): void {
    try {
      localStorage.setItem(`${this.storagePrefix}${type}`, JSON.stringify(data));
    } catch (error) {
      console.error(`Errore nel salvataggio in localStorage per ${type}:`, error);
    }
  }

  /**
   * Carica dati dal localStorage come fallback
   */
  private loadFromLocalStorage<T>(type: DataType): T | null {
    try {
      const data = localStorage.getItem(`${this.storagePrefix}${type}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Errore nel caricamento da localStorage per ${type}:`, error);
      return null;
    }
  }
  
  /**
   * Load data from MySQL database via API
   */
  public async loadData<T>(type: DataType): Promise<T | null> {
    // Tentiamo di stabilire una connessione se necessario
    if (!this.connected) {
      await this.initialize();
    }
    
    try {
      console.log(`Caricamento dati ${type} da MySQL via API`);
      
      let response;
      
      switch(type) {
        case DataType.RESERVATIONS:
          response = await reservationsApi.getAll();
          break;
        case DataType.CLEANING_TASKS:
          response = await cleaningApi.getAll();
          break;
        case DataType.APARTMENTS:
          response = await apartmentsApi.getAll();
          break;
        case DataType.PRICES:
          // Per i prezzi dovremmo specificare l'anno, qui usiamo l'anno corrente come fallback
          const currentYear = new Date().getFullYear();
          response = await pricesApi.getByYear(currentYear);
          break;
        default:
          console.warn(`Tipo di dati non gestito: ${type}`);
          return this.loadFromLocalStorage<T>(type);
      }
      
      if (response.success && response.data) {
        console.log(`Dati caricati con successo dal server per ${type}:`, response.data);
        
        // Per il tipo RESERVATIONS, controlla se i dati sono un array vuoto (database vuoto)
        if (type === DataType.RESERVATIONS && Array.isArray(response.data) && response.data.length === 0) {
          console.log("Nessuna prenotazione nel database, verifico se ci sono dati locali");
          const localData = this.loadFromLocalStorage<T>(type);
          
          if (localData && Array.isArray(localData) && (localData as any[]).length > 0) {
            console.log("Trovati dati locali, li utilizzo e li sincronizzerò col server");
            
            // Se ci sono dati locali ma nessun dato sul server, sincronizziamo
            try {
              await this.saveData(type, localData);
              console.log("Dati locali sincronizzati con il server");
              return localData;
            } catch (syncError) {
              console.error("Errore nella sincronizzazione automatica:", syncError);
            }
            
            return localData;
          }
        }
        
        // Salva anche in localStorage come cache
        this.saveToLocalStorage(type, response.data);
        return response.data as T;
      }
      
      console.error(`Errore nel caricamento dei dati ${type} o dati vuoti:`, response.error);
      // Fallback al localStorage
      return this.loadFromLocalStorage<T>(type);
    } catch (error) {
      console.error(`Errore nel caricamento dei dati ${type} da MySQL:`, error);
      
      // Se non siamo connessi, proviamo a riconnettere
      if (!this.connected) {
        await this.initialize();
      }
      
      // In caso di errore, proviamo a caricare dal localStorage come fallback
      return this.loadFromLocalStorage<T>(type);
    }
  }
  
  /**
   * Save data to MySQL database via API
   */
  public async saveData<T>(type: DataType, data: T): Promise<boolean> {
    // Tentiamo di stabilire una connessione se necessario
    if (!this.connected) {
      await this.initialize();
    }
    
    // Salva immediatamente in localStorage per sicurezza
    this.saveToLocalStorage(type, data);
    
    try {
      console.log(`Salvataggio dati ${type} su MySQL via API`, data);
      
      let response;
      
      // Per salvataggi di collezioni dobbiamo gestire il caso in modo diverso
      if (Array.isArray(data)) {
        console.log(`Saving array of ${data.length} items for ${type}`);
        
        // Per le prenotazioni, dobbiamo salvare una ad una
        if (type === DataType.RESERVATIONS && data.length > 0) {
          console.log("Salvando prenotazioni una ad una");
          
          const results = await Promise.allSettled(
            (data as any[]).map(async (reservation) => {
              try {
                if (reservation.id) {
                  const updateResponse = await reservationsApi.update(reservation.id, reservation);
                  return updateResponse.success;
                } else {
                  const createResponse = await reservationsApi.create(reservation);
                  return createResponse.success;
                }
              } catch (error) {
                console.error(`Errore nel salvataggio della prenotazione ${reservation.id}:`, error);
                return false;
              }
            })
          );
          
          const allSuccess = results.every(result => result.status === 'fulfilled' && result.value === true);
          console.log(`Risultato salvataggio prenotazioni: ${allSuccess ? "completato" : "con errori"}`);
          
          if (!allSuccess) {
            toast.warning("Alcune prenotazioni potrebbero non essere state sincronizzate. Riprova più tardi.");
          }
          
          return allSuccess;
        }
        
        // Per le attività di pulizia, stesso approccio
        if (type === DataType.CLEANING_TASKS && data.length > 0) {
          console.log("Salvando attività di pulizia una ad una");
          
          const results = await Promise.allSettled(
            (data as any[]).map(async (task) => {
              try {
                if (task.id) {
                  const updateResponse = await cleaningApi.update(task.id, task);
                  return updateResponse.success;
                } else {
                  const createResponse = await cleaningApi.create(task);
                  return createResponse.success;
                }
              } catch (error) {
                console.error(`Errore nel salvataggio dell'attività ${task.id}:`, error);
                return false;
              }
            })
          );
          
          const allSuccess = results.every(result => result.status === 'fulfilled' && result.value === true);
          console.log(`Risultato salvataggio attività: ${allSuccess ? "completato" : "con errori"}`);
          return allSuccess;
        }
        
        // Per ora salviamo solo localmente per altri tipi di array
        console.log(`Dati di tipo array ${type} salvati solo in localStorage (API batch non implementata)`);
        return true;
      } else {
        // Per dati singoli, possiamo fare una richiesta API diretta
        switch(type) {
          case DataType.RESERVATIONS:
            if ('id' in (data as any)) {
              response = await reservationsApi.update((data as any).id, data);
            } else {
              response = await reservationsApi.create(data);
            }
            break;
          case DataType.CLEANING_TASKS:
            if ('id' in (data as any)) {
              response = await cleaningApi.update((data as any).id, data);
            } else {
              response = await cleaningApi.create(data);
            }
            break;
          default:
            console.warn(`Tipo di dati non gestito per il salvataggio: ${type}`);
            return false;
        }
        
        if (response && response.success) {
          return true;
        }
        
        console.error(`Errore nel salvataggio dei dati ${type}:`, response?.error);
        // Ritorna comunque true perché abbiamo salvato in localStorage
        toast.warning("Dato salvato localmente ma non sincronizzato con il database");
        return true;
      }
    } catch (error) {
      console.error(`Errore nel salvataggio dei dati ${type} su MySQL:`, error);
      toast.error("Errore di connessione, dati salvati solo localmente");
      
      // In caso di errore, consideriamo comunque un successo perché abbiamo salvato in localStorage
      return true;
    }
  }
  
  /**
   * Sincronizza i dati con il database MySQL tramite API
   */
  public async synchronize(type: DataType): Promise<void> {
    // Tentiamo di stabilire una connessione se necessario
    if (!this.connected) {
      const connected = await this.initialize();
      if (!connected) {
        toast.error("Database non connesso, impossibile sincronizzare");
        throw new Error("Connessione al server non disponibile, impossibile sincronizzare i dati");
      }
    }
    
    try {
      console.log(`Sincronizzazione dati ${type} con MySQL via API`);
      toast.loading(`Sincronizzazione in corso...`);
      
      // Prima otteniamo i dati locali
      const localData = this.loadFromLocalStorage<any>(type);
      
      // Se abbiamo dati locali e sono un array (come le prenotazioni), 
      // proviamo a sincronizzarli con il server
      if (localData && Array.isArray(localData) && localData.length > 0) {
        console.log(`Sincronizzando ${localData.length} elementi locali con il server per ${type}`);
        await this.saveData(type, localData);
      }
      
      // Poi chiamiamo l'API di sincronizzazione specifica
      let response;
      
      switch(type) {
        case DataType.RESERVATIONS:
          response = await syncApi.syncData('reservations');
          break;
        case DataType.CLEANING_TASKS:
          response = await syncApi.syncData('cleaning');
          break;
        case DataType.APARTMENTS:
          response = await syncApi.syncData('apartments');
          break;
        case DataType.PRICES:
          response = await syncApi.syncData('prices');
          break;
        default:
          console.warn(`Tipo di dati non gestito per la sincronizzazione: ${type}`);
          toast.dismiss();
          return;
      }
      
      if (response && response.success) {
        console.log(`Sincronizzazione ${type} completata con successo`);
        toast.dismiss();
        toast.success(`Sincronizzazione di ${this.getDataTypeLabel(type)} completata con successo`);
        
        // Dopo la sincronizzazione, ricarichiamo i dati dal server
        // per assicurarci di avere la versione più aggiornata
        const updatedData = await this.loadData(type);
        if (updatedData) {
          this.saveToLocalStorage(type, updatedData);
        }
      } else {
        console.error(`Errore nella sincronizzazione ${type}:`, response?.error);
        toast.dismiss();
        toast.error(`Errore nella sincronizzazione di ${this.getDataTypeLabel(type)}`);
      }
    } catch (error) {
      console.error(`Errore nella sincronizzazione dei dati ${type} con MySQL:`, error);
      toast.dismiss();
      toast.error(`Errore nella sincronizzazione di ${this.getDataTypeLabel(type)}`);
      throw error;
    }
  }
  
  /**
   * Forza la sincronizzazione di tutti i dati con il database
   */
  public async forceSyncAllData(): Promise<boolean> {
    try {
      const response = await systemApi.forceSyncAllData();
      
      if (response.success) {
        toast.success("Sincronizzazione di tutti i dati completata con successo");
        return true;
      } else {
        toast.error(`Errore nella sincronizzazione: ${response.error}`);
        return false;
      }
    } catch (error) {
      console.error("Errore nella sincronizzazione forzata:", error);
      toast.error("Errore durante la sincronizzazione dei dati");
      return false;
    }
  }
  
  /**
   * Verifica la connessione al database
   */
  public isConnected(): boolean {
    return this.connected;
  }
  
  /**
   * Ottiene una label leggibile per il tipo di dati
   */
  private getDataTypeLabel(type: DataType): string {
    switch(type) {
      case DataType.RESERVATIONS:
        return "prenotazioni";
      case DataType.CLEANING_TASKS:
        return "attività di pulizia";
      case DataType.APARTMENTS:
        return "appartamenti";
      case DataType.PRICES:
        return "prezzi";
      default:
        return type;
    }
  }
}

// Esporta un'istanza singleton con i dati di connessione dal database mostrato nell'immagine
export const mysqlStorage = new MySQLStorage({
  host: "31.11.39.219",  // hostname dal tuo database MySQL
  username: "Sql1864200", // username dal tuo database MySQL
  database: "Sql1864200_1", // prima database dal tuo elenco
});
