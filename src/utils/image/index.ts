
import { imageLoaderService } from "./loader";
import { apartmentImageService } from "./apartment";
import { imageCacheService } from "./cache";
import { imageSessionService } from "./session";

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
   * Scan for all apartment images
   */
  scanApartmentImages(apartmentId: string, maxImages = 20): Promise<string[]> {
    return apartmentImageService.scanApartmentImages(apartmentId, maxImages);
  }
  
  /**
   * Get apartment images from cache
   */
  getApartmentImagesFromCache(apartmentId: string): string[] | null {
    return apartmentImageService.getApartmentImagesFromCache(apartmentId);
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
   * Update favicon in document
   */
  updateFavicon(faviconPath: string): void {
    if (!faviconPath) return;
    
    console.log("Updating favicon to:", faviconPath);
    
    try {
      // Handle favicon.ico at root level specially
      const finalPath = faviconPath === '/favicon.ico' ? faviconPath : this.getImageUrl(faviconPath);
      
      // Get all existing favicon links
      const existingFavicons = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
      
      // If there are existing favicons, update the href of each one
      if (existingFavicons.length > 0) {
        existingFavicons.forEach((favicon) => {
          const linkElement = favicon as HTMLLinkElement;
          linkElement.href = finalPath;
          console.log("Updated existing favicon link:", linkElement.rel);
        });
        return;
      }
      
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
      
      // Force browser to refresh favicon by creating a temporary favicon
      const tempLink = document.createElement('link');
      tempLink.rel = 'icon';
      tempLink.href = 'data:,'; // Empty favicon
      document.head.appendChild(tempLink);
      setTimeout(() => tempLink.remove(), 10); // Remove after a short delay
      
    } catch (error) {
      console.error("Error updating favicon:", error);
    }
  }
}

// Export single instance
export const imageService = new ImageService();
