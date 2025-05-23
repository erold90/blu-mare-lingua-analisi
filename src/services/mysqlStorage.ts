
import { toast } from "sonner";
import { DataType } from "./externalStorage";
import { 
  reservationsApi, 
  cleaningApi, 
  apartmentsApi, 
  pricesApi, 
  syncApi 
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
  private storagePrefix: string = "mysql_data_";
  
  constructor(options: MySQLConnectionOptions) {
    this.connectionOptions = options;
  }
  
  /**
   * Initialize connection to MySQL database via API
   */
  public async initialize(): Promise<boolean> {
    try {
      // Test la connessione al database tramite API
      console.log("Inizializzazione connessione MySQL tramite API:", this.connectionOptions.host);
      
      // Verifichiamo se l'API è raggiungibile
      const response = await fetch(`${this.baseUrl}/ping`);
      
      if (response.ok) {
        console.log("API raggiungibili e funzionanti");
        this.connected = true;
        return true;
      } else {
        console.log("API non disponibili, modalità offline attiva");
        this.connected = false;
        return false;
      }
    } catch (error) {
      console.error("Errore nella connessione alle API:", error);
      toast.error("Errore di connessione al server, lavorando in modalità offline");
      this.connected = false;
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
    // Prova ad inizializzare la connessione se non è già connesso
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
        // Salva anche in localStorage come cache
        this.saveToLocalStorage(type, response.data);
        return response.data as T;
      }
      
      console.error(`Errore nel caricamento dei dati ${type}:`, response.error);
      // Fallback al localStorage
      return this.loadFromLocalStorage<T>(type);
    } catch (error) {
      console.error(`Errore nel caricamento dei dati ${type} da MySQL:`, error);
      
      // In caso di errore, proviamo a caricare dal localStorage come fallback
      return this.loadFromLocalStorage<T>(type);
    }
  }
  
  /**
   * Save data to MySQL database via API
   */
  public async saveData<T>(type: DataType, data: T): Promise<boolean> {
    // Salva immediatamente in localStorage per sicurezza
    this.saveToLocalStorage(type, data);
    
    // Prova ad inizializzare la connessione se non è già connesso
    if (!this.connected) {
      await this.initialize();
    }
    
    // Se non siamo connessi, ritorna true perché abbiamo comunque salvato in localStorage
    if (!this.connected) {
      return true;
    }
    
    try {
      console.log(`Salvataggio dati ${type} su MySQL via API`);
      
      let response;
      
      // Per salvataggi di collezioni dobbiamo gestire il caso in modo diverso
      if (Array.isArray(data)) {
        // Per ora salviamo solo localmente perché le API non supportano batch updates
        // Implementazione futura: API per sincronizzare array di oggetti
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
        return true;
      }
    } catch (error) {
      console.error(`Errore nel salvataggio dei dati ${type} su MySQL:`, error);
      
      // In caso di errore, consideriamo comunque un successo perché abbiamo salvato in localStorage
      return true;
    }
  }
  
  /**
   * Sincronizza i dati con il database MySQL tramite API
   */
  public async synchronize(type: DataType): Promise<void> {
    // Prova ad inizializzare la connessione se non è già connesso
    if (!this.connected) {
      await this.initialize();
    }
    
    // Se non siamo connessi, non possiamo sincronizzare
    if (!this.connected) {
      throw new Error("Connessione al server non disponibile, impossibile sincronizzare i dati");
    }
    
    try {
      console.log(`Sincronizzazione dati ${type} con MySQL via API`);
      
      // Chiamata all'API di sincronizzazione specifica
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
          return;
      }
      
      if (response && response.success) {
        console.log(`Sincronizzazione ${type} completata con successo`);
      } else {
        console.error(`Errore nella sincronizzazione ${type}:`, response?.error);
      }
    } catch (error) {
      console.error(`Errore nella sincronizzazione dei dati ${type} con MySQL:`, error);
      throw error;
    }
  }
}

// Esporta un'istanza singleton con i dati di connessione dal database mostrato nell'immagine
export const mysqlStorage = new MySQLStorage({
  host: "31.11.39.219",  // hostname dal tuo database MySQL
  username: "Sql1864200", // username dal tuo database MySQL
  database: "Sql1864200_1", // prima database dal tuo elenco
});
