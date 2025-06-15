
import { toast } from "sonner";
import { DataType } from "../externalStorage";
import { reservationsApi } from "@/api/apiClient";
import { LocalStorageHandler } from "./localStorageHandler";
import { MySQLConnectionManager } from "./connectionManager";

export class DataSaver {
  private localStorage: LocalStorageHandler;
  private connectionManager: MySQLConnectionManager;
  
  constructor(
    localStorage: LocalStorageHandler,
    connectionManager: MySQLConnectionManager
  ) {
    this.localStorage = localStorage;
    this.connectionManager = connectionManager;
  }
  
  public async saveData<T>(type: DataType, data: T): Promise<boolean> {
    if (!this.connectionManager.isConnected()) {
      await this.connectionManager.initialize();
    }
    
    this.localStorage.saveToLocalStorage(type, data);
    
    if (!this.connectionManager.isConnected()) {
      console.log(`MySQL non connesso, dati salvati solo in localStorage per ${type}`);
      return false;
    }
    
    try {
      console.log(`Salvataggio dati ${type} su MySQL via API`, data);
      
      if (Array.isArray(data)) {
        console.log(`Saving array of ${data.length} items for ${type}`);
        
        if (type === DataType.RESERVATIONS && data.length > 0) {
          return await this.saveReservationsBatch(data);
        }
        
        if (type === DataType.CLEANING_TASKS && data.length > 0) {
          console.log(`Cleaning tasks salvate solo in localStorage (API non disponibile)`);
          return true;
        }
        
        console.log(`Dati di tipo array ${type} salvati solo in localStorage (API batch non implementata)`);
        return false;
      } else {
        return await this.saveSingleItem(type, data);
      }
    } catch (error) {
      console.error(`Errore nel salvataggio dei dati ${type} su MySQL:`, error);
      return false;
    }
  }
  
  private async saveReservationsBatch(reservations: any[]): Promise<boolean> {
    try {
      console.log(`Salvataggio batch di ${reservations.length} prenotazioni`);
      
      const batchSize = 5;
      const batches = [];
      
      for (let i = 0; i < reservations.length; i += batchSize) {
        batches.push(reservations.slice(i, i + batchSize));
      }
      
      console.log(`Creati ${batches.length} batch di prenotazioni`);
      
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
      
      return successCount > 0;
    } catch (error) {
      console.error("Errore nel salvataggio batch di prenotazioni:", error);
      return false;
    }
  }
  
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
          return true;
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
}
