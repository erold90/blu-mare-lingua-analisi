
import { ApartmentImagesCache } from "./types";
import { imageLoaderService } from "./loader";

/**
 * Handles apartment-specific image operations
 */
export class ApartmentImageService {
  /**
   * Normalize apartment ID for file naming
   */
  normalizeApartmentId(id: string): string {
    return id.toLowerCase().replace(/\s+/g, '-');
  }

  /**
   * Get apartment images from cache
   */
  getApartmentImagesFromCache(apartmentId: string): string[] | null {
    try {
      const storedImagesStr = localStorage.getItem("apartmentImages");
      if (!storedImagesStr) return null;
      
      const storedImages = JSON.parse(storedImagesStr);
      return storedImages[apartmentId] || null;
    } catch (error) {
      console.error("Error retrieving images from cache:", error);
      return null;
    }
  }
  
  /**
   * Cache apartment images
   */
  cacheApartmentImages(apartmentId: string, images: string[]): void {
    try {
      const storedImagesStr = localStorage.getItem("apartmentImages");
      const storedImages = storedImagesStr ? JSON.parse(storedImagesStr) : {};
      
      storedImages[apartmentId] = images;
      localStorage.setItem("apartmentImages", JSON.stringify(storedImages));
      
      // Notify other components about change
      window.dispatchEvent(new CustomEvent("apartmentImagesUpdated"));
    } catch (error) {
      console.error("Error saving images to cache:", error);
    }
  }

  /**
   * Scan for all images for an apartment efficiently
   */
  async scanApartmentImages(apartmentId: string, maxImages = 20): Promise<string[]> {
    console.log(`Scanning images for apartment ${apartmentId}`);
    
    // Check if we already have images in cache
    const cachedAptImages = this.getApartmentImagesFromCache(apartmentId);
    if (cachedAptImages && cachedAptImages.length > 0) {
      console.log(`Found ${cachedAptImages.length} cached images for ${apartmentId}`);
      
      // Preload images in background for faster display
      imageLoaderService.preloadImages(cachedAptImages);
      
      return cachedAptImages;
    }
    
    // Normalize apartment ID
    const normalizedId = this.normalizeApartmentId(apartmentId);
    
    // Base paths to check
    const basePaths = [
      `/images/apartments/${normalizedId}`,
      `/images/apartments/${apartmentId}`
    ];
    
    // Array to store valid paths found
    const validImages: string[] = [];
    
    // Check paths in parallel with concurrency limit
    const checkBatch = async (startIdx: number, endIdx: number, basePath: string) => {
      const batchPromises = [];
      
      for (let i = startIdx; i <= endIdx; i++) {
        const path = `${basePath}/image${i}.jpg`;
        batchPromises.push(
          imageLoaderService.checkImageExists(path).then(exists => {
            if (exists) validImages.push(path);
            return exists;
          })
        );
      }
      
      await Promise.all(batchPromises);
    };
    
    // Check first 5 images of each path first (most likely ones)
    for (const basePath of basePaths) {
      await checkBatch(1, 5, basePath);
    }
    
    // If we found at least one image, continue checking on working path
    if (validImages.length > 0) {
      // Extract base path that worked
      const workingBasePath = validImages[0].substring(0, validImages[0].lastIndexOf('/'));
      
      // Continue checking from number 6 up to maxImages
      await checkBatch(6, maxImages, workingBasePath);
    }
    
    // Sort images numerically
    validImages.sort((a, b) => {
      const numA = parseInt(a.match(/image(\d+)\.jpg/)?.[1] || "0");
      const numB = parseInt(b.match(/image(\d+)\.jpg/)?.[1] || "0");
      return numA - numB;
    });
    
    // Save results to cache
    if (validImages.length > 0) {
      this.cacheApartmentImages(apartmentId, validImages);
      
      // Preload images in background
      imageLoaderService.preloadImages(validImages);
    }
    
    return validImages;
  }
}

export const apartmentImageService = new ApartmentImageService();
