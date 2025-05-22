
import { imageCacheService } from "./cache";
import { imageSessionService } from "./session";

/**
 * Handles image loading and verification
 */
export class ImageLoaderService {
  private loadingPromises: Map<string, Promise<boolean>> = new Map();
  
  /**
   * Check if an image exists at a specific path (with optimized cache)
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

    // Create a new promise for verification
    const checkPromise = new Promise<boolean>(async (resolve) => {
      try {
        // Add timestamp to avoid cache issues
        const timestamp = new Date().getTime();
        const urlWithTimestamp = `${path}?t=${timestamp}`;
        
        // Use fetch with HEAD to verify existence
        const response = await fetch(urlWithTimestamp, { 
          method: 'HEAD',
          cache: 'no-store',
          headers: { 
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        
        const exists = response.ok;
        
        // Update memory cache
        imageCacheService.setItem(path, exists);
        
        resolve(exists);
      } catch (error) {
        console.error('Error verifying image:', error);
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
   * Preload an image in background
   */
  preloadImage(path: string): Promise<boolean> {
    // Avoid preloading already loaded images
    if (imageCacheService.isPreloaded(path)) {
      return Promise.resolve(true);
    }
    
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        imageCacheService.markAsPreloaded(path);
        resolve(true);
      };
      img.onerror = () => resolve(false);
      img.src = this.getImageUrl(path);
    });
  }
  
  /**
   * Preload a group of images in background with concurrency limit
   */
  preloadImages(paths: string[], concurrency = 3): void {
    if (!paths.length) return;
    
    let index = 0;
    const loadNext = () => {
      if (index >= paths.length) return;
      
      const path = paths[index++];
      this.preloadImage(path).finally(() => {
        loadNext(); // Load next when this one is complete
      });
    };
    
    // Start preloading with specified concurrency
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
      img.onload = () => {
        imageCacheService.markAsPreloaded(path);
        resolve(true);
      };
      img.onerror = () => resolve(false);
      
      // Use new timestamp to force reload
      const timestamp = new Date().getTime();
      img.src = `${path}?t=${timestamp}`;
    });
  }
  
  /**
   * Debug an image - adds detailed info about path and availability
   */
  async debugImage(path: string): Promise<void> {
    console.log(`Debugging image path: ${path}`);
    
    try {
      // Check if path is absolute or relative
      const isAbsolutePath = path.startsWith('/');
      console.log(`Image path type: ${isAbsolutePath ? 'absolute' : 'relative'}`);
      
      // Build full path for checking
      const checkPath = isAbsolutePath ? path : `/${path}`;
      console.log(`Full check path: ${checkPath}`);
      
      // Check if image exists in cache
      const cachedStatus = imageCacheService.has(path);
      console.log(`Image in cache: ${cachedStatus ? 'yes' : 'no'}`);
      
      if (cachedStatus) {
        const exists = imageCacheService.getItem(path);
        console.log(`Cached status: image ${exists ? 'exists' : 'does not exist'}`);
      }
      
      // Direct check with fetch to verify existence
      const timestamp = new Date().getTime();
      const urlWithTimestamp = `${path}?t=${timestamp}`;
      
      console.log(`Checking image with URL: ${urlWithTimestamp}`);
      
      try {
        const response = await fetch(urlWithTimestamp, { 
          method: 'HEAD',
          cache: 'no-store',
          headers: { 
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        
        console.log(`Fetch response status: ${response.status} (${response.ok ? 'OK' : 'Failed'})`);
        console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));
        
      } catch (fetchError) {
        console.error(`Fetch error while checking image:`, fetchError);
      }
      
      // Check with Image.onload too
      console.log(`Testing image loading with Image constructor...`);
      const imgTestPromise = new Promise<boolean>((resolve) => {
        const img = new Image();
        img.onload = () => {
          console.log(`Image loaded successfully via Image constructor`);
          resolve(true);
        };
        img.onerror = (error) => {
          console.error(`Failed to load image via Image constructor:`, error);
          resolve(false);
        };
        img.src = urlWithTimestamp;
      });
      
      const imageLoaded = await imgTestPromise;
      console.log(`Final image load test result: ${imageLoaded ? 'Success' : 'Failed'}`);
      
    } catch (error) {
      console.error(`Error during image debugging for ${path}:`, error);
    }
  }
}

export const imageLoaderService = new ImageLoaderService();
