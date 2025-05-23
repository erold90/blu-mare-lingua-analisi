
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
      } catch (error) {
        console.error(`Error saving ${type} to MySQL:`, error);
        saved = false;
      }
    }
    
    // Salva sempre anche nel localStorage come backup
    try {
      await externalStorage.saveData(type, data);
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
    if (this.useMySQL) {
      try {
        await mysqlStorage.synchronize(type);
      } catch (error) {
        console.error(`Error synchronizing ${type} with MySQL:`, error);
      }
    }
    
    // Sincronizza sempre anche il localStorage
    await externalStorage.synchronize(type);
  }
  
  /**
   * Sincronizza tutti i tipi di dati
   */
  public async synchronizeAll(): Promise<void> {
    await Promise.all(Object.values(DataType).map(type => 
      this.synchronize(type as DataType)
    ));
  }
}

// Esporta singleton
export const databaseProxy = new DatabaseProxy();
