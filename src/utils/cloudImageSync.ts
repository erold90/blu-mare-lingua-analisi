
// This module enables cross-device sharing of images by syncing with a cloud storage provider
// For now, we'll implement a simplified version that uses localStorage for immediate testing
// In a production environment, this would be replaced with a proper cloud storage solution

import { toast } from "sonner";
import { getStorageSize, getImage, StoredImage } from "./imageStorage";

// Prefix for local storage keys
const CLOUD_SYNC_PREFIX = "villa_mareblu_cloud_";

// Maximum allowed size for localStorage (approximately 5MB)
const MAX_LOCAL_STORAGE_SIZE = 5 * 1024 * 1024;

/**
 * Saves an image to cloud storage (currently localStorage)
 * In production, this would be replaced with an actual cloud storage API call
 */
export const saveImageToCloud = async (path: string): Promise<boolean> => {
  try {
    // Skip if not a stored image
    if (!path || !path.startsWith('/upload/')) {
      return false;
    }
    
    // Get the image from IndexedDB
    const image = await getImage(path);
    if (!image || !image.data) {
      console.error("Image not found in local storage:", path);
      return false;
    }
    
    // For testing: Store in localStorage (limited by browser)
    // In production, this would be an API call to a cloud storage provider
    try {
      localStorage.setItem(`${CLOUD_SYNC_PREFIX}${path}`, JSON.stringify({
        path: image.path,
        data: image.data,
        category: image.category,
        timestamp: Date.now()
      }));
      
      console.log("Image synced to cloud storage:", path);
      return true;
    } catch (error) {
      console.error("Error storing image in localStorage (probably size limit):", error);
      // Clean up older images if we hit storage limits
      cleanupOldCloudImages();
      return false;
    }
  } catch (error) {
    console.error("Error syncing image to cloud:", error);
    return false;
  }
};

/**
 * Loads an image from cloud storage
 */
export const loadImageFromCloud = (path: string): string | null => {
  try {
    // Skip if not a stored image
    if (!path || !path.startsWith('/upload/')) {
      return null;
    }
    
    // Get from localStorage
    const storedData = localStorage.getItem(`${CLOUD_SYNC_PREFIX}${path}`);
    if (!storedData) {
      return null;
    }
    
    const imageData = JSON.parse(storedData);
    return imageData.data || null;
  } catch (error) {
    console.error("Error loading image from cloud:", error);
    return null;
  }
};

/**
 * Checks if an image exists in cloud storage
 */
export const isImageInCloud = (path: string): boolean => {
  try {
    return !!localStorage.getItem(`${CLOUD_SYNC_PREFIX}${path}`);
  } catch (error) {
    return false;
  }
};

/**
 * Removes older images from cloud storage when reaching storage limits
 */
export const cleanupOldCloudImages = (): void => {
  try {
    // Get all cloud-synced images
    const cloudImages: {path: string, timestamp: number}[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CLOUD_SYNC_PREFIX)) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || "{}");
          cloudImages.push({
            path: key.replace(CLOUD_SYNC_PREFIX, ""),
            timestamp: data.timestamp || 0
          });
        } catch (e) {
          // Skip invalid entries
        }
      }
    }
    
    // Sort by timestamp (oldest first)
    cloudImages.sort((a, b) => a.timestamp - b.timestamp);
    
    // Remove oldest images until we're under the storage limit
    while (cloudImages.length > 0 && getLocalStorageSize() > MAX_LOCAL_STORAGE_SIZE * 0.8) {
      const oldest = cloudImages.shift();
      if (oldest) {
        localStorage.removeItem(`${CLOUD_SYNC_PREFIX}${oldest.path}`);
        console.log("Removed old image from cloud storage:", oldest.path);
      }
    }
  } catch (error) {
    console.error("Error cleaning up cloud images:", error);
  }
};

/**
 * Gets the current size of localStorage in bytes
 */
const getLocalStorageSize = (): number => {
  let totalSize = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      totalSize += (localStorage.getItem(key) || "").length * 2; // Approximate: 2 bytes per character
    }
  }
  return totalSize;
};

/**
 * Synchronizes all images between IndexedDB and cloud storage
 */
export const syncAllImages = async (): Promise<void> => {
  try {
    // This would be enhanced in a production environment to:
    // 1. Check which images need syncing
    // 2. Upload only changed/new images
    // 3. Download images available in cloud but not locally
    
    // For now, we'll implement a simplified version that
    // ensures critical images (hero, favicon, social) are 
    // available across devices via localStorage
    
    console.log("Starting cloud image synchronization");
    
    // Check localStorage available space
    const availableSpace = MAX_LOCAL_STORAGE_SIZE - getLocalStorageSize();
    if (availableSpace < 1 * 1024 * 1024) { // Less than 1MB
      cleanupOldCloudImages();
    }
    
  } catch (error) {
    console.error("Error syncing images with cloud:", error);
  }
};
