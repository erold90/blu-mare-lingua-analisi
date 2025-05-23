
/**
 * Database Proxy Service
 * Servizio che fa da proxy tra l'applicazione e il database MySQL o localStorage
 */

import { DataType, externalStorage } from "./externalStorage";
import { mysqlStorage } from "./mysqlStorage";

class DatabaseProxy {
  private useMySQL: boolean = false;
  
  constructor() {
    // Controlla se possiamo usare MySQL
    this.checkMySQLAvailability();
  }
  
  /**
   * Verifica se MySQL è disponibile
   */
  private async checkMySQLAvailability(): Promise<void> {
    try {
      this.useMySQL = await mysqlStorage.initialize();
      console.log("MySQL connection status:", this.useMySQL ? "connected" : "not available");
    } catch (error) {
      console.error("Error checking MySQL availability:", error);
      this.useMySQL = false;
    }
  }
  
  /**
   * Carica dati dal database
   */
  public async loadData<T>(type: DataType): Promise<T | null> {
    // Prima tenta di usare MySQL se disponibile
    if (this.useMySQL) {
      try {
        const data = await mysqlStorage.loadData<T>(type);
        if (data) return data;
      } catch (error) {
        console.error(`Error loading ${type} from MySQL:`, error);
      }
    }
    
    // Fallback al localStorage
    console.log(`Usando localStorage per caricare i dati di tipo ${type} (MySQL non disponibile)`);
    return externalStorage.loadData<T>(type);
  }
  
  /**
   * Salva dati nel database
   */
  public async saveData<T>(type: DataType, data: T): Promise<boolean> {
    let saved = false;
    
    // Prima salva in MySQL se disponibile
    if (this.useMySQL) {
      try {
        saved = await mysqlStorage.saveData(type, data);
        if (!saved) {
          console.warn(`Salvataggio in MySQL non riuscito per ${type}, usando localStorage`);
        }
      } catch (error) {
        console.error(`Error saving ${type} to MySQL:`, error);
        saved = false;
      }
    }
    
    // Salva sempre anche nel localStorage come backup
    try {
      await externalStorage.saveData(type, data);
      console.log(`Dati di tipo ${type} salvati in localStorage (backup)`);
      return true; // Se almeno uno dei due metodi funziona, consideriamo il salvataggio riuscito
    } catch (error) {
      console.error(`Error saving ${type} to local storage:`, error);
      return saved; // Ritorna lo stato del salvataggio MySQL se presente
    }
  }
  
  /**
   * Sincronizza i dati
   */
  public async synchronize(type: DataType): Promise<void> {
    console.log(`Tentativo di sincronizzazione dei dati di tipo ${type}`);
    
    if (this.useMySQL) {
      try {
        await mysqlStorage.synchronize(type);
        console.log(`Sincronizzazione MySQL completata per ${type}`);
      } catch (error) {
        console.error(`Error synchronizing ${type} with MySQL:`, error);
        console.log(`Passaggio alla sincronizzazione con localStorage per ${type}`);
      }
    } else {
      console.log(`MySQL non disponibile, uso solo localStorage per ${type}`);
    }
    
    // Sincronizza sempre anche il localStorage
    await externalStorage.synchronize(type);
    console.log(`Sincronizzazione localStorage completata per ${type}`);
  }
  
  /**
   * Sincronizza tutti i tipi di dati
   */
  public async synchronizeAll(): Promise<void> {
    console.log("Sincronizzazione di tutti i tipi di dati");
    await Promise.all(Object.values(DataType).map(type => 
      this.synchronize(type as DataType)
    ));
    console.log("Sincronizzazione completa di tutti i dati");
  }
}

// Esporta singleton
export const databaseProxy = new DatabaseProxy();
