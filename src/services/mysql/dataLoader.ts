
import { DataType } from "../externalStorage";
import { reservationsApi, apartmentsApi, pricesApi } from "@/api/apiClient";
import { LocalStorageHandler } from "./localStorageHandler";
import { DataValidator } from "./dataValidator";
import { MySQLConnectionManager } from "./connectionManager";

export class DataLoader {
  private localStorage: LocalStorageHandler;
  private validator: DataValidator;
  private connectionManager: MySQLConnectionManager;
  
  constructor(
    localStorage: LocalStorageHandler,
    validator: DataValidator,
    connectionManager: MySQLConnectionManager
  ) {
    this.localStorage = localStorage;
    this.validator = validator;
    this.connectionManager = connectionManager;
  }
  
  public async loadData<T>(type: DataType): Promise<T | null> {
    if (!this.connectionManager.isConnected()) {
      await this.connectionManager.initialize();
    }
    
    try {
      console.log(`Caricamento dati ${type} da MySQL via API`);
      
      if (!this.connectionManager.isConnected()) {
        console.log(`MySQL non connesso, uso localStorage per ${type}`);
        return this.localStorage.loadFromLocalStorage<T>(type);
      }
      
      let response;
      
      switch(type) {
        case DataType.RESERVATIONS:
          response = await reservationsApi.getAll();
          break;
        case DataType.CLEANING_TASKS:
          console.log(`Cleaning API non disponibile, uso localStorage per ${type}`);
          return this.localStorage.loadFromLocalStorage<T>(type);
        case DataType.APARTMENTS:
          response = await apartmentsApi.getAll();
          break;
        case DataType.PRICES:
          const currentYear = new Date().getFullYear();
          response = await pricesApi.getByYear(currentYear);
          break;
        default:
          console.warn(`Tipo di dati non gestito: ${type}`);
          return this.localStorage.loadFromLocalStorage<T>(type);
      }
      
      if (response.success && response.data) {
        console.log(`Dati caricati con successo dal server per ${type}:`, response.data);
        
        if (this.validator.isValidData(response.data, type)) {
          this.localStorage.saveToLocalStorage(type, response.data);
          return response.data as T;
        } else {
          console.warn(`Dati ricevuti dal server per ${type} non validi`, response.data);
          return this.localStorage.loadFromLocalStorage<T>(type);
        }
      }
      
      console.error(`Errore nel caricamento dei dati ${type} o dati vuoti:`, response.error);
      return this.localStorage.loadFromLocalStorage<T>(type);
    } catch (error) {
      console.error(`Errore nel caricamento dei dati ${type} da MySQL:`, error);
      return this.localStorage.loadFromLocalStorage<T>(type);
    }
  }
}
