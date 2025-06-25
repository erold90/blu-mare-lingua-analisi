
import { imageCacheService } from "./cache";
import { imageSessionService } from "./session";

/**
 * Handles image loading and verification with improved performance
 */
export class ImageLoaderService {
  private loadingPromises: Map<string, Promise<boolean>> = new Map();
  
  /**
   * Check if an image exists at a specific path (optimized with faster timeouts)
   */
  async checkImageExists(path: string): Promise<boolean> {
    // Check memory cache first
    if (imageCacheService.has(path)) {
      return imageCacheService.getItem(path) || false;
    }
    
    // Reuse promise if check for same path is already in progress
    if (this.loadingPromises.has(path)) {
      return this.loadingPromises.get(path) || false;
    }

    // Create a new promise for verification with faster timeout
    const checkPromise = new Promise<boolean>(async (resolve) => {
      try {
        // Reduced timeout for faster response
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // Reduced from 8s to 3s
        
        const urlWithTimestamp = `${path}?t=${imageSessionService.getSessionTimestamp()}`;
        
        // Use fetch with HEAD to verify existence
        const response = await fetch(urlWithTimestamp, { 
          method: 'HEAD',
          signal: controller.signal,
          cache: 'no-store',
          headers: { 
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        
        clearTimeout(timeoutId);
        const exists = response.ok;
        
        // Update memory cache
        imageCacheService.setItem(path, exists);
        
        resolve(exists);
      } catch (error) {
        // Fail fast on timeout or error
        resolve(false);
      } finally {
        // Remove from loading promises map
        this.loadingPromises.delete(path);
      }
    });
    
    // Store promise in progress
    this.loadingPromises.set(path, checkPromise);
    
    return checkPromise;
  }
  
  /**
   * Preload an image in background with timeout
   */
  preloadImage(path: string): Promise<boolean> {
    // Avoid preloading already loaded images
    if (imageCacheService.isPreloaded(path)) {
      return Promise.resolve(true);
    }
    
    return new Promise((resolve) => {
      const img = new Image();
      
      // Add timeout for preloading
      const timeoutId = setTimeout(() => {
        resolve(false);
      }, 5000); // 5 second timeout for preloading
      
      img.onload = () => {
        clearTimeout(timeoutId);
        imageCacheService.markAsPreloaded(path);
        resolve(true);
      };
      
      img.onerror = () => {
        clearTimeout(timeoutId);
        resolve(false);
      };
      
      img.src = this.getImageUrl(path);
    });
  }
  
  /**
   * Preload a group of images in background with improved concurrency
   */
  preloadImages(paths: string[], concurrency = 2): void {
    if (!paths.length) return;
    
    let index = 0;
    const loadNext = () => {
      if (index >= paths.length) return;
      
      const path = paths[index++];
      this.preloadImage(path).finally(() => {
        loadNext(); // Load next when this one is complete
      });
    };
    
    // Start preloading with reduced concurrency for better performance
    for (let i = 0; i < Math.min(concurrency, paths.length); i++) {
      loadNext();
    }
  }
  
  /**
   * Get full URL for a path with optimized cache busting
   */
  getImageUrl(path: string): string {
    const sessionTimestamp = imageSessionService.getSessionTimestamp();
    return `${path}?t=${sessionTimestamp}`;
  }
  
  /**
   * Force reload an image
   */
  forceReloadImage(path: string): Promise<boolean> {
    // Remove from cache and force new load
    imageCacheService.setItem(path, false);
    
    return new Promise((resolve) => {
      const img = new Image();
      
      const timeoutId = setTimeout(() => {
        resolve(false);
      }, 3000); // Faster timeout
      
      img.onload = () => {
        clearTimeout(timeoutId);
        imageCacheService.markAsPreloaded(path);
        resolve(true);
      };
      
      img.onerror = () => {
        clearTimeout(timeoutId);
        resolve(false);
      };
      
      // Use new timestamp to force reload
      const timestamp = new Date().getTime();
      img.src = `${path}?t=${timestamp}`;
    });
  }
}

export const imageLoaderService = new ImageLoaderService();
