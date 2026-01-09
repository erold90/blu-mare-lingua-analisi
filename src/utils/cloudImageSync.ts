// This module enables cross-device sharing of images by syncing with a cloud storage provider
// In this implementation, we use a PHP API hosted on Aruba Linux Hosting

import { toast } from "sonner";
import { getStorageSize, getImage, StoredImage } from "./imageStorage";

// API endpoint base URL (modificare con il tuo dominio)
const API_ENDPOINT = "https://tuodominio.it/api/images";

// Prefix for image identifiers
const CLOUD_SYNC_PREFIX = "villa_mareblu_cloud_";

/**
 * Saves an image to cloud storage via API
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
      return false;
    }
    
    // Prepare data for API
    const formData = new FormData();
    formData.append('action', 'save');
    formData.append('path', path);
    formData.append('data', image.data);
    formData.append('category', image.category || 'general');
    formData.append('timestamp', Date.now().toString());
    
    // Send to server via fetch API
    const response = await fetch(`${API_ENDPOINT}/store.php`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${await response.text()}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      return true;
    } else {
      throw new Error(result.message || "Unknown error storing image");
    }
  } catch (error) {
    toast.error("Errore nel salvataggio dell'immagine: " + (error as Error).message);
    return false;
  }
};

/**
 * Loads an image from cloud storage
 */
export const loadImageFromCloud = async (path: string): Promise<string | null> => {
  try {
    // Skip if not a stored image
    if (!path || !path.startsWith('/upload/')) {
      return null;
    }
    
    // Request image from server
    const response = await fetch(`${API_ENDPOINT}/retrieve.php?path=${encodeURIComponent(path)}`);
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success && result.data) {
      return result.data;
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Checks if an image exists in cloud storage
 */
export const isImageInCloud = async (path: string): Promise<boolean> => {
  try {
    if (!path || !path.startsWith('/upload/')) {
      return false;
    }
    
    const response = await fetch(`${API_ENDPOINT}/check.php?path=${encodeURIComponent(path)}`);
    
    if (!response.ok) {
      return false;
    }
    
    const result = await response.json();
    return result.exists === true;
  } catch (error) {
    return false;
  }
};

/**
 * Removes older images from cloud storage when reaching storage limits
 */
export const cleanupOldCloudImages = async (): Promise<void> => {
  try {
    const response = await fetch(`${API_ENDPOINT}/cleanup.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'cleanup',
        maxImages: 50 // Imposta il numero massimo di immagini da mantenere
      })
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
    } else {
    }
  } catch (error) {
  }
};

/**
 * Synchronizes all images between IndexedDB and cloud storage
 */
export const syncAllImages = async (): Promise<void> => {
  try {
    
    // 1. Get all critical images (home, hero, social, favicon)
    const categories = ['home', 'hero', 'social', 'favicon'];
    let syncCount = 0;
    
    // For each category, get images from IndexedDB and sync to cloud
    for (const category of categories) {
      try {
        // Get images from IndexedDB with that category
        const db = await openIndexedDB();
        const transaction = db.transaction(['images'], 'readonly');
        const store = transaction.objectStore('images');
        const categoryIndex = store.index('category');
        const request = categoryIndex.getAllKeys(category);
        
        request.onsuccess = async () => {
          const imagePaths = request.result as string[];
          
          // Sync each image to cloud
          for (const path of imagePaths) {
            if (typeof path === 'string' && path.startsWith('/upload/')) {
              const synced = await saveImageToCloud(path);
              if (synced) syncCount++;
            }
          }
          
          if (syncCount > 0) {
            toast.success(`Sincronizzate ${syncCount} immagini con il cloud`);
          }
        };
        
        transaction.oncomplete = () => {
          db.close();
        };
      } catch (error) {
      }
    }
  } catch (error) {
  }
};

/**
 * Opens the IndexedDB database
 */
const openIndexedDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('villaMarePluImages', 1);
    
    request.onerror = () => {
      reject(request.error);
    };
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains('images')) {
        const store = db.createObjectStore('images', { keyPath: 'path' });
        store.createIndex('category', 'category', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
};
