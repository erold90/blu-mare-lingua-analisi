
import { ImageCache } from "./types";
import { toast } from "sonner";

// Cache constants
const IMAGE_CACHE_KEY = "imageCache";
const IMAGE_TIMESTAMP_KEY = "imageCacheTimestamp";
const CACHE_VALIDITY_HOURS = 24; // Cache valid for 24 hours

/**
 * Handles image cache operations
 */
class ImageCacheService {
  private imageExistenceCache: Map<string, boolean> = new Map();
  private preloadedImages: Set<string> = new Set();

  constructor() {
    this.loadCacheFromStorage();
  }

  /**
   * Loads image cache from localStorage
   */
  loadCacheFromStorage(): void {
    try {
      const cachedData = localStorage.getItem(IMAGE_CACHE_KEY);
      const timestamp = localStorage.getItem(IMAGE_TIMESTAMP_KEY);
      
      if (cachedData && timestamp) {
        const currentTime = new Date().getTime();
        const cacheTime = Number(timestamp);
        const hoursSinceCache = (currentTime - cacheTime) / (1000 * 60 * 60);
        
        // Use cache only if recent
        if (hoursSinceCache < CACHE_VALIDITY_HOURS) {
          const data = JSON.parse(cachedData);
          
          // Populate memory cache
          Object.entries(data).forEach(([path, exists]) => {
            this.imageExistenceCache.set(path, exists as boolean);
          });
          
          console.log(`Image cache loaded with ${this.imageExistenceCache.size} items`);
        } else {
          console.log("Image cache expired, will be rebuilt");
          this.clearCache(); // Clear expired cache
        }
      }
    } catch (error) {
      console.error("Error loading image cache:", error);
    }
  }

  /**
   * Saves image cache to localStorage
   */
  saveCache(): void {
    try {
      const data: Record<string, boolean> = {};
      
      // Convert Map to object for localStorage
      this.imageExistenceCache.forEach((exists, path) => {
        data[path] = exists;
      });
      
      localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(IMAGE_TIMESTAMP_KEY, String(new Date().getTime()));
      
      console.log(`Image cache saved with ${Object.keys(data).length} items`);
    } catch (error) {
      console.error("Error saving image cache:", error);
    }
  }

  /**
   * Get an item from the cache
   */
  getItem(path: string): boolean | undefined {
    return this.imageExistenceCache.get(path);
  }

  /**
   * Set an item in the cache
   */
  setItem(path: string, exists: boolean): void {
    this.imageExistenceCache.set(path, exists);
    
    // Save cache periodically (every 10 new entries)
    if (this.imageExistenceCache.size % 10 === 0) {
      this.saveCache();
    }
  }

  /**
   * Check if an item is in the cache
   */
  has(path: string): boolean {
    return this.imageExistenceCache.has(path);
  }

  /**
   * Clear the entire image cache
   */
  clearCache(): void {
    console.log("Clearing image cache...");
    
    // Clear memory caches
    this.imageExistenceCache.clear();
    this.preloadedImages.clear();
    
    // Remove from localStorage
    localStorage.removeItem(IMAGE_CACHE_KEY);
    localStorage.removeItem(IMAGE_TIMESTAMP_KEY);
    localStorage.removeItem("apartmentImages");
    
    // Clear browser's Cache API if available
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          if (cacheName.includes('image')) {
            caches.delete(cacheName);
          }
        });
      });
    }
    
    toast.success("Image cache cleared successfully");
  }

  /**
   * Check if an image has been preloaded
   */
  isPreloaded(path: string): boolean {
    return this.preloadedImages.has(path);
  }

  /**
   * Mark an image as preloaded
   */
  markAsPreloaded(path: string): void {
    this.preloadedImages.add(path);
  }
}

export const imageCacheService = new ImageCacheService();
