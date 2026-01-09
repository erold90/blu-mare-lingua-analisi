
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
   * Scan for all apartment images - Only use Supabase
   */
  async scanApartmentImages(apartmentId: string, maxImages = 20): Promise<string[]> {
    
    const supabaseImages = await supabaseImageService.getApartmentImages(apartmentId);
    
    if (supabaseImages.length > 0) {
      return supabaseImages;
    }
    
    return [];
  }
  
  /**
   * Get apartment images from cache - Only use Supabase
   */
  async getApartmentImagesFromCache(apartmentId: string): Promise<string[]> {
    const hasSupabaseImages = await supabaseImageService.hasImages(apartmentId);
    
    if (hasSupabaseImages) {
      return await supabaseImageService.getApartmentImages(apartmentId);
    }
    
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
   * Get cover image for apartment - Only use Supabase
   */
  async getCoverImage(apartmentId: string): Promise<string | null> {
    
    const coverImage = await supabaseImageService.getCoverImage(apartmentId);
    
    if (coverImage) {
      return coverImage;
    }
    
    return null;
  }

  /**
   * Update favicon in document with optimized cache busting
   */
  updateFavicon(faviconPath: string): void {
    if (!faviconPath) return;
    
    
    try {
      const timestamp = new Date().getTime();
      let finalPath = faviconPath;
      
      if (!finalPath.includes('?')) {
        finalPath = `${finalPath}?v=${timestamp}`;
      }
      
      
      const existingFavicons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
      
      if (existingFavicons.length > 0) {
        existingFavicons.forEach((favicon) => {
          const linkElement = favicon as HTMLLinkElement;
          linkElement.href = finalPath;
        });
      } else {
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
        });
      }
      
    } catch (error) {
    }
  }
}

// Export single instance
export const imageService = new ImageService();
