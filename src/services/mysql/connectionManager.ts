
import { toast } from "sonner";
import { systemApi } from "@/api/apiClient";
import { MySQLConnectionOptions } from "./types";

export class MySQLConnectionManager {
  private connectionOptions: MySQLConnectionOptions;
  private connected: boolean = false;
  private isInitializing: boolean = false;
  private initPromise: Promise<boolean> | null = null;
  private retryAttempts: number = 0;
  private maxRetries: number = 3;
  private lastConnectionAttempt: number = 0;
  private connectionTimeout: number = 30000;
  
  constructor(options: MySQLConnectionOptions) {
    this.connectionOptions = options;
  }
  
  public async initialize(): Promise<boolean> {
    try {
      if (this.isInitializing) {
        return this.initPromise || false;
      }
      
      const now = Date.now();
      if (now - this.lastConnectionAttempt < this.connectionTimeout) {
        console.log("Tentativo di connessione troppo recente, usando lo stato precedente:", this.connected);
        return this.connected;
      }
      
      this.lastConnectionAttempt = now;
      this.isInitializing = true;
      
      console.log("Test connessione al database MySQL...");
      
      try {
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
  
  public isConnected(): boolean {
    return this.connected;
  }
  
  public async forceSyncAllData(): Promise<boolean> {
    try {
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
}
