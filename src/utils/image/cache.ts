
import { ImageCache } from "./types";
import { toast } from "sonner";

// Cache constants - increased validity
const IMAGE_CACHE_KEY = "imageCache";
const IMAGE_TIMESTAMP_KEY = "imageCacheTimestamp";
const CACHE_VALIDITY_HOURS = 48; // Increased to 48 hours for better performance

/**
 * Handles image cache operations with improved performance
 */
class ImageCacheService {
  private imageExistenceCache: Map<string, boolean> = new Map();
  private preloadedImages: Set<string> = new Set();
  private saveTimeoutId: number | null = null;

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
        
        // Use cache if recent
        if (hoursSinceCache < CACHE_VALIDITY_HOURS) {
          const data = JSON.parse(cachedData);
          
          // Populate memory cache
          Object.entries(data).forEach(([path, exists]) => {
            this.imageExistenceCache.set(path, exists as boolean);
          });
          
        } else {
          this.clearCache(); // Clear expired cache
        }
      }
    } catch (error) {
    }
  }

  /**
   * Saves image cache to localStorage with debouncing
   */
  saveCache(): void {
    // Clear existing timeout
    if (this.saveTimeoutId) {
      clearTimeout(this.saveTimeoutId);
    }
    
    // Debounce cache saves for better performance
    this.saveTimeoutId = window.setTimeout(() => {
      try {
        const data: Record<string, boolean> = {};
        
        // Convert Map to object for localStorage
        this.imageExistenceCache.forEach((exists, path) => {
          data[path] = exists;
        });
        
        localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(IMAGE_TIMESTAMP_KEY, String(new Date().getTime()));
        
      } catch (error) {
      }
    }, 1000); // 1 second debounce
  }

  /**
   * Get an item from the cache
   */
  getItem(path: string): boolean | undefined {
    return this.imageExistenceCache.get(path);
  }

  /**
   * Set an item in the cache with immediate save
   */
  setItem(path: string, exists: boolean): void {
    this.imageExistenceCache.set(path, exists);
    
    // Save cache more frequently for immediate updates
    if (this.imageExistenceCache.size % 5 === 0) {
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
