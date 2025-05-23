
/**
 * DiscoveryStorage Service
 * Central storage service that manages data persistence across devices.
 * This replaces localStorage with a more robust solution.
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

/**
 * The main storage service class
 */
class DiscoveryStorage {
  private readonly storagePrefix = "villamareblu_";
  
  /**
   * Get the full key with prefix
   */
  private getFullKey(key: string): string {
    return `${this.storagePrefix}${key}`;
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
      
      // If not found locally, fetch from discovery storage
      // For now, we'll use localStorage as the "discovery" storage
      // In a real implementation, this would be replaced with API calls
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
      
      // Save to localStorage for now
      localStorage.setItem(this.getFullKey(key), stringValue);
      
      // In a real implementation, this would also save to a central server
      // via API calls
      
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
      
      // In a real implementation, this would also remove from a central server
      
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
      
      // In a real implementation, this would also clear data from a central server
    } catch (error) {
      console.error("Error clearing storage:", error);
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
   * Sync data from the server
   * In a real implementation, this would fetch all data from the central server
   */
  syncFromServer(): Promise<void> {
    return new Promise((resolve) => {
      console.log("Syncing data from server...");
      // For now this is just a placeholder
      // In a real implementation, this would fetch data from a central API
      setTimeout(resolve, 100);
    });
  }
}

// Export the storage keys and singleton instance
export const DISCOVERY_STORAGE_KEYS = STORAGE_KEYS;
export const discoveryStorage = new DiscoveryStorage();
