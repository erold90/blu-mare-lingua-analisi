import { imageLoaderService } from "./loader";
import { apartmentImageService } from "./apartment";
import { imageCacheService } from "./cache";
import { imageSessionService } from "./session";
import { supabaseImageService } from "./supabase";

/**
 * Main image service that combines functionality from specialized services
 */
class ImageService {
  /**
   * Check if an image exists at a specific path
   */
  checkImageExists(path: string): Promise<boolean> {
    return imageLoaderService.checkImageExists(path);
  }
  
  /**
   * Preload an image in background
   */
  preloadImage(path: string): Promise<boolean> {
    return imageLoaderService.preloadImage(path);
  }
  
  /**
   * Preload a group of images in background
   */
  preloadImages(paths: string[], concurrency = 3): void {
    imageLoaderService.preloadImages(paths, concurrency);
  }
  
  /**
   * Get URL with cache busting parameter
   */
  getImageUrl(path: string): string {
    // For root-level favicon.ico, don't add cache busting parameter
    if (path === '/favicon.ico') {
      return path;
    }
    return imageLoaderService.getImageUrl(path);
  }
  
  /**
   * Force reload an image
   */
  forceReloadImage(path: string): Promise<boolean> {
    return imageLoaderService.forceReloadImage(path);
  }
  
  /**
   * Reset session timestamp
   */
  resetSessionTimestamp(): void {
    imageSessionService.resetSessionTimestamp();
  }
  
  /**
   * Clear image cache
   */
  clearImageCache(): void {
    imageCacheService.clearCache();
    this.resetSessionTimestamp();
  }
  
  /**
   * Normalize apartment ID for files
   */
  normalizeApartmentId(id: string): string {
    return apartmentImageService.normalizeApartmentId(id);
  }
  
  /**
   * Scan for all apartment images - UPDATED: Only use Supabase, no file system fallback
   */
  async scanApartmentImages(apartmentId: string, maxImages = 20): Promise<string[]> {
    console.log(`Scanning images for apartment ${apartmentId} - using only Supabase`);
    
    // Only get images from Supabase
    const supabaseImages = await supabaseImageService.getApartmentImages(apartmentId);
    
    if (supabaseImages.length > 0) {
      console.log(`Found ${supabaseImages.length} images in Supabase for apartment ${apartmentId}`);
      return supabaseImages;
    }
    
    console.log(`No images found in Supabase for apartment ${apartmentId}`);
    return [];
  }
  
  /**
   * Get apartment images from cache - UPDATED: Only use Supabase
   */
  async getApartmentImagesFromCache(apartmentId: string): Promise<string[]> {
    // Only check Supabase images
    const hasSupabaseImages = await supabaseImageService.hasImages(apartmentId);
    
    if (hasSupabaseImages) {
      return await supabaseImageService.getApartmentImages(apartmentId);
    }
    
    // Return empty array if no Supabase images
    return [];
  }
  
  /**
   * Cache apartment images
   */
  cacheApartmentImages(apartmentId: string, images: string[]): void {
    apartmentImageService.cacheApartmentImages(apartmentId, images);
  }
  
  /**
   * Debug an image
   */
  debugImage(path: string): Promise<void> {
    return imageLoaderService.debugImage(path);
  }

  /**
   * Get cover image for apartment - UPDATED: Only use Supabase
   */
  async getCoverImage(apartmentId: string): Promise<string | null> {
    console.log(`Getting cover image for apartment ${apartmentId} from Supabase only`);
    
    const coverImage = await supabaseImageService.getCoverImage(apartmentId);
    
    if (coverImage) {
      console.log(`Found cover image in Supabase for apartment ${apartmentId}`);
      return coverImage;
    }
    
    console.log(`No cover image found in Supabase for apartment ${apartmentId}`);
    return null;
  }

  /**
   * Update favicon in document with hard browser cache busting
   */
  updateFavicon(faviconPath: string): void {
    if (!faviconPath) return;
    
    console.log("Updating favicon to:", faviconPath);
    
    try {
      // Add a timestamp or version to force cache refresh
      const timestamp = new Date().getTime();
      let finalPath = faviconPath;
      
      // Add cache busting parameter if not already present
      if (!finalPath.includes('?')) {
        finalPath = `${finalPath}?v=${timestamp}`;
      }
      
      console.log("Final favicon path:", finalPath);
      
      // Get all existing favicon links
      const existingFavicons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
      
      // If there are existing favicons, update the href of each one
      if (existingFavicons.length > 0) {
        existingFavicons.forEach((favicon) => {
          const linkElement = favicon as HTMLLinkElement;
          linkElement.href = finalPath;
          console.log("Updated existing favicon link:", linkElement.rel);
        });
      } else {
        // If no favicon exists, create both standard and shortcut icons
        const iconTypes = [
          { rel: 'icon', type: 'image/x-icon' },
          { rel: 'shortcut icon', type: 'image/x-icon' }
        ];
        
        iconTypes.forEach(iconType => {
          const link = document.createElement('link');
          link.rel = iconType.rel;
          link.href = finalPath;
          link.type = faviconPath.endsWith('.ico') ? 'image/x-icon' : 'image/png';
          document.head.appendChild(link);
          console.log(`Created new ${iconType.rel} link`);
        });
      }
      
      // Advanced browser cache busting technique
      // 1. Create a temporary favicon with a data URL
      const tempLink = document.createElement('link');
      tempLink.rel = 'icon';
      tempLink.href = 'data:,'; // Empty favicon
      document.head.appendChild(tempLink);
      
      // 2. Remove it after a short delay to trigger a refresh
      setTimeout(() => {
        document.head.removeChild(tempLink);
        
        // 3. Force favicon reload with additional technique
        const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
        if (link) {
          const clone = link.cloneNode(true) as HTMLLinkElement;
          link.parentNode?.replaceChild(clone, link);
          console.log("Forced favicon refresh with node replacement");
        }
      }, 50);
      
    } catch (error) {
      console.error("Error updating favicon:", error);
    }
  }
}

// Export single instance
export const imageService = new ImageService();
