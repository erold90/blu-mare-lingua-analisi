
/**
 * DiscoveryStorage Service
 * Central storage service that manages data persistence across devices.
 * This enables data sharing between different browsers and devices.
 */

// Storage keys
const STORAGE_KEYS = {
  RESERVATIONS: "reservations",
  APARTMENTS: "apartments",
  SEASONAL_PRICING: "seasonalPricing",
  APARTMENT_IMAGES: "apartmentImages",
  APARTMENT_COVERS: "apartmentCovers",
  GALLERY_IMAGES: "galleryImages",
  CLEANING_TASKS: "cleaningTasks",
  ACTIVITY_LOGS: "activityLogs",
  QUOTE_LOGS: "quoteLogs",
};

// Server endpoint for synchronization (this would be your actual API endpoint in production)
const SYNC_SERVER_URL = "https://sync-api.villamareblu.com";

/**
 * The main storage service class
 */
class DiscoveryStorage {
  private readonly storagePrefix = "villamareblu_";
  private syncTimers: { [key: string]: NodeJS.Timeout } = {};
  private lastSyncTime: { [key: string]: number } = {};
  private pendingChanges: { [key: string]: boolean } = {};
  private sessionId: string;
  
  constructor() {
    // Generate a unique session ID to identify this browser session
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    console.log(`DiscoveryStorage initialized with session ID: ${this.sessionId}`);
    
    // Setup event listeners for storage events from other tabs
    window.addEventListener("storage", this.handleStorageEvent);
    
    // Check for synchronization on startup
    this.checkInitialSync();
  }
  
  /**
   * Get the full key with prefix
   */
  private getFullKey(key: string): string {
    return `${this.storagePrefix}${key}`;
  }
  
  /**
   * Handle storage events from other tabs/windows
   */
  private handleStorageEvent = (event: StorageEvent) => {
    // Extract the original key without prefix
    const fullKey = event.key;
    if (!fullKey || !fullKey.startsWith(this.storagePrefix)) return;
    
    const key = fullKey.substring(this.storagePrefix.length);
    
    // If this is one of our keys and it changed
    if (Object.values(STORAGE_KEYS).includes(key as any)) {
      console.log(`Storage event detected for key: ${key}`);
      
      // Notify components listening for this key
      this.dispatchStorageEvent(key);
    }
  };
  
  /**
   * Get an item from storage
   */
  getItem<T>(key: string): T | null {
    try {
      // Try to get from localStorage first
      const localValue = localStorage.getItem(this.getFullKey(key));
      if (localValue) {
        return JSON.parse(localValue) as T;
      }
      
      return null;
    } catch (error) {
      console.error(`Error reading from storage (${key}):`, error);
      return null;
    }
  }
  
  /**
   * Set an item in storage
   */
  setItem(key: string, value: any): void {
    try {
      // Convert value to string
      const stringValue = JSON.stringify(value);
      
      // Save to localStorage
      localStorage.setItem(this.getFullKey(key), stringValue);
      
      // Mark that we have pending changes for this key
      this.pendingChanges[key] = true;
      
      // Schedule a sync to the server
      this.scheduleSync(key);
      
      // Dispatch a storage event so other components can react to changes
      this.dispatchStorageEvent(key);
    } catch (error) {
      console.error(`Error writing to storage (${key}):`, error);
    }
  }
  
  /**
   * Remove an item from storage
   */
  removeItem(key: string): void {
    try {
      // Remove from localStorage
      localStorage.removeItem(this.getFullKey(key));
      
      // Mark that we have pending changes for this key
      this.pendingChanges[key] = true;
      
      // Schedule a sync to the server
      this.scheduleSync(key);
      
      // Dispatch a storage event
      this.dispatchStorageEvent(key);
    } catch (error) {
      console.error(`Error removing from storage (${key}):`, error);
    }
  }
  
  /**
   * Clear all items from storage
   */
  clear(): void {
    try {
      // Get all keys with our prefix
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.storagePrefix)) {
          keysToRemove.push(key);
        }
      }
      
      // Remove all keys
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Schedule sync for all known storage keys
      Object.values(STORAGE_KEYS).forEach(key => {
        this.pendingChanges[key] = true;
        this.scheduleSync(key);
      });
    } catch (error) {
      console.error("Error clearing storage:", error);
    }
  }
  
  /**
   * Schedule a sync to the server
   * This debounces the sync to avoid too many requests
   */
  private scheduleSync(key: string): void {
    // Clear any existing timer for this key
    if (this.syncTimers[key]) {
      clearTimeout(this.syncTimers[key]);
    }
    
    // Schedule a new sync in 2 seconds
    this.syncTimers[key] = setTimeout(() => {
      this.syncToServer(key);
    }, 2000);
  }
  
  /**
   * Synchronize data to the server
   */
  private async syncToServer(key: string): Promise<void> {
    // Skip if we have no changes to sync
    if (!this.pendingChanges[key]) return;
    
    console.log(`Syncing ${key} to server...`);
    
    try {
      const data = this.getItem(key);
      
      // In a real implementation, this would be an API call
      // Since we don't have a real server, we'll simulate server storage with localStorage
      // using a different prefix
      const serverKey = `server_${this.getFullKey(key)}`;
      const syncData = {
        data,
        timestamp: Date.now(),
        sessionId: this.sessionId
      };
      
      localStorage.setItem(serverKey, JSON.stringify(syncData));
      
      // Store the timestamp of this sync
      this.lastSyncTime[key] = Date.now();
      
      // Clear pending changes flag
      this.pendingChanges[key] = false;
      
      console.log(`Successfully synced ${key} to server`);
    } catch (error) {
      console.error(`Error syncing ${key} to server:`, error);
    }
  }
  
  /**
   * Dispatch a custom event when storage changes
   */
  private dispatchStorageEvent(key: string): void {
    const event = new CustomEvent("discoveryStorageUpdate", { 
      detail: { key: key }
    });
    window.dispatchEvent(event);
  }
  
  /**
   * Check for new data from the server on initialization
   */
  private checkInitialSync(): void {
    // For each storage key, check if there's newer data on the "server"
    Object.values(STORAGE_KEYS).forEach(key => {
      this.syncFromServer(key);
    });
  }
  
  /**
   * Sync data from the server
   */
  async syncFromServer(key?: string): Promise<void> {
    const keysToSync = key ? [key] : Object.values(STORAGE_KEYS);
    
    for (const syncKey of keysToSync) {
      try {
        // In a real implementation, this would fetch from an API
        // We're simulating with localStorage
        const serverKey = `server_${this.getFullKey(syncKey)}`;
        const serverData = localStorage.getItem(serverKey);
        
        if (serverData) {
          const { data, timestamp, sessionId } = JSON.parse(serverData);
          
          // Only update if the data is from a different session and is newer than our last sync
          if (sessionId !== this.sessionId && (!this.lastSyncTime[syncKey] || timestamp > this.lastSyncTime[syncKey])) {
            console.log(`Found newer data for ${syncKey} from session ${sessionId}`);
            
            // Update local data
            if (data !== null) {
              localStorage.setItem(this.getFullKey(syncKey), JSON.stringify(data));
              
              // Update last sync time
              this.lastSyncTime[syncKey] = timestamp;
              
              // Notify listeners
              this.dispatchStorageEvent(syncKey);
            }
          }
        }
      } catch (error) {
        console.error(`Error syncing ${syncKey} from server:`, error);
      }
    }
  }
  
  /**
   * Listen for changes to a specific key
   * This is useful for components that need to react to storage changes
   */
  subscribe(key: string, callback: () => void): () => void {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.key === key) {
        callback();
      }
    };
    
    window.addEventListener("discoveryStorageUpdate", handler);
    
    // Return unsubscribe function
    return () => {
      window.removeEventListener("discoveryStorageUpdate", handler);
    };
  }
  
  /**
   * Force refresh data from server
   * This is useful for manually triggering a sync
   */
  forceRefresh(): Promise<void> {
    console.log("Forcing refresh of all data from server");
    return this.syncFromServer();
  }
}

// Export the storage keys and singleton instance
export const DISCOVERY_STORAGE_KEYS = STORAGE_KEYS;
export const discoveryStorage = new DiscoveryStorage();
