
/**
 * Types for the image service
 */

// Cache entry type
export interface ImageCacheEntry {
  exists: boolean;
  timestamp: number;
}

// Image cache structure
export interface ImageCache {
  [path: string]: boolean;
}

// Apartment images cache structure
export interface ApartmentImagesCache {
  [apartmentId: string]: string[];
}
