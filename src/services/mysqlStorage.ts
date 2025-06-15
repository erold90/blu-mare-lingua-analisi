import { toast } from "sonner";
import { DataType } from "./externalStorage";
import { 
  reservationsApi, 
  apartmentsApi, 
  pricesApi, 
  syncApi,
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
  private lastConnectionAttempt: number = 0;
  private connectionTimeout: number = 30000;
  
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
      
      console.log("Test connessione al database MySQL...");
      
      try {
        // Testiamo la connessione usando l'endpoint di sistema
        const dbTestResponse = await systemApi.getStatus();
        
        if (dbTestResponse.success) {
          console.log("Connessione al database MySQL verificata con successo:", dbTestResponse.data);
          this.connected = true;
          this.retryAttempts = 0;
          return true;
        }
        
        console.log("Test di connessione al database fallito:", dbTestResponse.error);
        this.connected = false;
        return false;
      } catch (error) {
        console.error("Errore nella connessione al database:", error);
        
        if (this.retryAttempts < this.maxRetries) {
          this.retryAttempts++;
          console.log(`Tentativo ${this.retryAttempts}/${this.maxRetries} di connessione fallito`);
          return false;
        } else {
          this.retryAttempts = 0;
          console.log("Numero massimo di tentativi raggiunto, modalità offline attiva");
          this.connected = false;
          return false;
        }
      } finally {
        this.isInitializing = false;
      }
    } catch (error) {
      console.error("Errore generale nell'inizializzazione:", error);
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
   * Load data from MySQL database via API with improved error handling
   */
  public async loadData<T>(type: DataType): Promise<T | null> {
    // Tentiamo di stabilire una connessione se necessario
    if (!this.connected) {
      await this.initialize();
    }
    
    try {
      console.log(`Caricamento dati ${type} da MySQL via API`);
      
      if (!this.connected) {
        console.log(`MySQL non connesso, uso localStorage per ${type}`);
        return this.loadFromLocalStorage<T>(type);
      }
      
      let response;
      
      switch(type) {
        case DataType.RESERVATIONS:
          response = await reservationsApi.getAll();
          break;
        case DataType.CLEANING_TASKS:
          // Since we removed cleaningApi, we'll fall back to localStorage for cleaning tasks
          console.log(`Cleaning API non disponibile, uso localStorage per ${type}`);
          return this.loadFromLocalStorage<T>(type);
        case DataType.APARTMENTS:
          response = await apartmentsApi.getAll();
          break;
        case DataType.PRICES:
          const currentYear = new Date().getFullYear();
          response = await pricesApi.getByYear(currentYear);
          break;
        default:
          console.warn(`Tipo di dati non gestito: ${type}`);
          return this.loadFromLocalStorage<T>(type);
      }
      
      if (response.success && response.data) {
        console.log(`Dati caricati con successo dal server per ${type}:`, response.data);
        
        // Verifica se i dati sono validi
        if (this.isValidData(response.data, type)) {
          // Salva in localStorage come cache
          this.saveToLocalStorage(type, response.data);
          return response.data as T;
        } else {
          console.warn(`Dati ricevuti dal server per ${type} non validi`, response.data);
          return this.loadFromLocalStorage<T>(type);
        }
      }
      
      console.error(`Errore nel caricamento dei dati ${type} o dati vuoti:`, response.error);
      // Fallback al localStorage
      return this.loadFromLocalStorage<T>(type);
    } catch (error) {
      console.error(`Errore nel caricamento dei dati ${type} da MySQL:`, error);
      return this.loadFromLocalStorage<T>(type);
    }
  }
  
  /**
   * Verifica se i dati sono validi in base al tipo
   */
  private isValidData(data: any, type: DataType): boolean {
    if (data === null || data === undefined) return false;
    
    switch(type) {
      case DataType.RESERVATIONS:
        return Array.isArray(data);
      case DataType.CLEANING_TASKS:
        return Array.isArray(data);
      case DataType.APARTMENTS:
        return Array.isArray(data);
      case DataType.PRICES:
        return data !== null;
      default:
        return true;
    }
  }
  
  /**
   * Save data to MySQL database via API with improved batch handling
   */
  public async saveData<T>(type: DataType, data: T): Promise<boolean> {
    // Tentiamo di stabilire una connessione se necessario
    if (!this.connected) {
      await this.initialize();
    }
    
    // Salva immediatamente in localStorage per sicurezza
    this.saveToLocalStorage(type, data);
    
    if (!this.connected) {
      console.log(`MySQL non connesso, dati salvati solo in localStorage per ${type}`);
      return false;
    }
    
    try {
      console.log(`Salvataggio dati ${type} su MySQL via API`, data);
      
      // Per salvataggi di collezioni dobbiamo gestire il caso in modo diverso
      if (Array.isArray(data)) {
        console.log(`Saving array of ${data.length} items for ${type}`);
        
        // Per le prenotazioni, dobbiamo processarle in batch
        if (type === DataType.RESERVATIONS && data.length > 0) {
          return await this.saveReservationsBatch(data);
        }
        
        // Per le attività di pulizia, ora usiamo solo localStorage
        if (type === DataType.CLEANING_TASKS && data.length > 0) {
          console.log(`Cleaning tasks salvate solo in localStorage (API non disponibile)`);
          return true; // Considera un successo dato che è salvato in localStorage
        }
        
        // Per ora salviamo solo localmente per altri tipi di array
        console.log(`Dati di tipo array ${type} salvati solo in localStorage (API batch non implementata)`);
        return false;
      } else {
        // Per dati singoli, possiamo fare una richiesta API diretta
        return await this.saveSingleItem(type, data);
      }
    } catch (error) {
      console.error(`Errore nel salvataggio dei dati ${type} su MySQL:`, error);
      return false;
    }
  }
  
  /**
   * Salvataggio batch di prenotazioni con gestione errori migliorata
   */
  private async saveReservationsBatch(reservations: any[]): Promise<boolean> {
    try {
      console.log(`Salvataggio batch di ${reservations.length} prenotazioni`);
      
      // Suddividi le prenotazioni in batch più piccoli per evitare timeout
      const batchSize = 5;
      const batches = [];
      
      for (let i = 0; i < reservations.length; i += batchSize) {
        batches.push(reservations.slice(i, i + batchSize));
      }
      
      console.log(`Creati ${batches.length} batch di prenotazioni`);
      
      // Processa ogni batch
      let successCount = 0;
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`Processando batch ${i+1}/${batches.length} con ${batch.length} prenotazioni`);
        
        const results = await Promise.allSettled(
          batch.map(async (reservation) => {
            try {
              if (reservation.id) {
                const updateResponse = await reservationsApi.update(reservation.id, reservation);
                return updateResponse.success;
              } else {
                const createResponse = await reservationsApi.create(reservation);
                return createResponse.success;
              }
            } catch (error) {
              console.error(`Errore nel salvataggio della prenotazione ${reservation.id || 'nuova'}:`, error);
              return false;
            }
          })
        );
        
        // Conta i successi
        const batchSuccesses = results.filter(result => 
          result.status === 'fulfilled' && result.value === true
        ).length;
        
        successCount += batchSuccesses;
        console.log(`Batch ${i+1}/${batches.length}: ${batchSuccesses}/${batch.length} prenotazioni salvate`);
      }
      
      const allSuccess = successCount === reservations.length;
      console.log(`Risultato salvataggio prenotazioni: ${successCount}/${reservations.length} salvate`);
      
      if (!allSuccess) {
        toast.warning(`Alcune prenotazioni (${reservations.length - successCount}) non sono state sincronizzate. I dati potrebbero non essere visibili su altri dispositivi.`);
      }
      
      return successCount > 0; // Consideriamo un successo parziale come un successo
    } catch (error) {
      console.error("Errore nel salvataggio batch di prenotazioni:", error);
      return false;
    }
  }
  
  /**
   * Salvataggio batch di attività di pulizia - ora deprecato, usa solo localStorage
   */
  private async saveCleaningTasksBatch(tasks: any[]): Promise<boolean> {
    console.log(`Cleaning API non disponibile, attività di pulizia salvate solo in localStorage`);
    return true; // Considera un successo dato che è salvato in localStorage
  }
  
  /**
   * Salvataggio di un singolo elemento
   */
  private async saveSingleItem(type: DataType, data: any): Promise<boolean> {
    try {
      let response;
      
      switch(type) {
        case DataType.RESERVATIONS:
          if ('id' in data) {
            response = await reservationsApi.update(data.id, data);
          } else {
            response = await reservationsApi.create(data);
          }
          break;
        case DataType.CLEANING_TASKS:
          console.log(`Cleaning API non disponibile, attività salvata solo in localStorage`);
          return true; // Considera un successo dato che è salvato in localStorage
        default:
          console.warn(`Tipo di dati non gestito per il salvataggio: ${type}`);
          return false;
      }
      
      if (response && response.success) {
        return true;
      }
      
      console.error(`Errore nel salvataggio dei dati ${type}:`, response?.error);
      return false;
    } catch (error) {
      console.error(`Errore nel salvataggio dell'elemento di tipo ${type}:`, error);
      return false;
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
        throw new Error("Connessione al server non disponibile, impossibile sincronizzare i dati");
      }
    }
    
    try {
      console.log(`Sincronizzazione dati ${type} con MySQL via API`);
      
      // Prima otteniamo i dati locali come backup
      const localData = this.loadFromLocalStorage<any>(type);
      
      // Chiamiamo l'API di sincronizzazione specifica per aggiornare i dati sul server
      let response;
      
      switch(type) {
        case DataType.RESERVATIONS:
          response = await syncApi.syncData('reservations');
          break;
        case DataType.CLEANING_TASKS:
          console.log(`Sincronizzazione cleaning tasks non disponibile via API, uso solo dati locali`);
          return;
        case DataType.APARTMENTS:
          response = await syncApi.syncData('apartments');
          break;
        case DataType.PRICES:
          response = await syncApi.syncData('prices');
          break;
        default:
          console.warn(`Tipo di dati non gestito per la sincronizzazione: ${type}`);
          return;
      }
      
      if (response && response.success) {
        console.log(`Sincronizzazione ${type} completata con successo`);
        
        // Dopo la sincronizzazione, ricarichiamo i dati dal server
        // per assicurarci di avere la versione più aggiornata
        const updatedData = await this.loadData(type);
        if (updatedData) {
          this.saveToLocalStorage(type, updatedData);
        }
      } else {
        console.error(`Errore nella sincronizzazione ${type}:`, response?.error);
        throw new Error(`Errore nella sincronizzazione dei dati ${type}`);
      }
    } catch (error) {
      console.error(`Errore nella sincronizzazione dei dati ${type} con MySQL:`, error);
      throw error;
    }
  }
  
  /**
   * Forza la sincronizzazione di tutti i dati con il database
   */
  public async forceSyncAllData(): Promise<boolean> {
    try {
      // Prima verifica la connessione
      if (!this.connected) {
        const connected = await this.initialize();
        if (!connected) {
          toast.error("Database non connesso, impossibile sincronizzare");
          return false;
        }
      }
      
      console.log("Forza sincronizzazione di tutti i dati");
      const response = await systemApi.forceSyncAllData();
      
      if (response.success) {
        console.log("Sincronizzazione forzata completata con successo:", response.data);
        return true;
      } else {
        console.error("Errore nella sincronizzazione forzata:", response.error);
        return false;
      }
    } catch (error) {
      console.error("Errore nella sincronizzazione forzata:", error);
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
