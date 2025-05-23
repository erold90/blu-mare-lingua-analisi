/**
 * External Storage Service
 * Service to handle data persistence in external storage (localStorage, IndexedDB, etc.)
 */

import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

// Configurazione endpoint per il file storage
const API_ENDPOINT = "/api/storage";
const FILE_STORAGE_KEY = "villamareblu_data";

// Tipi di dati supportati
export enum DataType {
  RESERVATIONS = "reservations",
  CLEANING_TASKS = "cleaning_tasks",
  APARTMENTS = "apartments",
  PRICES = "prices"  // Added PRICES to the DataType enum
}

// Interfaccia per i metadati dei file
interface FileMetadata {
  id: string;
  type: DataType;
  lastUpdated: number;
  deviceId: string;
  sessionId: string;
}

// Interfaccia per i dati sincronizzati
export interface SyncedData<T> {
  metadata: FileMetadata;
  data: T;
}

class ExternalStorage {
  private deviceId: string;
  private sessionId: string;
  private subscribers: Map<DataType, Array<() => void>>;
  private syncInterval: number | null = null;
  private inMemoryCache: Map<DataType, any>;
  private lastSyncTimes: Map<DataType, number>;
  
  constructor() {
    // Genera o recupera l'ID dispositivo
    this.deviceId = localStorage.getItem('vmb_device_id') || `dev_${uuidv4()}`;
    localStorage.setItem('vmb_device_id', this.deviceId);
    
    // Genera un ID sessione unico per questa istanza del browser
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    
    // Inizializza le strutture dati
    this.subscribers = new Map();
    this.inMemoryCache = new Map();
    this.lastSyncTimes = new Map();
    
    console.log(`ExternalStorage inizializzato: Device ID ${this.deviceId}, Session ID ${this.sessionId}`);
    
    // Avvia il meccanismo di sincronizzazione periodica
    this.startPeriodicSync();
  }
  
  /**
   * Simulates reading from external storage
   */
  private simulateServerStorage(key: string): string | null {
    try {
      // In a real implementation, this would fetch from a server API
      // For now, we'll use localStorage as a server simulation
      return localStorage.getItem(`server_${key}`);
    } catch (error) {
      console.error("Error accessing simulated server storage:", error);
      return null;
    }
  }
  
  /**
   * Simulates writing to external storage
   */
  private simulateServerWrite(key: string, value: string): boolean {
    try {
      // In a real implementation, this would send to a server API
      // For now, we'll use localStorage as a server simulation
      localStorage.setItem(`server_${key}`, value);
      return true;
    } catch (error) {
      console.error("Error writing to simulated server storage:", error);
      return false;
    }
  }
  
  /**
   * Starts periodic synchronization
   */
  private startPeriodicSync(): void {
    // Every 30 seconds, check for updates
    this.syncInterval = window.setInterval(() => {
      this.synchronizeAll();
    }, 30000) as unknown as number;
    
    // Also sync on page visibility changes (when tab becomes active again)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        console.log("Tab became visible, syncing data...");
        this.synchronizeAll();
      }
    });
  }
  
  /**
   * Stops periodic synchronization
   */
  public stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
  
  /**
   * Save data to external storage
   */
  public saveData<T>(type: DataType, data: T): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        // Create file metadata
        const metadata: FileMetadata = {
          id: uuidv4(),
          type,
          lastUpdated: Date.now(),
          deviceId: this.deviceId,
          sessionId: this.sessionId
        };
        
        // Create the full synced data object
        const syncedData: SyncedData<T> = {
          metadata,
          data
        };
        
        // Convert to JSON
        const dataString = JSON.stringify(syncedData);
        
        // Save to "server"
        const key = `${FILE_STORAGE_KEY}_${type}`;
        const success = this.simulateServerWrite(key, dataString);
        
        if (success) {
          // Update in-memory cache
          this.inMemoryCache.set(type, data);
          this.lastSyncTimes.set(type, metadata.lastUpdated);
          
          // Notify subscribers
          this.notifySubscribers(type);
          
          resolve(true);
        } else {
          reject(new Error("Failed to save data"));
        }
      } catch (error) {
        console.error(`Error saving ${type} data:`, error);
        reject(error);
      }
    });
  }
  
  /**
   * Load data from external storage
   */
  public loadData<T>(type: DataType): Promise<T | null> {
    return new Promise((resolve, reject) => {
      try {
        // First check if we have a recent version in memory
        const cachedData = this.inMemoryCache.get(type);
        const lastSync = this.lastSyncTimes.get(type) || 0;
        const now = Date.now();
        
        // If we have recently synced data in memory (less than 5 seconds old), use it
        if (cachedData && (now - lastSync < 5000)) {
          resolve(cachedData);
          return;
        }
        
        // Otherwise fetch from "server"
        const key = `${FILE_STORAGE_KEY}_${type}`;
        const dataString = this.simulateServerStorage(key);
        
        if (!dataString) {
          // No data exists yet
          resolve(null);
          return;
        }
        
        // Parse the data
        const syncedData = JSON.parse(dataString) as SyncedData<T>;
        
        // Update cache and last sync time
        this.inMemoryCache.set(type, syncedData.data);
        this.lastSyncTimes.set(type, syncedData.metadata.lastUpdated);
        
        resolve(syncedData.data);
      } catch (error) {
        console.error(`Error loading ${type} data:`, error);
        reject(error);
      }
    });
  }
  
  /**
   * Subscribe to data changes
   */
  public subscribe(type: DataType, callback: () => void): () => void {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, []);
    }
    
    const callbacks = this.subscribers.get(type)!;
    callbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    };
  }
  
  /**
   * Notify subscribers of data changes
   */
  private notifySubscribers(type: DataType): void {
    const callbacks = this.subscribers.get(type);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error("Error in subscriber callback:", error);
        }
      });
    }
  }
  
  /**
   * Force synchronization for all data types
   */
  public synchronizeAll(): Promise<void> {
    return Promise.all(Object.values(DataType).map(type => 
      this.synchronize(type as DataType)
    )).then(() => {
      console.log("All data synchronized successfully");
    }).catch(error => {
      console.error("Error during synchronization:", error);
      throw error;
    });
  }
  
  /**
   * Force synchronization for specific data type
   */
  public synchronize(type: DataType): Promise<void> {
    return this.loadData(type)
      .then(() => {
        console.log(`${type} synchronized successfully`);
        // Notify subscribers of fresh data
        this.notifySubscribers(type);
      })
      .catch(error => {
        console.error(`Error synchronizing ${type}:`, error);
        throw error;
      });
  }
}

// Export singleton instance
export const externalStorage = new ExternalStorage();
