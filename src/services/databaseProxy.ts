
/**
 * Database Proxy Service
 * Servizio che fa da proxy tra l'applicazione e il database MySQL o localStorage
 */

import { DataType, externalStorage } from "./externalStorage";
import { mysqlStorage } from "./mysqlStorage";
import { toast } from "sonner";

class DatabaseProxy {
  private useMySQL: boolean = false;
  private isInitializing: boolean = false;
  private initPromise: Promise<boolean> | null = null;
  private syncInProgress: boolean = false;
  
  constructor() {
    // Controlla se possiamo usare MySQL al primo utilizzo
    this.initPromise = this.checkMySQLAvailability();
  }
  
  /**
   * Verifica se MySQL è disponibile
   */
  private async checkMySQLAvailability(): Promise<boolean> {
    if (this.isInitializing) return this.initPromise as Promise<boolean>;
    
    this.isInitializing = true;
    
    try {
      this.useMySQL = await mysqlStorage.initialize();
      console.log("MySQL connection status:", this.useMySQL ? "connected" : "not available");
      return this.useMySQL;
    } catch (error) {
      console.error("Error checking MySQL availability:", error);
      this.useMySQL = false;
      return false;
    } finally {
      this.isInitializing = false;
    }
  }
  
  /**
   * Assicura che l'inizializzazione sia completa
   */
  private async ensureInitialized(): Promise<void> {
    if (this.initPromise) {
      await this.initPromise;
      this.initPromise = null;
    }
  }
  
  /**
   * Carica dati dal database
   */
  public async loadData<T>(type: DataType): Promise<T | null> {
    // Assicuriamoci che l'inizializzazione sia completata
    await this.ensureInitialized();
    
    // Prima tenta di usare MySQL se disponibile
    if (this.useMySQL) {
      try {
        const data = await mysqlStorage.loadData<T>(type);
        if (data) {
          console.log(`Dati di tipo ${type} caricati da MySQL con successo`);
          // Salva anche in localStorage per avere un backup
          externalStorage.saveData(type, data);
          return data;
        }
        console.log(`Nessun dato trovato in MySQL per ${type}, provo con localStorage`);
      } catch (error) {
        console.error(`Error loading ${type} from MySQL:`, error);
      }
    }
    
    // Fallback al localStorage
    console.log(`Usando localStorage per caricare i dati di tipo ${type}`);
    return externalStorage.loadData<T>(type);
  }
  
  /**
   * Salva dati nel database
   */
  public async saveData<T>(type: DataType, data: T): Promise<boolean> {
    // Assicuriamoci che l'inizializzazione sia completata
    await this.ensureInitialized();
    
    let mysqlSaved = false;
    
    // Prima salva in MySQL se disponibile
    if (this.useMySQL) {
      try {
        mysqlSaved = await mysqlStorage.saveData(type, data);
        console.log(`Dati di tipo ${type} salvati in MySQL: ${mysqlSaved ? "successo" : "fallito"}`);
        if (!mysqlSaved) {
          console.warn(`Salvataggio in MySQL non riuscito per ${type}, usando localStorage`);
        }
      } catch (error) {
        console.error(`Error saving ${type} to MySQL:`, error);
        mysqlSaved = false;
      }
    }
    
    // Salva sempre anche nel localStorage come backup
    try {
      await externalStorage.saveData(type, data);
      console.log(`Dati di tipo ${type} salvati in localStorage (backup)`);
      return true; // Se almeno uno dei due metodi funziona, consideriamo il salvataggio riuscito
    } catch (error) {
      console.error(`Error saving ${type} to local storage:`, error);
      return mysqlSaved; // Ritorna lo stato del salvataggio MySQL se presente
    }
  }
  
  /**
   * Sincronizza i dati
   */
  public async synchronize(type: DataType): Promise<void> {
    // Se c'è già una sincronizzazione in corso, non avviarne un'altra
    if (this.syncInProgress) {
      console.log("Sincronizzazione già in corso, ignorata la richiesta");
      return;
    }
    
    this.syncInProgress = true;
    
    try {
      // Assicuriamoci che l'inizializzazione sia completata
      await this.ensureInitialized();
      
      console.log(`Tentativo di sincronizzazione dei dati di tipo ${type}`);
      
      if (this.useMySQL) {
        try {
          // Prima carica i dati locali
          const localData = await externalStorage.loadData(type);
          
          if (localData) {
            // Se abbiamo dati locali, proviamo a sincronizzarli col server
            console.log(`Sincronizzazione di dati locali per ${type} con il server`);
            await mysqlStorage.saveData(type, localData);
          }
          
          // Poi tenta di sincronizzare i dati dal server
          await mysqlStorage.synchronize(type);
          console.log(`Sincronizzazione MySQL completata per ${type}`);
          
          // Dopo la sincronizzazione, carica i dati più aggiornati
          const updatedData = await mysqlStorage.loadData(type);
          if (updatedData) {
            // Aggiorna i dati locali con quelli dal server
            await externalStorage.saveData(type, updatedData);
            console.log(`Dati locali aggiornati dopo la sincronizzazione per ${type}`);
          }
        } catch (error) {
          console.error(`Error synchronizing ${type} with MySQL:`, error);
          toast.error(`Errore durante la sincronizzazione di ${this.getDataTypeLabel(type)}`);
        }
      } else {
        console.log(`MySQL non disponibile, uso solo localStorage per ${type}`);
        // Prova a riconnettere a MySQL
        this.useMySQL = await this.checkMySQLAvailability();
        
        if (this.useMySQL) {
          // Se ora siamo connessi, riprova la sincronizzazione
          console.log("Riconnessione a MySQL riuscita, riprovo la sincronizzazione");
          await this.synchronize(type);
        } else {
          // Sincronizza comunque anche il localStorage
          await externalStorage.synchronize(type);
          toast.warning("Database non disponibile, dati salvati solo localmente");
        }
      }
      
      console.log(`Sincronizzazione completata per ${type}`);
    } finally {
      this.syncInProgress = false;
    }
  }
  
  /**
   * Sincronizza tutti i tipi di dati
   */
  public async synchronizeAll(): Promise<void> {
    // Assicuriamoci che l'inizializzazione sia completata
    await this.ensureInitialized();
    
    // Se siamo connessi a MySQL, usiamo la funzione dedicata
    if (this.useMySQL) {
      try {
        await mysqlStorage.forceSyncAllData();
        return;
      } catch (error) {
        console.error("Errore nella sincronizzazione di tutti i dati con MySQL:", error);
        toast.error("Errore nella sincronizzazione con il database");
      }
    }
    
    // Fallback alla sincronizzazione basata su tipi
    console.log("Sincronizzazione di tutti i tipi di dati");
    
    toast.loading("Sincronizzazione di tutti i dati in corso...");
    
    try {
      await Promise.all(Object.values(DataType).map(type => 
        this.synchronize(type as DataType)
      ));
      
      toast.dismiss();
      toast.success("Sincronizzazione completa di tutti i dati");
    } catch (error) {
      console.error("Errore nella sincronizzazione di tutti i dati:", error);
      toast.dismiss();
      toast.error("Errore durante la sincronizzazione di alcuni dati");
    }
  }
  
  /**
   * Forza un test completo della connessione al database
   */
  public async testDatabaseConnection(): Promise<boolean> {
    // Reset dello stato
    this.useMySQL = false;
    
    // Force recheck
    return this.checkMySQLAvailability();
  }
  
  /**
   * Verifica se MySQL è attualmente disponibile
   */
  public isMySQLAvailable(): boolean {
    return this.useMySQL;
  }
  
  /**
   * Forza un nuovo check della disponibilità di MySQL
   */
  public async recheckMySQLAvailability(): Promise<boolean> {
    this.initPromise = this.checkMySQLAvailability();
    return this.initPromise;
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

// Esporta singleton
export const databaseProxy = new DatabaseProxy();
