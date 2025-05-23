/**
 * Database Proxy Service
 * Servizio che fa da proxy tra l'applicazione e il database MySQL o localStorage
 */

import { DataType, externalStorage } from "./externalStorage";
import { mysqlStorage } from "./mysqlStorage";
import { toast } from "sonner";
import { MockDatabaseService } from "@/utils/mockDatabaseService";

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
      // Se la modalità mock è attiva, non tentare di connettersi a MySQL
      if (MockDatabaseService.isActive()) {
        console.log("Modalità database simulato attiva, MySQL non verrà utilizzato");
        this.useMySQL = false;
        return false;
      }
      
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
   * Carica dati dal database - PRIORITÀ AL DATABASE REMOTO
   * Questa funzione ora dà priorità al caricamento dei dati dal MySQL prima di ricorrere al localStorage
   */
  public async loadData<T>(type: DataType): Promise<T | null> {
    // Assicuriamoci che l'inizializzazione sia completata
    await this.ensureInitialized();
    
    try {
      // Se la modalità mock è attiva, usa il database simulato
      if (MockDatabaseService.isActive()) {
        console.log(`Usando database simulato per caricare i dati di tipo ${type}`);
        return MockDatabaseService.loadData<T>(type);
      }
      
      // IMPORTANTE: Tentiamo sempre di riconnetterci al database prima di caricare i dati
      // Questo permette di recuperare una connessione persa
      if (!this.useMySQL) {
        this.useMySQL = await this.checkMySQLAvailability();
      }
      
      // PRIORITÀ: Prima tenta di usare MySQL se disponibile
      if (this.useMySQL) {
        try {
          console.log(`Tentativo di caricare ${type} da MySQL...`);
          const data = await mysqlStorage.loadData<T>(type);
          
          if (data) {
            console.log(`Dati di tipo ${type} caricati da MySQL con successo`, data);
            // Salva anche in localStorage per avere un backup
            await externalStorage.saveData(type, data);
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
    } catch (error) {
      console.error(`Errore generale nel caricamento dei dati ${type}:`, error);
      return externalStorage.loadData<T>(type);
    }
  }
  
  /**
   * Salva dati nel database - SALVATAGGIO GARANTITO
   * Questa funzione ora tenta di salvare sia su MySQL che su localStorage, dando priorità al MySQL
   */
  public async saveData<T>(type: DataType, data: T): Promise<boolean> {
    // Assicuriamoci che l'inizializzazione sia completata
    await this.ensureInitialized();
    
    // Se la modalità mock è attiva, usa il database simulato
    if (MockDatabaseService.isActive()) {
      console.log(`Usando database simulato per salvare i dati di tipo ${type}`);
      const mockResult = await MockDatabaseService.saveData(type, data);
      
      // Salva anche in localStorage come backup
      await externalStorage.saveData(type, data);
      
      return mockResult;
    }
    
    let mysqlSaved = false;
    
    try {
      // IMPORTANTE: Tentiamo sempre di riconnetterci al database prima di salvare
      if (!this.useMySQL) {
        this.useMySQL = await this.checkMySQLAvailability();
      }
      
      // Prima salva in MySQL se disponibile
      if (this.useMySQL) {
        try {
          console.log(`Tentativo di salvare ${type} su MySQL...`);
          mysqlSaved = await mysqlStorage.saveData(type, data);
          
          console.log(`Dati di tipo ${type} salvati in MySQL: ${mysqlSaved ? "successo" : "fallito"}`);
          
          // Se il salvataggio è fallito, mostra una notifica all'utente
          if (!mysqlSaved) {
            console.warn(`Salvataggio in MySQL non riuscito per ${type}, usando localStorage`);
            toast.warning(`Impossibile salvare i dati nel database remoto, attualmente disponibili solo su questo dispositivo`);
          } else {
            console.log("Dati salvati con successo sul database remoto");
          }
        } catch (error) {
          console.error(`Error saving ${type} to MySQL:`, error);
          mysqlSaved = false;
        }
      } else {
        // Se MySQL non è disponibile, mostra una notifica
        toast.warning("Database non disponibile, dati salvati solo localmente");
      }
      
      // Salva SEMPRE anche nel localStorage come backup
      try {
        await externalStorage.saveData(type, data);
        console.log(`Dati di tipo ${type} salvati in localStorage (backup)`);
        return true; // Se almeno uno dei due metodi funziona, consideriamo il salvataggio riuscito
      } catch (error) {
        console.error(`Error saving ${type} to local storage:`, error);
        return mysqlSaved; // Ritorna lo stato del salvataggio MySQL se presente
      }
    } catch (error) {
      console.error(`Errore generale nel salvataggio dei dati ${type}:`, error);
      
      // In caso di errore critico, tenta comunque di salvare in localStorage
      try {
        await externalStorage.saveData(type, data);
        console.log(`Salvataggio di emergenza in localStorage completato per ${type}`);
        return true;
      } catch (storageError) {
        console.error(`Errore critico: impossibile salvare ${type} in nessun storage:`, storageError);
        return false;
      }
    }
  }
  
  /**
   * Sincronizza i dati - MECCANISMO MIGLIORATO
   */
  public async synchronize(type: DataType): Promise<void> {
    // Se c'è già una sincronizzazione in corso, non avviarne un'altra
    if (this.syncInProgress) {
      console.log("Sincronizzazione già in corso, ignorata la richiesta");
      return;
    }
    
    this.syncInProgress = true;
    toast.loading(`Sincronizzazione di ${this.getDataTypeLabel(type)} in corso...`);
    
    try {
      // Assicuriamoci che l'inizializzazione sia completata
      await this.ensureInitialized();
      
      console.log(`Tentativo di sincronizzazione dei dati di tipo ${type}`);
      
      // Se la modalità mock è attiva, usa il database simulato
      if (MockDatabaseService.isActive()) {
        console.log(`Usando database simulato per sincronizzare i dati di tipo ${type}`);
        await MockDatabaseService.synchronize(type);
        toast.dismiss();
        toast.success(`Sincronizzazione di ${this.getDataTypeLabel(type)} completata con successo`);
        this.syncInProgress = false;
        return;
      }
      
      // Riconnessione al database se necessario
      if (!this.useMySQL) {
        this.useMySQL = await this.checkMySQLAvailability();
      }
      
      if (this.useMySQL) {
        // 1. Prima carica i dati locali
        const localData = await externalStorage.loadData(type);
        
        // 2. Poi carica i dati dal server
        const serverData = await mysqlStorage.loadData(type);
        
        // 3. Unisci i dati dando priorità a quelli più recenti
        let mergedData;
        
        if (localData && serverData) {
          // Se abbiamo entrambi i set di dati, uniamoli intelligentemente
          if (Array.isArray(localData) && Array.isArray(serverData)) {
            console.log("Unione dati locali e remoti:", { 
              locali: localData.length, 
              remoti: serverData.length 
            });
            
            // Crea una mappa per l'unione efficiente
            const dataMap = new Map();
            
            // Prima aggiungi tutti i dati del server
            serverData.forEach(item => {
              if (item && item.id) {
                dataMap.set(item.id, item);
              }
            });
            
            // Poi sovrapponi o aggiungi i dati locali (se più recenti)
            localData.forEach(item => {
              if (item && item.id) {
                const existing = dataMap.get(item.id);
                
                // Se l'elemento non esiste ancora o quello locale è più recente
                if (!existing || (item.lastUpdated && existing.lastUpdated && item.lastUpdated > existing.lastUpdated)) {
                  dataMap.set(item.id, item);
                }
              }
            });
            
            // Converti la mappa in array
            mergedData = Array.from(dataMap.values());
            console.log(`Dati uniti: ${mergedData.length} elementi`);
          } else {
            // Per i dati non-array, usiamo i dati del server a meno che non siano vuoti
            mergedData = serverData || localData;
          }
        } else {
          // Se uno dei due set è vuoto, usa l'altro
          mergedData = localData || serverData || null;
        }
        
        // 4. Salva i dati uniti sia in locale che sul server
        if (mergedData) {
          // Aggiorna localStorage
          await externalStorage.saveData(type, mergedData);
          
          // Aggiorna database MySQL
          await mysqlStorage.saveData(type, mergedData);
          
          console.log(`Sincronizzazione completata per ${type}: ${Array.isArray(mergedData) ? mergedData.length : 1} elementi`);
          toast.dismiss();
          toast.success(`Sincronizzazione di ${this.getDataTypeLabel(type)} completata con successo`);
        } else {
          console.log(`Nessun dato da sincronizzare per ${type}`);
          toast.dismiss();
          toast.info(`Nessun dato da sincronizzare per ${this.getDataTypeLabel(type)}`);
        }
      } else {
        // Se MySQL non è disponibile
        console.log(`MySQL non disponibile, uso solo localStorage per ${type}`);
        
        // Prova a riconnettere a MySQL
        this.useMySQL = await this.checkMySQLAvailability();
        
        if (this.useMySQL) {
          // Se ora siamo connessi, riprova la sincronizzazione
          console.log("Riconnessione a MySQL riuscita, riprovo la sincronizzazione");
          toast.dismiss();
          this.syncInProgress = false;
          await this.synchronize(type);
        } else {
          // Sincronizza comunque anche il localStorage
          await externalStorage.synchronize(type);
          toast.dismiss();
          toast.warning("Database non disponibile, dati salvati solo localmente");
        }
      }
    } catch (error) {
      console.error(`Errore durante la sincronizzazione di ${type}:`, error);
      toast.dismiss();
      toast.error(`Errore durante la sincronizzazione di ${this.getDataTypeLabel(type)}`);
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
    
    toast.loading("Sincronizzazione di tutti i dati in corso...");
    
    try {
      // Se la modalità mock è attiva, usa il database simulato
      if (MockDatabaseService.isActive()) {
        console.log("Usando database simulato per sincronizzare tutti i dati");
        
        // Sincronizza tutti i tipi di dati
        await MockDatabaseService.synchronize(DataType.RESERVATIONS);
        await MockDatabaseService.synchronize(DataType.CLEANING_TASKS);
        await MockDatabaseService.synchronize(DataType.APARTMENTS);
        await MockDatabaseService.synchronize(DataType.PRICES);
        
        toast.dismiss();
        toast.success("Sincronizzazione di tutti i dati completata con successo");
        return;
      }
      
      // Riconnetti al database
      if (!this.useMySQL) {
        this.useMySQL = await this.checkMySQLAvailability();
      }
      
      // Se siamo connessi a MySQL, usiamo la funzione dedicata
      if (this.useMySQL) {
        try {
          const result = await mysqlStorage.forceSyncAllData();
          if (result) {
            toast.dismiss();
            toast.success("Sincronizzazione completa di tutti i dati");
          } else {
            toast.dismiss();
            toast.error("Errore nella sincronizzazione con il database");
          }
          return;
        } catch (error) {
          console.error("Errore nella sincronizzazione di tutti i dati con MySQL:", error);
          toast.dismiss();
          toast.error("Errore nella sincronizzazione con il database");
        }
      }
      
      // Fallback alla sincronizzazione basata su tipi
      console.log("Sincronizzazione di tutti i tipi di dati uno per uno");
      
      const results = await Promise.allSettled([
        this.synchronize(DataType.RESERVATIONS),
        this.synchronize(DataType.CLEANING_TASKS),
        this.synchronize(DataType.APARTMENTS),
        this.synchronize(DataType.PRICES)
      ]);
      
      const allSuccessful = results.every(result => result.status === 'fulfilled');
      
      if (allSuccessful) {
        toast.dismiss();
        toast.success("Sincronizzazione completa di tutti i dati");
      } else {
        const failures = results.filter(result => result.status === 'rejected').length;
        toast.dismiss();
        toast.warning(`Sincronizzazione parziale: ${failures} tipi di dati non sincronizzati correttamente`);
      }
    } catch (error) {
      console.error("Errore generale nella sincronizzazione di tutti i dati:", error);
      toast.dismiss();
      toast.error("Errore durante la sincronizzazione di alcuni dati");
    }
  }
  
  /**
   * Forza un test completo della connessione al database
   */
  public async testDatabaseConnection(): Promise<boolean> {
    // Se la modalità mock è attiva, restituisci sempre true
    if (MockDatabaseService.isActive()) {
      console.log("Modalità database simulato attiva, connessione sempre disponibile");
      const mockResponse = await MockDatabaseService.testConnection();
      return mockResponse.success;
    }
    
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
