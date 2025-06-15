
import { DataType } from "../externalStorage";
import { syncApi } from "@/api/apiClient";
import { LocalStorageHandler } from "./localStorageHandler";
import { MySQLConnectionManager } from "./connectionManager";
import { DataLoader } from "./dataLoader";

export class DataSynchronizer {
  private localStorage: LocalStorageHandler;
  private connectionManager: MySQLConnectionManager;
  private dataLoader: DataLoader;
  
  constructor(
    localStorage: LocalStorageHandler,
    connectionManager: MySQLConnectionManager,
    dataLoader: DataLoader
  ) {
    this.localStorage = localStorage;
    this.connectionManager = connectionManager;
    this.dataLoader = dataLoader;
  }
  
  public async synchronize(type: DataType): Promise<void> {
    if (!this.connectionManager.isConnected()) {
      const connected = await this.connectionManager.initialize();
      if (!connected) {
        throw new Error("Connessione al server non disponibile, impossibile sincronizzare i dati");
      }
    }
    
    try {
      console.log(`Sincronizzazione dati ${type} con MySQL via API`);
      
      const localData = this.localStorage.loadFromLocalStorage<any>(type);
      
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
        
        const updatedData = await this.dataLoader.loadData(type);
        if (updatedData) {
          this.localStorage.saveToLocalStorage(type, updatedData);
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
}
