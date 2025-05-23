
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
  private deviceId: string;
  
  constructor() {
    // Generate a unique session ID to identify this browser session
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Get or create a persistent device ID
    this.deviceId = localStorage.getItem('device_id') || `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('device_id', this.deviceId);
    
    console.log(`DiscoveryStorage initialized with session ID: ${this.sessionId}, device ID: ${this.deviceId}`);
    
    // Setup event listeners for storage events from other tabs
    window.addEventListener("storage", this.handleStorageEvent);
    
    // Setup interval to check for updates regularly
    setInterval(() => this.checkForServerUpdates(), 15000);
    
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
   * Check for updates from the server
   */
  private async checkForServerUpdates() {
    try {
      // Check all keys for updates
      for (const key of Object.values(STORAGE_KEYS)) {
        await this.syncFromServer(key);
      }
    } catch (error) {
      console.error("Error checking for server updates:", error);
    }
  }
  
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
      // Add timestamp to data if it's an array of objects
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
        value = value.map(item => {
          // Only add timestamp if it doesn't exist or we're updating
          if (!item.lastUpdated) {
            return { ...item, lastUpdated: Date.now() };
          }
          return item;
        });
      }
      
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
        sessionId: this.sessionId,
        deviceId: this.deviceId
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
          const { data, timestamp, sessionId, deviceId } = JSON.parse(serverData);
          
          // Only update if the data is from a different device or session and is newer than our last sync
          const isFromDifferentDevice = deviceId !== this.deviceId;
          const isFromDifferentSession = sessionId !== this.sessionId;
          const isNewer = (!this.lastSyncTime[syncKey] || timestamp > this.lastSyncTime[syncKey]);
          
          if ((isFromDifferentDevice || isFromDifferentSession) && isNewer) {
            console.log(`Found newer data for ${syncKey} from device ${deviceId}, session ${sessionId}`);
            
            // If it's an array, we need to merge carefully
            if (Array.isArray(data)) {
              const localData = this.getItem(syncKey);
              
              if (Array.isArray(localData) && localData.length > 0 && typeof localData[0] === 'object' && localData[0].id) {
                // This is an array of objects with IDs, merge by ID
                const mergedData = this.mergeArraysByLastUpdated(localData, data);
                localStorage.setItem(this.getFullKey(syncKey), JSON.stringify(mergedData));
              } else {
                // Simple array, just replace
                localStorage.setItem(this.getFullKey(syncKey), JSON.stringify(data));
              }
            } else if (data !== null) {
              // For non-arrays, just update local data
              localStorage.setItem(this.getFullKey(syncKey), JSON.stringify(data));
            }
            
            // Update last sync time
            this.lastSyncTime[syncKey] = timestamp;
            
            // Notify listeners
            this.dispatchStorageEvent(syncKey);
          }
        }
      } catch (error) {
        console.error(`Error syncing ${syncKey} from server:`, error);
      }
    }
  }

  /**
   * Helper method to merge arrays by comparing lastUpdated timestamps
   */
  private mergeArraysByLastUpdated<T extends { id: string; lastUpdated?: number }>(
    localArray: T[],
    remoteArray: T[]
  ): T[] {
    // Create a map of all items by ID
    const mergedMap = new Map<string, T>();
    
    // Add local items to map
    localArray.forEach(item => {
      mergedMap.set(item.id, item);
    });
    
    // Add or update with remote items if they are newer
    remoteArray.forEach(remoteItem => {
      const localItem = mergedMap.get(remoteItem.id);
      
      if (!localItem) {
        // Item doesn't exist locally, add it
        mergedMap.set(remoteItem.id, remoteItem);
      } else if (
        remoteItem.lastUpdated && 
        localItem.lastUpdated && 
        remoteItem.lastUpdated > localItem.lastUpdated
      ) {
        // Remote item is newer, use it
        mergedMap.set(remoteItem.id, remoteItem);
      }
    });
    
    // Convert map back to array
    return Array.from(mergedMap.values());
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
  async forceRefresh(): Promise<void> {
    console.log("Forcing refresh of all data from server");
    return this.syncFromServer();
  }
}

// Export the storage keys and singleton instance
export const DISCOVERY_STORAGE_KEYS = STORAGE_KEYS;
export const discoveryStorage = new DiscoveryStorage();
